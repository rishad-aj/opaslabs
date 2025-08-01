import { writeFileSync, readFileSync, existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';

// Utility to parse the body from a Vercel-style serverless function
async function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => (data += chunk));
    req.on('end', () => {
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(err);
      }
    });
  });
}

// Temp storage file
const storageFile = path.resolve('/tmp/short-urls.json');

// Helpers for storage
function loadStorage() {
  if (existsSync(storageFile)) {
    return JSON.parse(readFileSync(storageFile, 'utf-8'));
  }
  return {};
}

function saveStorage(data) {
  writeFileSync(storageFile, JSON.stringify(data), 'utf-8');
}

function generateCode(length = 6) {
  return crypto.randomBytes(length).toString('base64url').slice(0, length);
}

// Main handler
export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const body = await parseBody(req);
      const { url } = body;

      if (!url || typeof url !== 'string' || !url.startsWith('http')) {
        return res.status(400).json({ error: 'Invalid or missing URL.' });
      }

      const db = loadStorage();
      const code = generateCode();
      db[code] = url;
      saveStorage(db);

      const baseUrl = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}`;
      const shortUrl = `${baseUrl}/api/generate?redirect=${code}`;

      return res.status(200).json({ original: url, short: shortUrl });
    } catch (err) {
      return res.status(400).json({ error: 'Malformed JSON body.' });
    }
  }

  if (req.method === 'GET') {
    const code = req.query.redirect;
    if (!code || typeof code !== 'string') {
      return res.status(400).send('Missing or invalid redirect code.');
    }

    const db = loadStorage();
    const destination = db[code];

    if (destination) {
      return res.writeHead(302, { Location: destination }).end();
    } else {
      return res.status(404).send('Short link not found.');
    }
  }

  res.status(405).send('Method Not Allowed');
}
