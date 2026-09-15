import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HOST = process.env.CONTROL_HOST || '127.0.0.1';
const PORT = Number(process.env.CONTROL_PORT || '3100');
const APP_DIR = process.env.APP_DIR || '/app';
const CONTROL_AUTH = process.env.CONTROL_PLANE_AUTH || 'lcxkjvoaisjeflaiksdjlfkcxjvija';

function json(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
  });
  res.end(body);
}

function databasePath() {
  const databaseURL = process.env.DATABASE_URL || `file:${APP_DIR}/db/custom.db`;
  if (databaseURL.startsWith('file:')) {
    const raw = databaseURL.slice('file:'.length);
    return path.isAbsolute(raw) ? raw : path.resolve(APP_DIR, raw);
  }
  return path.join(APP_DIR, 'db', 'custom.db');
}

function authorized(req) {
  const auth = String(req.headers['x-auth'] || '');
  return auth === CONTROL_AUTH;
}

const server = createServer((req, res) => {
  const url = new URL(req.url || '/', 'http://127.0.0.1');

  // pre-stop 由平台生命周期头触发，无需鉴权
  if (req.url?.startsWith('/pre-stop') && String(req.headers['x-fc-instance-lifecycle-pre-stop-handler'] || '').toLowerCase() === 'true') {
    json(res, 200, { success: true });
    setTimeout(() => process.exit(0), 100);
    return;
  }

  if (url.pathname === '/ping') {
    text(res, 200, 'pong');
    return;
  }

  if (!authorized(req)) {
    json(res, 401, { success: false, error: 'unauthorized' });
    return;
  }

  if (url.pathname === '/db/meta') {
    const dbPath = databasePath();
    if (!existsSync(dbPath)) {
      json(res, 404, { success: false, error: 'database not found' });
      return;
    }
    const stat = statSync(dbPath);
    json(res, 200, { success: true, path: dbPath, size: stat.size, mtime: stat.mtime });
    return;
  }

  if (url.pathname === '/db/tables') {
    querySql(res, "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name", (rows) => ({ success: true, tables: rows.map((r) => r.name) }));
    return;
  }

  if (url.pathname?.startsWith('/db/tables/')) {
    const tableName = decodeURIComponent(url.pathname.slice('/db/tables/'.length));
    querySql(res, `SELECT * FROM "${tableName.replaceAll('"', '""')}" LIMIT 200`, (rows) => ({ success: true, table: tableName, rows }));
    return;
  }

  if (url.pathname === '/db/download') {
    const dbPath = databasePath();
    if (!existsSync(dbPath)) {
      json(res, 404, { success: false, error: 'database not found' });
      return;
    }
    res.writeHead(200, {
      'content-type': 'application/octet-stream',
      'content-disposition': 'attachment; filename="custom.db"',
    });
    createReadStream(dbPath).pipe(res);
    return;
  }

  json(res, 404, { success: false, error: 'Not Found' });
});

function text(res, status, body) {
  res.writeHead(status, { 'content-type': 'text/plain; charset=utf-8' });
  res.end(body);
}

function querySql(res, sql, map) {
  const dbPath = databasePath();
  const result = spawnSync('sqlite3', [dbPath, '-json', sql], { encoding: 'utf-8' });
  if (result.error || result.status !== 0) {
    json(res, 500, { success: false, error: String(result.stderr || result.error || 'sqlite3 query failed') });
    return;
  }
  let rows = [];
  try {
    rows = result.stdout ? JSON.parse(result.stdout) : [];
  } catch {
    rows = [];
  }
  json(res, 200, map(rows));
}

server.listen(PORT, HOST, () => {
  console.log(`runner control server listening on http://${HOST}:${PORT}`);
});
