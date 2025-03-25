
import { spawn } from 'child_process';
import * as electron from 'electron';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ES Module compatibility for __dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Start the Vite dev server
const vite = spawn('npm', ['run', 'dev'], {
  shell: true,
  stdio: 'inherit',
  env: { ...process.env }
});

// Give Vite time to start up before launching Electron
setTimeout(() => {
  // Start Electron app in development mode
  const electronProcess = spawn(
    electron as unknown as string,
    [path.join(__dirname, '../electron/main.js')],
    {
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'development' }
    }
  );

  // Handle Electron process exit
  electronProcess.on('close', (code) => {
    // Kill Vite dev server when Electron exits
    vite.kill();
    process.exit(code || 0);
  });
}, 2000);
