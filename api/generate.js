import { writeFileSync, readFileSync, existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';

// Temp file used for storing shortened link mappings (resets on cold start)
const storageFile = path.resolve('/tmp/short-urls.json');

// Load stored short links from file
function loadStorage() {
  if (existsSync(storageFile)) {
    return JSON.parse(readFileSync(storageFile, 'utf-8'));
  }
  return {};
}

// Save short link mappings to file
function saveStorage(data) {
  writeFileSync(storageFile, JSON.stringify(data), 'utf-8');
}

// Generate a short random code
function generateCode(length = 6) {
  return crypto.randomBytes(length).toString('base64url').slice(0, length);
}

// Main handler
export default function handler(req, res) {
  // POST: Generate a new short link
  if (req.method === 'POST') {
    const { url } = req.body;

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
  }

  // GET: Redirect based on short code
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

  // Method not allowed
  return res.status(405).send('Method Not Allowed');
}
