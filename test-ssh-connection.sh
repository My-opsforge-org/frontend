#!/bin/bash

# Test SSH connection to VM
# Usage: ./test-ssh-connection.sh

echo "Testing SSH connection to VM..."

# Check if required environment variables are set
if [ -z "$VM_HOST" ] || [ -z "$VM_USER" ] || [ -z "$VM_PASSWORD" ]; then
    echo "ERROR: Please set the following environment variables:"
    echo "  VM_HOST - Your VM's IP address or hostname"
    echo "  VM_USER - Your VM username"
    echo "  VM_PASSWORD - Your VM password"
    echo ""
    echo "Example:"
    echo "  export VM_HOST=your-vm-ip"
    echo "  export VM_USER=your-username"
    echo "  export VM_PASSWORD=your-password"
    echo "  ./test-ssh-connection.sh"
    exit 1
fi

echo "Testing connection to $VM_USER@$VM_HOST..."

# Test basic SSH connection
echo "1. Testing basic SSH connection..."
sshpass -p "$VM_PASSWORD" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 -o ServerAliveInterval=30 -o ServerAliveCountMax=3 "$VM_USER@$VM_HOST" "echo 'SSH connection successful!'"

if [ $? -eq 0 ]; then
    echo "✅ SSH connection successful!"
else
    echo "❌ SSH connection failed!"
    echo ""
    echo "Troubleshooting tips:"
    echo "1. Check if the VM is running and accessible"
    echo "2. Verify the IP address/hostname is correct"
    echo "3. Check if SSH service is running on the VM"
    echo "4. Verify firewall settings allow SSH connections"
    echo "5. Check if the username and password are correct"
    exit 1
fi

# Test if we can run commands
echo ""
echo "2. Testing command execution..."
sshpass -p "$VM_PASSWORD" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 -o ServerAliveInterval=30 -o ServerAliveCountMax=3 "$VM_USER@$VM_HOST" "whoami && pwd && ls -la"

if [ $? -eq 0 ]; then
    echo "✅ Command execution successful!"
else
    echo "❌ Command execution failed!"
    exit 1
fi

# Test sudo access
echo ""
echo "3. Testing sudo access..."
sshpass -p "$VM_PASSWORD" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 -o ServerAliveInterval=30 -o ServerAliveCountMax=3 "$VM_USER@$VM_HOST" "sudo whoami"

if [ $? -eq 0 ]; then
    echo "✅ Sudo access successful!"
else
    echo "❌ Sudo access failed!"
    echo "Note: This might be expected if sudo requires password input"
fi

echo ""
echo "🎉 SSH connection test completed successfully!"
echo "Your VM should be accessible for deployment."
