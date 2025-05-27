const { execSync } = require('child_process');

console.log('Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('All dependencies installed successfully.');
} catch (err) {
  console.error('Error installing dependencies:', err.message);
  process.exit(1);
}
