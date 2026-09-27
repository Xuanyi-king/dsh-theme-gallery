import { readFile, mkdir, writeFile, rename } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { randomUUID } from 'node:crypto';

const ROUTE = '/dsh-theme-gallery/selection';
const ALLOWED = new Set(['gallery-shanhe', 'gallery-ultraman', 'gallery-perfect-world',
  'gallery-flame-emperor', 'gallery-great-sage', 'gallery-nezha', 'gallery-whale-prince']);
const pathFor = (home = process.env.DSH_HOME || join(homedir(), '.dsh')) => join(home, 'dsh-theme-gallery', 'selection.json');
const respond = (res, code, value) => {
  const payload = JSON.stringify(value);
  res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'content-length': Buffer.byteLength(payload), 'cache-control': 'no-store' });
  res.end(payload);
};
const sameOrigin = req => {
  const origin = req.headers?.origin;
  if (!origin) return true;
  try { return new URL(origin).host === req.headers?.host; } catch { return false; }
};
async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 1024) throw new Error('request body too large');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
export async function readSelection(home) {
  try {
    const parsed = JSON.parse(await readFile(pathFor(home), 'utf8'));
    return ALLOWED.has(parsed.themeId) ? parsed.themeId : null;
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}
export async function writeSelection(themeId, home) {
  if (themeId !== null && !ALLOWED.has(themeId)) throw new Error('unknown theme');
  const file = pathFor(home);
  await mkdir(dirname(file), { recursive: true });
  const temporary = `${file}.${randomUUID()}.tmp`;
  await writeFile(temporary, `${JSON.stringify({ themeId })}\n`, { mode: 0o600 });
  await rename(temporary, file);
}
export function registerSelectionRoute(webServer, { home } = {}) {
  return webServer.register({ kind: 'exact', path: ROUTE, handler: async (req, res) => {
    if (req.method !== 'GET' && req.method !== 'PUT') {
      res.writeHead(405, { allow: 'GET, PUT' }); res.end(); return;
    }
    if (!sameOrigin(req)) { respond(res, 403, { error: 'untrusted origin' }); return; }
    try {
      if (req.method === 'GET') return respond(res, 200, { themeId: await readSelection(home) });
      const body = await readBody(req);
      if (!body || !Object.hasOwn(body, 'themeId') || (body.themeId !== null && !ALLOWED.has(body.themeId))) {
        return respond(res, 400, { error: 'invalid themeId' });
      }
      await writeSelection(body.themeId, home);
      respond(res, 200, { themeId: body.themeId });
    } catch (error) { respond(res, 500, { error: String(error.message ?? error) }); }
  } });
}
export function attachSelectionRoute(ctx, options = {}) {
  ctx.inject?.(['webServer'], host => {
    if (host?.webServer?.register) ctx.effect(() => registerSelectionRoute(host.webServer, options), 'dsh-theme-gallery: selection route');
  });
}
