import paramiko

host = '80.225.219.29'
port = 22
username = 'ubuntu'
private_key_path = r'C:\Users\Akeva\Downloads\Diet\.oracle_key'
local_file = r'C:\Users\Akeva\Downloads\itspattern\backend\analytics.py'
remote_file = '/opt/assessment_funnel/analytics.py'

try:
    print("Connecting to Oracle Cloud via SFTP...")
    key = paramiko.RSAKey.from_private_key_file(private_key_path)
    transport = paramiko.Transport((host, port))
    transport.connect(username=username, pkey=key)
    sftp = paramiko.SFTPClient.from_transport(transport)
    
    print(f"Uploading {local_file} to {remote_file}...")
    sftp.put(local_file, remote_file)
    sftp.close()
    
    print("SFTP Upload completed. Connecting via SSH to restart uvicorn...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(host, port=port, username=username, pkey=key)
    
    print("Killing existing uvicorn and main_orch processes...")
    ssh.exec_command('sudo pkill -9 -f uvicorn')
    ssh.exec_command('sudo pkill -9 -f main_orch')
    
    print("Starting uvicorn on port 8000...")
    # Run uvicorn in the background using nohup
    ssh.exec_command('cd /opt/assessment_funnel && nohup /opt/assessment_funnel/venv/bin/uvicorn main_orch:app --host 0.0.0.0 --port 8000 > nohup.out 2>&1 &')
    
    ssh.close()
    transport.close()
    print("Deployment and Restart completed successfully!")
except Exception as e:
    print(f"Error during deployment: {e}")
