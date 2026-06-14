import paramiko
import os
from pathlib import Path

HOST = "ssh.gb.stackcp.com"
PORT = 22
USERNAME = "eternalnavras.in"
PRIVATE_KEY_PATH = r"C:\Users\Akeva\Downloads\Diet\.sftp_key"
REMOTE_PATH = "public_html/itspattern"
LOCAL_PATH = r"c:\Users\Akeva\Downloads\itspattern2"

# File extensions to deploy
ALLOWED_EXTENSIONS = {
    '.php', '.html', '.js', '.css', '.json', '.png', 
    '.jpg', '.jpeg', '.svg', '.ico', '.woff', '.woff2', '.htaccess'
}

# Directories and files to exclude from deployment
EXCLUDE_NAMES = {
    '.git', '.github', '.idea', '.vscode', '__pycache__', 
    'connection_profiles', 'node_modules', 'connection_system.py', 
    'connect_all.py', 'deploy_admin_php.py', 'deploy_analytics.py', 
    'deploy_main_orch.py', 'deploy_mobile_configs.py', 
    'sync_from_serverbyt.py', 'deploy_frontend.py', '.instructions.md',
    'android', 'ios', 'public'
}

def should_deploy(file_path):
    path = Path(file_path)
    
    # Check if any parent directory is in exclude list
    for part in path.relative_to(LOCAL_PATH).parts:
        if part in EXCLUDE_NAMES:
            return False
            
    # Check if the file is in exclude list
    if path.name in EXCLUDE_NAMES:
        return False
        
    # Check extension (or allow .htaccess which starts with dot and has no extension)
    if path.name == '.htaccess':
        return True
        
    return path.suffix.lower() in ALLOWED_EXTENSIONS

def ensure_remote_dir(sftp, remote_dir):
    parts = remote_dir.split('/')
    current = ""
    for part in parts:
        if not part:
            continue
        current = f"{current}/{part}" if current else part
        try:
            sftp.stat(current)
        except IOError:
            print(f"Creating remote directory: {current}")
            sftp.mkdir(current)

def deploy_recursively(sftp, local_dir, remote_dir):
    for root, dirs, files in os.walk(local_dir):
        # Filter directories in place to avoid walking into excluded dirs
        dirs[:] = [d for d in dirs if d not in EXCLUDE_NAMES]
        
        for file in files:
            local_file_path = os.path.join(root, file)
            if not should_deploy(local_file_path):
                continue
                
            rel_path = os.path.relpath(local_file_path, local_dir).replace('\\', '/')
            remote_file_path = f"{remote_dir}/{rel_path}"
            
            # Ensure parent remote directory exists
            remote_parent = os.path.dirname(remote_file_path)
            ensure_remote_dir(sftp, remote_parent)
            
            print(f"Uploading: {rel_path} -> {remote_file_path}")
            sftp.put(local_file_path, remote_file_path)

def main():
    print("Connecting to ServerByt via SFTP...")
    private_key = paramiko.RSAKey.from_private_key_file(PRIVATE_KEY_PATH)
    transport = paramiko.Transport((HOST, PORT))
    try:
        transport.connect(username=USERNAME, pkey=private_key)
        sftp = paramiko.SFTPClient.from_transport(transport)
        
        print(f"Starting recursive deployment to {REMOTE_PATH}...")
        deploy_recursively(sftp, LOCAL_PATH, REMOTE_PATH)
        
        sftp.close()
        transport.close()
        print("Deployment completed successfully!")
    except Exception as e:
        print(f"Error during deployment: {e}")
        if transport.is_active():
            transport.close()

if __name__ == "__main__":
    main()
