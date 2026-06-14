#!/usr/bin/env python3
"""
one-click-connect -- ServerByt + Oracle + Firebase + MySQL tunnel
Usage:
    python connect_all.py <path_to_diet_dir>   # e.g. "C:/Users/Akeva/Downloads/Diet"
    python connect_all.py                       # uses DIET_DIR env var or default
"""

import os
import sys
import json
import socket
import select
import threading
import time
from pathlib import Path

# -- defaults -----------------------------------------------------------
SCRIPT_DIR = Path(__file__).resolve().parent
DIET_DIR = Path(os.environ.get("DIET_DIR", "C:\\Users\\Akeva\\Downloads\\Diet"))
MYSQL_USER = "youmatter-36395093"
MYSQL_PASS = "$*G#rckBjn_%"
MYSQL_DB = "youmatter-36395093"

# -- colors -------------------------------------------------------------
def G(s): return f"\033[92m{s}\033[0m"
def R(s): return f"\033[91m{s}\033[0m"
def Y(s): return f"\033[93m{s}\033[0m"

def banner():
    print("=" * 60)
    print("  YouMatter - One-Click Connect")
    print("  ServerByt . Oracle Cloud . Firebase . MySQL Tunnel")
    print("=" * 60)

# -- profile loading ----------------------------------------------------
def load_profiles(diet_dir):
    profiles = {}
    for name in ("serverbyt_sftp", "serverbyt_mysql", "oracle_cloud"):
        p = diet_dir / "connection_profiles" / f"{name}.json"
        profiles[name] = json.loads(p.read_text()) if p.exists() else None
    return profiles

# -- parallel-safe test functions ---------------------------------------
_results = {}
_lock = threading.Lock()

def _set(key, ok, msg):
    with _lock:
        _results[key] = (ok, msg)

def _test_ssh(label, host, port, user, key_path, timeout=12):
    import paramiko
    start = time.time()
    try:
        key = paramiko.RSAKey.from_private_key_file(str(key_path))
        c = paramiko.SSHClient()
        c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        c.connect(host, port=port, username=user, pkey=key, timeout=timeout)
        _, out, _ = c.exec_command("echo OK", timeout=timeout)
        r = out.read().decode().strip()
        c.close()
        ok = "OK" in r
        _set(label, ok, r if ok else f"unexpected: {r}")
    except Exception as e:
        _set(label, False, f"{e} ({time.time()-start:.0f}s)")

def _test_tunnel_and_mysql(tunnel, diet_dir):
    import paramiko
    import pymysql
    start = time.time()
    transport = None
    try:
        key_path = (diet_dir / "connection_profiles" / tunnel["ssh_key"]).resolve()
        key = paramiko.RSAKey.from_private_key_file(str(key_path))
        transport = paramiko.Transport((tunnel["ssh_host"], tunnel["ssh_port"]))
        transport.connect(username=tunnel["ssh_user"], pkey=key)
        _set("MySQL Tunnel", True, f"127.0.0.1:{tunnel['local_port']}")

        srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        srv.bind(("127.0.0.1", tunnel["local_port"]))
        srv.listen(100)

        def _loop():
            while True:
                try:
                    cs, addr = srv.accept()
                    t = threading.Thread(
                        target=_pipe, args=(cs, (tunnel["remote_host"], tunnel["remote_port"]), transport),
                        daemon=True)
                    t.start()
                except: break

        threading.Thread(target=_loop, daemon=True).start()
        time.sleep(1.5)

        conn = pymysql.connect(host="127.0.0.1", port=tunnel["local_port"],
                               user=MYSQL_USER, password=MYSQL_PASS,
                               database=MYSQL_DB, connect_timeout=10)
        cur = conn.cursor()
        cur.execute("SELECT 1")
        r1 = cur.fetchone()
        cur.execute("SELECT VERSION()")
        r2 = cur.fetchone()
        conn.close()
        _set("MySQL Query", True, (r1, r2))
        return transport
    except Exception as e:
        _set("MySQL Tunnel", False, f"tunnel: {e}")
        _set("MySQL Query", False, "tunnel failed")
        if transport: transport.close()
        return None

def _resolve_firebase_key(diet_dir):
    env_path = os.environ.get("FIREBASE_KEY_FILE")
    candidates = []
    if env_path:
        candidates.append(Path(env_path).expanduser())
    candidates.extend([
        SCRIPT_DIR / "backend" / "firebase_key.json",
        SCRIPT_DIR / "firebase_key.json",
        diet_dir / "backend" / "firebase_key.json",
        diet_dir / "firebase_key.json",
    ])
    for path in candidates:
        if path.exists():
            return path.resolve()
    return None

def _test_firebase(diet_dir, timeout=12):
    start = time.time()
    key_path = _resolve_firebase_key(diet_dir)
    if not key_path:
        _set("Firebase", False, "firebase_key.json not found")
        return

    project_id = "unknown"
    try:
        meta = json.loads(key_path.read_text())
        project_id = meta.get("project_id", "unknown")
    except Exception:
        pass

    try:
        import firebase_admin
        from firebase_admin import credentials, firestore

        try:
            app = firebase_admin.get_app()
        except ValueError:
            cred = credentials.Certificate(str(key_path))
            app = firebase_admin.initialize_app(cred)

        db = firestore.client(app=app)
        snap = db.collection("connection_tests").document("connect_all").get(timeout=timeout)
        state = "doc reachable" if snap.exists else "auth ok"
        _set("Firebase", True, f"online - {project_id} ({state})")
    except Exception as e:
        _set("Firebase", False, f"{e} ({time.time()-start:.0f}s)")

def _pipe(a, b, transport):
    try:
        chan = transport.open_channel("direct-tcpip", b, a.getpeername())
    except Exception:
        a.close(); return
    if chan is None: a.close(); return
    while True:
        try:
            r, _, _ = select.select([a, chan], [], [], 0.5)
            if a in r:
                d = a.recv(4096)
                if not d: break
                chan.send(d)
            if chan in r:
                d = chan.recv(4096)
                if not d: break
                a.send(d)
        except: break
    a.close(); chan.close()

# -- main ---------------------------------------------------------------
def main():
    banner()

    diet_dir = Path(sys.argv[1]) if len(sys.argv) > 1 else DIET_DIR
    if not diet_dir.exists():
        print(R(f"X Diet directory not found: {diet_dir}"))
        sys.exit(1)

    os.chdir(str(diet_dir))
    profiles = load_profiles(diet_dir)
    threads = []
    transport = None

    # Parallel SSH tests, then serial tunnel + MySQL
    sf = profiles.get("serverbyt_sftp")
    oc = profiles.get("oracle_cloud")

    if sf:
        kp = (diet_dir / "connection_profiles" / sf["private_key_file"]).resolve()
        t = threading.Thread(target=_test_ssh, args=("ServerByt SFTP", sf["host"], sf["port"],
                                                      sf["username"], kp))
        t.start(); threads.append(t)

    if oc:
        kp = (diet_dir / "connection_profiles" / oc["private_key_file"]).resolve()
        t = threading.Thread(target=_test_ssh, args=("Oracle Cloud SFTP", oc["host"], oc["port"],
                                                      oc["username"], kp))
        t.start(); threads.append(t)

    # Wait for SSH tests
    for t in threads: t.join()

    # Oracle Python Backend health check
    print(f"\n{'='*50}")
    print("[check] Oracle Python Backend (80.225.219.29:8000)")
    print(f"{'='*50}")
    try:
        import urllib.request
        req = urllib.request.Request("http://80.225.219.29:8000/health")
        resp = urllib.request.urlopen(req, timeout=8)
        if resp.status == 200:
            data = json.loads(resp.read().decode())
            _set("Oracle Backend", True, f"online - {data.get('status', data)}")
            print(f"  {G('OK')} -- Backend online")
        else:
            _set("Oracle Backend", False, f"HTTP {resp.status}")
            print(f"  {R('FAIL')} -- HTTP {resp.status}")
    except Exception as e:
        _set("Oracle Backend", False, f"unreachable: {e}")
        print(f"  {R('FAIL')} -- unreachable: {e}")

    # Firebase / Firestore health check
    print(f"\n{'='*50}")
    print("[check] Firebase Firestore")
    print(f"{'='*50}")
    _test_firebase(diet_dir)
    fb_ok, fb_msg = _results.get("Firebase", (False, "not tested"))
    print(f"  {(G('OK') if fb_ok else R('FAIL'))} -- {fb_msg}")

    # Tunnel + MySQL (sequential, needs SSH tests done)
    transport_ref = [None]
    mp = profiles.get("serverbyt_mysql")
    tunnel = mp.get("ssh_tunnel", {}) if mp else {}
    if tunnel:
        t = threading.Thread(target=lambda: transport_ref.__setitem__(0, _test_tunnel_and_mysql(tunnel, diet_dir)))
        t.start(); t.join()

    transport = transport_ref[0]

    # Summary
    print(f"\n{'='*50}")
    print("  CONNECTION STATUS")
    print(f"{'='*50}")
    all_ok = True
    order = ["ServerByt SFTP", "Oracle Cloud SFTP", "Oracle Backend", "Firebase", "MySQL Tunnel", "MySQL Query"]
    for key in order:
        if key in _results:
            ok, msg = _results[key]
            icon = G("OK") if ok else R("FAIL")
            if not ok: all_ok = False
            s = str(msg)[:55].replace("\n", " ")
            print(f"  [{icon}] {key:<20} {s}")
        else:
            print(f"  [{R('??')}] {key:<20} not tested")

    print(f"\n  {'-'*56}")
    if all_ok:
        print(f"  {G('ALL SYSTEMS OPERATIONAL')}")
        print(f"  MySQL -> mysql -h 127.0.0.1 -P 3307 -u {MYSQL_USER} -p")
    else:
        print(f"  {Y('SOME CONNECTIONS FAILED - see above')}")

    # Keep tunnel alive
    if transport:
        print(f"\n  Tunnel running - Ctrl+C to stop\n")
        try:
            while True: time.sleep(10)
        except KeyboardInterrupt:
            print("\n  Shutting down ...")
            transport.close()
            print("  Done.")
    else:
        print("\n  No tunnel to keep alive.")

if __name__ == "__main__":
    main()
