const { spawn } = require('child_process');

// Spawn the PM2 logs command with the --nostream flag to prevent continuous streaming
const pm2Logs = spawn('pm2', ['logs', 'lw-ai', '--lines', '100', '--nostream']);

// Set a timeout to ensure the process terminates
const timeout = setTimeout(() => {
  console.log('\nLog retrieval complete with code 0.');
  process.exit(0);
}, 3000); // 3 seconds should be enough to get the logs

// Handle process output
pm2Logs.stdout.on('data', (data) => {
  process.stdout.write(data);
});

pm2Logs.stderr.on('data', (data) => {
  process.stderr.write(data);
});

// Handle process exit
pm2Logs.on('exit', (code) => {
  clearTimeout(timeout);
  console.log(`\nLog retrieval complete with code ${code}.`);
  process.exit(code);
});

// Handle errors
pm2Logs.on('error', (err) => {
  clearTimeout(timeout);
  console.error('Error executing PM2 logs command:', err);
  process.exit(1);
}); 