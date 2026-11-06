import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const adminDirectory = fileURLToPath(new URL('.', import.meta.url));
const websiteDirectory = resolve(adminDirectory, '../website');
const buildDirectory = resolve(adminDirectory, 'dist');
const port = Number(process.env.PORT ?? 5175);
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mp4': 'video/mp4',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webm': 'video/webm',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2'
};

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error(`Invalid PORT: ${process.env.PORT}`);
}

function safePath(root, relativePath) {
  const resolvedRoot = resolve(root);
  const filePath = resolve(resolvedRoot, relativePath);
  if (filePath !== resolvedRoot && !filePath.startsWith(`${resolvedRoot}${sep}`)) return null;
  return filePath;
}

function respond(response, status, contentType, body, method) {
  response.writeHead(status, { 'Content-Type': contentType, 'X-Content-Type-Options': 'nosniff' });
  response.end(method === 'HEAD' ? undefined : body);
}

const server = createServer(async (request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    respond(response, 405, 'text/plain; charset=utf-8', 'Method not allowed', request.method);
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
  } catch {
    respond(response, 400, 'text/plain; charset=utf-8', 'Invalid URL path', request.method);
    return;
  }

  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/');
  const root = isAdmin ? buildDirectory : websiteDirectory;
  const relativePath = isAdmin
    ? pathname.slice('/admin'.length).replace(/^\/+/, '') || 'index.html'
    : pathname.replace(/^\/+/, '') || 'index.html';
  let filePath = safePath(root, relativePath);
  if (!filePath) {
    respond(response, 400, 'text/plain; charset=utf-8', 'Invalid URL path', request.method);
    return;
  }

  try {
    if ((await stat(filePath)).isDirectory()) filePath = resolve(filePath, 'index.html');
    const body = await readFile(filePath);
    respond(response, 200, mimeTypes[extname(filePath)] ?? 'application/octet-stream', body, request.method);
  } catch (error) {
    if (isAdmin && error.code === 'ENOENT') {
      try {
        const body = await readFile(resolve(buildDirectory, 'index.html'));
        respond(response, 200, mimeTypes['.html'], body, request.method);
      } catch (fallbackError) {
        console.error('Unable to serve the admin application:', fallbackError);
        respond(response, 500, 'text/plain; charset=utf-8', 'Admin application is unavailable', request.method);
      }
      return;
    }
    if (error.code === 'ENOENT') {
      respond(response, 404, 'text/plain; charset=utf-8', 'Not found', request.method);
      return;
    }
    console.error('Unable to serve request:', error);
    respond(response, 500, 'text/plain; charset=utf-8', 'Unable to serve request', request.method);
  }
});

server.on('error', error => {
  console.error('Unable to start the ProjectHub development server:', error);
  process.exitCode = 1;
});
server.listen(port, '0.0.0.0', () => {
  console.log(`ProjectHub website: http://localhost:${port}/`);
  console.log(`ProjectHub admin:   http://localhost:${port}/admin/`);
});
