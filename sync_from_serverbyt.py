import paramiko
import os
from pathlib import Path

HOST = "ssh.gb.stackcp.com"
PORT = 22
USERNAME = "eternalnavras.in"
PRIVATE_KEY_PATH = r"C:\Users\Akeva\Downloads\Diet\.sftp_key"
REMOTE_PATH = "public_html/itspattern"
LOCAL_PATH = r"c:\Users\Akeva\Downloads\itspattern2"

def download_recursively(sftp, remote_dir, local_dir):
    os.makedirs(local_dir, exist_ok=True)
    for entry in sftp.listdir_attr(remote_dir):
        name = entry.filename
        # Skip special configuration/script files
        if name in [".instructions.md", "connect_all.py", "sync_from_serverbyt.py"]:
            continue
        
        rem_path = f"{remote_dir}/{name}"
        loc_path = os.path.join(local_dir, name)
        
        # Check if it's a directory (stat mode directory bit)
        if entry.st_mode & 0o40000:
            print(f"Creating local directory: {loc_path}")
            download_recursively(sftp, rem_path, loc_path)
        else:
            print(f"Downloading: {rem_path} -> {loc_path}")
            sftp.get(rem_path, loc_path)

def main():
    print("Connecting to ServerByt via SFTP...")
    private_key = paramiko.RSAKey.from_private_key_file(PRIVATE_KEY_PATH)
    transport = paramiko.Transport((HOST, PORT))
    try:
        transport.connect(username=USERNAME, pkey=private_key)
        sftp = paramiko.SFTPClient.from_transport(transport)
        
        print(f"Starting download from {REMOTE_PATH}...")
        download_recursively(sftp, REMOTE_PATH, LOCAL_PATH)
        
        sftp.close()
        transport.close()
        print("Download completed successfully.")
    except Exception as e:
        print(f"Error: {e}")
        if transport.is_active():
            transport.close()

if __name__ == "__main__":
    main()
