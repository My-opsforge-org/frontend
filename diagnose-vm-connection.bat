@echo off
echo VM Connection Diagnostic Tool
echo =============================
echo.

echo Checking VM connectivity...
echo.

echo 1. Testing basic connectivity...
ping -n 4 %VM_HOST% >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ VM is reachable via ping
) else (
    echo ❌ VM is not reachable via ping
    echo    - Check if VM is running
    echo    - Verify IP address is correct
)

echo.
echo 2. Testing SSH port connectivity...
powershell -Command "try { $tcp = New-Object System.Net.Sockets.TcpClient; $tcp.Connect('%VM_HOST%', 22); $tcp.Close(); Write-Host '✅ SSH port 22 is open' } catch { Write-Host '❌ SSH port 22 is closed or blocked' }"

echo.
echo 3. Testing SSH connection...
sshpass -p "%VM_PASSWORD%" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 -o ServerAliveInterval=30 -o ServerAliveCountMax=3 "%VM_USER%@%VM_HOST%" "echo 'SSH connection successful'" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ SSH connection successful
) else (
    echo ❌ SSH connection failed
    echo.
    echo Possible issues:
    echo - VM is not running
    echo - SSH service is not running on VM
    echo - Firewall is blocking SSH connections
    echo - Incorrect credentials
    echo - Network connectivity issues
)

echo.
echo 4. Checking GitHub secrets...
echo Note: You need to check these in GitHub repository settings
echo Required secrets:
echo - VM_HOST: %VM_HOST%
echo - VM_USER: %VM_USER%
echo - VM_PASSWORD: [hidden]
echo - BACKEND_URL: [optional]

echo.
echo 5. Recommendations:
echo.
echo If SSH connection fails:
echo 1. Check VM status in cloud provider dashboard
echo 2. Verify SSH service is running: ssh username@vm-ip "sudo systemctl status ssh"
echo 3. Check firewall: ssh username@vm-ip "sudo ufw status"
echo 4. Try manual SSH: ssh username@vm-ip
echo 5. Use build-only workflow until VM issues are resolved
echo.
echo Press any key to continue...
pause
