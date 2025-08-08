# Deployment Troubleshooting Guide

## SSH Connection Timeout Issues

### Common Causes and Solutions

#### 1. **VM Not Running or Inaccessible**
- **Check**: Verify your VM is running and accessible
- **Solution**: Start the VM if it's stopped, check cloud provider dashboard

#### 2. **Incorrect IP Address/Hostname**
- **Check**: Verify `VM_HOST` secret in GitHub repository settings
- **Solution**: Update the secret with correct IP address

#### 3. **SSH Service Not Running**
- **Check**: SSH into VM manually and check if SSH service is running
- **Solution**: 
  ```bash
  sudo systemctl status ssh
  sudo systemctl start ssh  # if not running
  ```

#### 4. **Firewall Blocking SSH**
- **Check**: Verify port 22 is open in firewall
- **Solution**: 
  ```bash
  sudo ufw status
  sudo ufw allow 22  # if needed
  ```

#### 5. **Incorrect Credentials**
- **Check**: Verify `VM_USER` and `VM_PASSWORD` secrets
- **Solution**: Update GitHub repository secrets with correct credentials

#### 6. **Network Connectivity Issues**
- **Check**: Test basic connectivity to VM
- **Solution**: 
  ```bash
  ping YOUR_VM_IP
  telnet YOUR_VM_IP 22
  ```

### Testing SSH Connection

Use the provided test script:

```bash
# Set environment variables
export VM_HOST=your-vm-ip
export VM_USER=your-username
export VM_PASSWORD=your-password

# Run the test
./test-ssh-connection.sh
```

### GitHub Actions Workflow Fixes Applied

1. **Fixed Directory Path Issue**: Changed from `./Frontend` to `./` (correct directory)
2. **Added SSH Timeout Options**: 
   - `ConnectTimeout=30`: 30-second connection timeout
   - `ServerAliveInterval=60`: Send keep-alive every 60 seconds
   - `ServerAliveCountMax=3`: Allow 3 missed keep-alive responses
3. **Added Build Verification**: Check if build directory exists before deployment
4. **Added Timeout to SCP/SSH Actions**: Prevent indefinite hanging

### Manual Deployment Steps

If GitHub Actions continues to fail, you can deploy manually:

1. **Build locally**:
   ```bash
   npm ci
   npm run build
   ```

2. **Copy to VM**:
   ```bash
   scp -r build/* username@your-vm-ip:/home/username/frontend/
   ```

3. **Restart nginx**:
   ```bash
   ssh username@your-vm-ip "sudo systemctl restart nginx"
   ```

### Monitoring Deployment

1. **Check GitHub Actions logs** for specific error messages
2. **Monitor VM resources** (CPU, memory, disk space)
3. **Check nginx logs**:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   sudo tail -f /var/log/nginx/access.log
   ```

### Common Error Messages

- **"Connection timed out"**: Network/firewall issue
- **"Permission denied"**: Incorrect credentials or user permissions
- **"No such file or directory"**: Build failed or wrong path
- **"Port 22: Connection refused"**: SSH service not running

### Emergency Recovery

If deployment completely fails:

1. **Rollback to previous version** (if available)
2. **Manual deployment** using the steps above
3. **Check VM health** and restart if necessary
4. **Verify all services** are running on VM

## Backend Deployment Issues

### SSH Connection Timeout in Backend Deployment

If you encounter SSH connection timeouts during backend deployment:

1. **Test SSH connection manually**:
   ```bash
   cd Backend_node
   export VM_PUBLIC_IP=your-vm-ip
   export VM_USERNAME=your-username
   export VM_PASSWORD=your-password
   ./test-ssh-connection.sh
   ```

2. **Check VM status** in your cloud provider dashboard

3. **Verify SSH service** is running on VM:
   ```bash
   ssh username@your-vm-ip "sudo systemctl status ssh"
   ```

4. **Check firewall settings**:
   ```bash
   ssh username@your-vm-ip "sudo ufw status"
   ```

### Backend Deployment Script Improvements

The backend deployment script now includes:
- SSH connection testing before deployment
- Better timeout handling (30-second connection timeout)
- Keep-alive settings to prevent connection drops
- Comprehensive error messages and troubleshooting tips
