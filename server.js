import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import pkg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pkg;

// ==== ENV ====
const PORT = process.env.PORT || 8787;
const ADMIN_PASS = process.env.ADMIN_PASS || 'cambia-esto';
const ORG_API_KEY = process.env.ORG_API_KEY || 'cambia-esta-api-key';
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ Falta DATABASE_URL en variables de entorno.');
  process.exit(1);
}

// ==== DB ====
const pool = new Pool({ connectionString: DATABASE_URL });

async function bootstrap() {
  await pool.query(`
    create table if not exists config (
      id text primary key,
      data jsonb not null,
      updated_at timestamptz not null default now()
    );
  `);
  await pool.query(
    `insert into config(id, data) values ($1, $2)
     on conflict (id) do nothing`,
    ['default', { sites: [], credentials: {} }]
  );
  console.log('✅ DB lista');
}

async function readDB(orgId = 'default') {
  const { rows } = await pool.query('select data from config where id=$1', [orgId]);
  if (!rows.length) {
    await pool.query(
      `insert into config(id, data) values ($1, $2)
       on conflict (id) do nothing`,
      [orgId, { sites: [], credentials: {} }]
    );
    return { sites: [], credentials: {} };
  }
  return rows[0].data || { sites: [], credentials: {} };
}

async function writeDB(orgId, data) {
  await pool.query(
    `insert into config(id, data) values ($1, $2)
     on conflict (id) do update set data=$2, updated_at=now()`,
    [orgId, data]
  );
}

// ==== APP ====
const app = express();
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));

// ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === Panel estático y rutas amigables ===
app.use('/admin', express.static('public')); // sirve /admin/* desde /public
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});
app.get('/', (req, res) => res.redirect('/admin'));

// ==== Auth ====
function requireAdmin(req, res, next) {
  const pass = req.header('X-Admin-Auth');
  if (pass !== ADMIN_PASS) return res.status(401).json({ error: 'unauthorized' });
  next();
}
function requireOrg(req, res, next) {
  const key = req.header('X-Org-Key');
  if (key !== ORG_API_KEY) return res.status(401).json({ error: 'unauthorized' });
  next();
}

// ==== Admin API ====
app.post('/api/admin/site', requireAdmin, async (req, res) => {
  const org = (req.query.org || 'default').toString();
  const site = req.body;
  if (!site?.key) return res.status(400).json({ error: 'site.key required' });
  const db = await readDB(org);
  const i = (db.sites || []).findIndex(s => s.key === site.key);
  if (i >= 0) db.sites[i] = site; else (db.sites || (db.sites=[])).push(site);
  await writeDB(org, db);
  res.json({ ok: true });
});

app.post('/api/admin/cred', requireAdmin, async (req, res) => {
  const org = (req.query.org || 'default').toString();
  const { siteKey, blob } = req.body || {};
  if (!siteKey || !blob?.ciphertext || !blob?.iv || !blob?.salt) {
    return res.status(400).json({ error: 'invalid body' });
  }
  const db = await readDB(org);
  db.credentials = db.credentials || {};
  db.credentials[siteKey] = blob;
  await writeDB(org, db);
  res.json({ ok: true });
});

app.get('/api/admin/list', requireAdmin, async (req, res) => {
  const org = (req.query.org || 'default').toString();
  const db = await readDB(org);
  res.json(db);
});

app.delete('/api/admin/reset', requireAdmin, async (req, res) => {
  const org = (req.query.org || 'default').toString();
  await writeDB(org, { sites: [], credentials: {} });
  res.json({ ok: true });
});

// ==== Operator fetch ====
app.get('/api/config', requireOrg, async (req, res) => {
  const org = (req.query.org || 'default').toString();
  const db = await readDB(org);
  res.json(db);
});

// health
app.get('/healthz', (req, res) => res.json({ ok: true }));

// start
bootstrap().then(() => {
  app.listen(PORT, () => console.log(`🚀 autologin-remote server on :${PORT}`));
}).catch(err => {
  console.error('DB bootstrap failed', err);
  process.exit(1);
});
