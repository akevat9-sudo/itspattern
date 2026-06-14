"""
YouMatter Connection System
---------------------------
A standalone, reusable connection manager for ServerByt (SFTP/SSH/MySQL Tunnel),
Oracle Cloud (SSH), and Firebase (Firestore).

This can be imported into other Python scripts or run directly as a CLI diagnostic tool.

Usage (Importing):
    from connection_system import ConnectionManager
    
    mgr = ConnectionManager()
    
    # 1. SSH / SFTP
    sftp = mgr.get_sftp_client('serverbyt')
    files = sftp.listdir('public_html/itspattern')
    
    # 2. MySQL via SSH Tunnel
    mgr.start_mysql_tunnel()
    conn = mgr.get_mysql_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT VERSION()")
        print(cursor.fetchone())
        
    # 3. Firebase Firestore
    db = mgr.get_firestore_client()
    doc = db.collection("connection_tests").document("connect_all").get()
    
    # 4. Stop Tunnel
    mgr.stop_mysql_tunnel()
"""

import os
import sys
import json
import socket
import select
import threading
import time
from pathlib import Path
import pymysql
import paramiko
import firebase_admin
from firebase_admin import credentials, firestore

# Default paths
DEFAULT_PROFILES_DIR = Path("C:/Users/Akeva/Downloads/Diet")

class ConnectionManager:
    def __init__(self, base_dir=None):
        """
        Initializes the ConnectionManager by resolving paths and loading connection profiles.
        """
        self.base_dir = Path(base_dir) if base_dir else self._detect_base_dir()
        self.profiles_dir = self.base_dir / "connection_profiles"
        
        self.profiles = {}
        self._load_profiles()
        
        self.tunnel_transport = None
        self.tunnel_server_socket = None
        self.tunnel_thread = None
        self.tunnel_running = False
        
    def _detect_base_dir(self):
        """Helper to auto-detect the base configuration directory."""
        # Check environment variable first
        env_dir = os.environ.get("DIET_DIR")
        if env_dir and Path(env_dir).exists():
            return Path(env_dir)
        
        # Check current directory's parent or known standard directory
        local_profiles = Path("connection_profiles")
        if local_profiles.exists():
            return Path(".").resolve()
            
        parent_profiles = Path("../Diet/connection_profiles")
        if parent_profiles.exists():
            return Path("../Diet").resolve()
            
        if DEFAULT_PROFILES_DIR.exists():
            return DEFAULT_PROFILES_DIR
            
        raise FileNotFoundError(
            "Could not locate connection_profiles folder. Please pass base_dir to ConnectionManager."
        )

    def _load_profiles(self):
        """Loads SFTP, MySQL, and Oracle Cloud profiles from JSON files."""
        for name in ("serverbyt_sftp", "serverbyt_mysql", "oracle_cloud"):
            p_file = self.profiles_dir / f"{name}.json"
            if p_file.exists():
                try:
                    self.profiles[name] = json.loads(p_file.read_text())
                except Exception as e:
                    print(f"Warning: Failed to parse {p_file.name}: {e}")
                    self.profiles[name] = None
            else:
                self.profiles[name] = None

    def _resolve_key_path(self, relative_key_path):
        """Resolves ssh private key paths relative to the connection_profiles directory."""
        path = (self.profiles_dir / relative_key_path).resolve()
        if not path.exists():
            # Try loading directly from base_dir
            path = (self.base_dir / relative_key_path).resolve()
        if not path.exists():
            # Try relative to the current working directory
            path = Path(relative_key_path).resolve()
        if not path.exists():
            raise FileNotFoundError(f"SSH private key file not found: {relative_key_path}")
        return path

    def _resolve_firebase_key(self):
        """Resolves the firebase service account key json path."""
        candidates = [
            self.base_dir / "firebase_key.json",
            self.base_dir / "backend" / "firebase_key.json",
            Path("firebase_key.json").resolve(),
            Path("C:/Users/Akeva/Downloads/itspattern-firebase-adminsdk-fbsvc-562ad68f84.json").resolve(),
        ]
        for c in candidates:
            if c.exists():
                return c
        return None

    def get_ssh_client(self, service='serverbyt'):
        """
        Creates and returns an active paramiko SSHClient connection.
        service can be: 'serverbyt' or 'oracle'.
        """
        if service == 'serverbyt':
            profile = self.profiles.get("serverbyt_sftp")
        elif service in ('oracle', 'oracle_cloud'):
            profile = self.profiles.get("oracle_cloud")
        else:
            raise ValueError(f"Unknown SSH service: {service}")

        if not profile:
            raise ValueError(f"Profile config for '{service}' not found.")

        host = profile["host"]
        port = profile.get("port", 22)
        username = profile["username"]
        key_path = self._resolve_key_path(profile["private_key_file"])

        key = paramiko.RSAKey.from_private_key_file(str(key_path))
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(host, port=port, username=username, pkey=key, timeout=10)
        return client

    def get_sftp_client(self, service='serverbyt'):
        """
        Creates and returns an active paramiko SFTPClient.
        service can be: 'serverbyt' or 'oracle'.
        """
        client = self.get_ssh_client(service)
        return client.open_sftp()

    def start_mysql_tunnel(self, local_port=3307):
        """
        Starts the SSH Tunnel for MySQL in a background thread if it is not already running.
        """
        if self.tunnel_running:
            return local_port

        mp = self.profiles.get("serverbyt_mysql")
        if not mp or "ssh_tunnel" not in mp:
            raise ValueError("MySQL SSH tunnel configuration not found in profiles.")

        tunnel_cfg = mp["ssh_tunnel"]
        ssh_host = tunnel_cfg["ssh_host"]
        ssh_port = tunnel_cfg.get("ssh_port", 22)
        ssh_user = tunnel_cfg["ssh_user"]
        key_path = self._resolve_key_path(tunnel_cfg["ssh_key"])
        remote_host = tunnel_cfg["remote_host"]
        remote_port = tunnel_cfg.get("remote_port", 3306)

        key = paramiko.RSAKey.from_private_key_file(str(key_path))
        self.tunnel_transport = paramiko.Transport((ssh_host, ssh_port))
        self.tunnel_transport.connect(username=ssh_user, pkey=key)

        self.tunnel_server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.tunnel_server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.tunnel_server_socket.bind(("127.0.0.1", local_port))
        self.tunnel_server_socket.listen(100)

        self.tunnel_running = True

        def _pipe(a, b):
            try:
                chan = self.tunnel_transport.open_channel("direct-tcpip", b, a.getpeername())
            except Exception:
                a.close()
                return
            if chan is None:
                a.close()
                return
            while self.tunnel_running:
                try:
                    r, _, _ = select.select([a, chan], [], [], 0.5)
                    if a in r:
                        data = a.recv(4096)
                        if not data:
                            break
                        chan.send(data)
                    if chan in r:
                        data = chan.recv(4096)
                        if not data:
                            break
                        a.send(data)
                except Exception:
                    break
            a.close()
            chan.close()

        def _accept_loop():
            while self.tunnel_running:
                try:
                    self.tunnel_server_socket.settimeout(1.0)
                    client_sock, _ = self.tunnel_server_socket.accept()
                    t = threading.Thread(
                        target=_pipe, 
                        args=(client_sock, (remote_host, remote_port)),
                        daemon=True
                    )
                    t.start()
                except socket.timeout:
                    continue
                except Exception:
                    break

        self.tunnel_thread = threading.Thread(target=_accept_loop, daemon=True)
        self.tunnel_thread.start()
        time.sleep(1.0) # Allow tunnel to initialize
        return local_port

    def stop_mysql_tunnel(self):
        """Stops the active MySQL SSH Tunnel."""
        self.tunnel_running = False
        if self.tunnel_server_socket:
            try:
                self.tunnel_server_socket.close()
            except Exception:
                pass
            self.tunnel_server_socket = None
        if self.tunnel_transport:
            try:
                self.tunnel_transport.close()
            except Exception:
                pass
            self.tunnel_transport = None
        self.tunnel_thread = None

    def get_mysql_connection(self, local_port=3307):
        """
        Connects to MySQL through the local tunnel port and returns a pymysql connection.
        Make sure to start the tunnel first.
        """
        mp = self.profiles.get("serverbyt_mysql")
        if not mp:
            raise ValueError("MySQL profile configuration not found.")
        
        user = mp["username"]
        password = mp["password"]
        db = mp["database"]

        return pymysql.connect(
            host="127.0.0.1",
            port=local_port,
            user=user,
            password=password,
            database=db,
            connect_timeout=10
        )

    def get_firestore_client(self):
        """
        Initializes the Firebase Admin SDK and returns a Firestore Client instance.
        """
        key_path = self._resolve_firebase_key()
        if not key_path:
            raise FileNotFoundError("firebase_key.json credentials file not found.")

        try:
            app = firebase_admin.get_app()
        except ValueError:
            cred = credentials.Certificate(str(key_path))
            app = firebase_admin.initialize_app(cred)

        return firestore.client(app=app)

    def run_diagnostics(self):
        """Runs health checks on all systems and returns a dict with status details."""
        results = {}

        # 1. ServerByt SSH/SFTP
        try:
            client = self.get_ssh_client('serverbyt')
            _, stdout, _ = client.exec_command("echo OK")
            output = stdout.read().decode().strip()
            client.close()
            results['ServerByt SFTP'] = (True, f"Connected (Response: {output})")
        except Exception as e:
            results['ServerByt SFTP'] = (False, str(e))

        # 2. Oracle Cloud SSH/SFTP
        try:
            client = self.get_ssh_client('oracle')
            _, stdout, _ = client.exec_command("echo OK")
            output = stdout.read().decode().strip()
            client.close()
            results['Oracle Cloud SFTP'] = (True, f"Connected (Response: {output})")
        except Exception as e:
            results['Oracle Cloud SFTP'] = (False, str(e))

        # 3. Oracle Backend HTTP Health
        try:
            import urllib.request
            req = urllib.request.Request("http://80.225.219.29:8000/health")
            with urllib.request.urlopen(req, timeout=5) as resp:
                if resp.status == 200:
                    data = json.loads(resp.read().decode())
                    results['Oracle Backend'] = (True, f"Online ({data.get('status', 'operational')})")
                else:
                    results['Oracle Backend'] = (False, f"HTTP Status {resp.status}")
        except Exception as e:
            results['Oracle Backend'] = (False, f"Unreachable: {e}")

        # 4. Firebase / Firestore
        try:
            db = self.get_firestore_client()
            snap = db.collection("connection_tests").document("connect_all").get(timeout=5)
            status = "document exists" if snap.exists else "authenticated successfully"
            results['Firebase'] = (True, f"Connected ({status})")
        except Exception as e:
            results['Firebase'] = (False, str(e))

        # 5. MySQL Tunnel & Query
        try:
            port = self.start_mysql_tunnel()
            conn = self.get_mysql_connection(port)
            with conn.cursor() as cursor:
                cursor.execute("SELECT VERSION()")
                version = cursor.fetchone()
            conn.close()
            results['MySQL Tunnel'] = (True, f"Forwarded to local port {port}")
            results['MySQL Query'] = (True, f"Succeeded (Version: {version[0]})")
        except Exception as e:
            results['MySQL Tunnel'] = (False, f"Failed: {e}")
            results['MySQL Query'] = (False, "Tunnel/Query failed")

        return results

def main():
    print("=" * 60)
    print("  YouMatter Standalone Connection System Diagnostics")
    print("=" * 60)
    
    try:
        mgr = ConnectionManager()
    except Exception as e:
        print(f"Error initializing connection manager: {e}")
        sys.exit(1)
        
    print(f"Profiles Base Directory: {mgr.base_dir}\n")
    print("Running diagnostics, please wait...\n")
    
    results = mgr.run_diagnostics()
    
    print("-" * 60)
    print(f"{'Service Name':<20} | {'Status':<10} | {'Details'}")
    print("-" * 60)
    
    all_ok = True
    for service, (ok, detail) in results.items():
        status_str = "OK" if ok else "FAIL"
        if not ok:
            all_ok = False
        print(f"{service:<20} | {status_str:<10} | {detail}")
        
    print("-" * 60)
    if all_ok:
        print("ALL SYSTEMS OPERATIONAL!")
    else:
        print("SOME CHECKS FAILED. See details above.")
        
    # Leave the tunnel running if requested via CLI, otherwise clean up
    if '--keep-tunnel' in sys.argv:
        print("\nKeeping MySQL Tunnel running. Press Ctrl+C to terminate.")
        try:
            while True:
                time.sleep(10)
        except KeyboardInterrupt:
            print("\nShutting down tunnel...")
            mgr.stop_mysql_tunnel()
            print("Shutdown complete.")
    else:
        mgr.stop_mysql_tunnel()

if __name__ == "__main__":
    main()
