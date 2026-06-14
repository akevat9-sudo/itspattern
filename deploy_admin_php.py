import paramiko

host = "ssh.gb.stackcp.com"
port = 22
username = "eternalnavras.in"
private_key_path = r"C:\Users\Akeva\Downloads\Diet\.sftp_key"
local_file = r"c:\Users\Akeva\Downloads\itspattern2\admin.php"
remote_file = "public_html/itspattern/admin.php"

try:
    print("Connecting to ServerByt via SFTP...")
    private_key = paramiko.RSAKey.from_private_key_file(private_key_path)
    transport = paramiko.Transport((host, port))
    transport.connect(username=username, pkey=private_key)
    sftp = paramiko.SFTPClient.from_transport(transport)
    
    print(f"Uploading {local_file} to {remote_file}...")
    sftp.put(local_file, remote_file)
    sftp.close()
    transport.close()
    print("Upload completed successfully!")
except Exception as e:
    print(f"Error: {e}")
