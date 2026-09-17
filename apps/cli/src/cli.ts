import http from 'http';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import boxen from 'boxen';
import qrcode from 'qrcode-terminal';
import { Command } from 'commander';
import { DEFAULT_PORT } from '@localdrop/protocol';
import { createSignalingServer, getPrimaryNetworkAddress, getLocalNetworkAddresses } from '@localdrop/signaling';

const program = new Command();

program
  .name('localdrop')
  .description('AirDrop for EVERY device — privacy-first peer-to-peer file sharing')
  .version('0.1.0')
  .option('-p, --port <number>', 'Port to listen on', String(DEFAULT_PORT))
  .option('--no-qr', 'Do not render QR code in terminal')
  .option('--room <id>', 'Initial room ID')
  .parse(process.argv);

const options = program.opts();
const port = parseInt(options.port, 10) || DEFAULT_PORT;
const showQr = options.qr !== false;
const defaultRoomId = options.room || 'localdrop-lan';

// Static file server helper for Next.js exported build
function createWebFileHandler(webDistPath: string) {
  const mimeTypes: Record<string, string> = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2',
    '.txt': 'text/plain; charset=utf-8',
  };

  return (req: http.IncomingMessage, res: http.ServerResponse): boolean => {
    if (!fs.existsSync(webDistPath)) {
      return false;
    }

    let reqPath = (req.url || '/').split('?')[0];
    if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

    // Normalize and prevent path traversal
    const normalizedReq = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
    const resolvedPath = path.resolve(webDistPath, '.' + path.sep + normalizedReq);
    const rootPath = path.resolve(webDistPath);

    if (!resolvedPath.startsWith(rootPath)) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Forbidden');
      return true;
    }

    let filePath = resolvedPath;

    // If requesting a directory or without extension, check for .html
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    } else if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) {
      filePath = filePath + '.html';
    }

    if (fs.existsSync(filePath) && !fs.statSync(filePath).isDirectory()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
      return true;
    }

    // SPA fallback: return index.html for unknown routes (like /app)
    const spaIndex = path.join(webDistPath, 'index.html');
    if (fs.existsSync(spaIndex)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      fs.createReadStream(spaIndex).pipe(res);
      return true;
    }

    return false;
  };
}

// Locate web static distribution folder
const possibleWebDirs = [
  path.resolve(__dirname, '../../web/out'),
  path.resolve(__dirname, '../../../apps/web/out'),
  path.resolve(__dirname, '../web-dist'),
];

let webDistDir = possibleWebDirs.find((d) => fs.existsSync(d)) || '';

const connectedDevices = new Map<string, { name: string; platform: string }>();

function renderConnectedDevices() {
  if (connectedDevices.size === 0) {
    console.log(chalk.gray('  Waiting for devices to connect...\n'));
  } else {
    console.log(chalk.cyan.bold('  Connected devices:'));
    for (const [, dev] of connectedDevices) {
      const icon =
        dev.platform === 'ios' || dev.platform === 'android'
          ? '📱'
          : dev.platform === 'macos'
          ? '💻'
          : dev.platform === 'windows'
          ? '💻'
          : '🖥️';
      console.log(`    ${icon} ${chalk.bold(dev.name)} ${chalk.gray(`(${dev.platform})`)}`);
    }
    console.log('');
  }
}

async function main() {
  const primaryIp = getPrimaryNetworkAddress();
  const localUrl = `http://localhost:${port}`;
  const networkUrl = `http://${primaryIp}:${port}?room=${defaultRoomId}`;

  const webHandler = createWebFileHandler(webDistDir);

  // Create combined HTTP server
  const httpServer = http.createServer((req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

    // Signaling server endpoints
    if (url.pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', time: Date.now() }));
      return;
    }

    if (url.pathname === '/api/network') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          primaryIp,
          allAddresses: getLocalNetworkAddresses(),
          port,
          roomId: defaultRoomId,
        })
      );
      return;
    }

    // Try serving web frontend
    if (webHandler(req, res)) {
      return;
    }

    // Fallback landing response if web is building
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>⚡ LocalDrop</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; background: #09090b; color: #fafafa; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .card { text-align: center; max-width: 480px; padding: 32px; background: #18181b; border: 1px solid #27272a; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
            h1 { font-size: 28px; margin-bottom: 8px; }
            p { color: #a1a1aa; line-height: 1.5; }
            .badge { display: inline-block; background: #3b82f6; color: white; padding: 6px 12px; border-radius: 9999px; font-weight: bold; font-size: 14px; margin-top: 16px; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>⚡ LocalDrop</h1>
            <p>AirDrop for EVERY device.</p>
            <p>The signaling server is running. Web UI is bundling or starting on development server.</p>
            <div class="badge">Connected to ${primaryIp}:${port}</div>
          </div>
        </body>
      </html>
    `);
  });

  const signaling = createSignalingServer({
    server: httpServer,
    port,
    onClientConnected: (device) => {
      connectedDevices.set(device.deviceId, {
        name: device.deviceName || 'Anonymous Device',
        platform: device.platform || 'web',
      });
      console.log(chalk.green(`\n  ✓ Device connected: ${chalk.bold(device.deviceName)} (${device.platform})`));
      renderConnectedDevices();
    },
    onClientDisconnected: (device) => {
      connectedDevices.delete(device.deviceId);
      console.log(chalk.yellow(`\n  ✗ Device disconnected: ${device.deviceName}`));
      renderConnectedDevices();
    },
  });

  await signaling.start();

  // Print banner
  const banner = boxen(
    `${chalk.yellow.bold('⚡ LocalDrop')}\n\n${chalk.white.bold('AirDrop for EVERY device')}`,
    {
      padding: { top: 1, bottom: 1, left: 6, right: 6 },
      margin: 1,
      borderStyle: 'round',
      borderColor: 'cyan',
      textAlignment: 'center',
    }
  );

  console.clear();
  console.log(banner);
  console.log(chalk.green.bold('  ✓ Local server started\n'));
  console.log(`  ${chalk.gray('Local:')}   ${chalk.cyan.underline(localUrl)}`);
  console.log(`  ${chalk.gray('Network:')} ${chalk.cyan.underline(networkUrl)}\n`);

  if (showQr) {
    console.log(chalk.bold('  Scan this QR code with another device:'));
    qrcode.generate(networkUrl, { small: true }, (code) => {
      console.log(
        code
          .split('\n')
          .map((line) => '  ' + line)
          .join('\n')
      );
    });
    console.log('');
  }

  renderConnectedDevices();
}

main().catch((err) => {
  console.error(chalk.red('Failed to start LocalDrop CLI:'), err);
  process.exit(1);
});
