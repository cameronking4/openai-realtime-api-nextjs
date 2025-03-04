const { execSync } = require('child_process');
const os = require('os');

// Port to check and kill processes on
const PORT = 3000;

function killProcessOnPort(port) {
  try {
    console.log(`Checking for processes on port ${port}...`);
    
    let command;
    let pidCommand;
    
    if (os.platform() === 'win32') {
      // Windows
      pidCommand = `netstat -ano | findstr :${port}`;
    } else {
      // macOS, Linux
      pidCommand = `lsof -i :${port} -t`;
    }
    
    try {
      const pids = execSync(pidCommand, { encoding: 'utf-8' }).trim().split('\n');
      
      if (pids.length === 0 || (pids.length === 1 && pids[0] === '')) {
        console.log(`No processes found on port ${port}.`);
        return;
      }
      
      console.log(`Found ${pids.length} process(es) on port ${port}.`);
      
      // Kill each process
      pids.forEach(pid => {
        if (pid) {
          // For Windows, we need to extract the PID from the netstat output
          const actualPid = os.platform() === 'win32' 
            ? pid.split(/\s+/).filter(Boolean).pop() 
            : pid;
            
          try {
            if (os.platform() === 'win32') {
              execSync(`taskkill /F /PID ${actualPid}`);
            } else {
              execSync(`kill -9 ${actualPid}`);
            }
            console.log(`Successfully killed process with PID: ${actualPid}`);
          } catch (killError) {
            console.error(`Failed to kill process with PID: ${actualPid}`, killError.message);
          }
        }
      });
      
    } catch (error) {
      // If the command fails, it likely means no processes are using the port
      console.log(`No processes found on port ${port}.`);
    }
    
  } catch (error) {
    console.error(`Error checking or killing processes on port ${port}:`, error.message);
  }
}

// Execute the function
killProcessOnPort(PORT);

// Export the function for use in other scripts
module.exports = killProcessOnPort; 