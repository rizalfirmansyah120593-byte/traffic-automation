const { spawnSync } = require('child_process');
const path = require('path');

// Call Playwright's CLI directly. This avoids Windows spawn errors with
// npx.cmd and works the same way on Linux hosting.
const cli = path.resolve(__dirname, '..', 'node_modules', 'playwright', 'cli.js');
const result = spawnSync(process.execPath, [cli, 'install', 'chromium'], {
  stdio: 'inherit',
  shell: false,
  env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: '0' }
});

if (result.error) throw result.error;
process.exit(result.status ?? 1);
