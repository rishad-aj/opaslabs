import crypto from 'crypto';

const memoryStore = {};

function generateCode(length = 6) {
  return crypto.randomBytes(length).toString('base64url').slice(0, length);
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const body = await new Promise((resolve, reject) => {
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

      const { url } = body;

      if (!url || typeof url !== 'string' || !url.startsWith('http')) {
        return res.status(400).json({ error: 'Invalid or missing URL.' });
      }

      const code = generateCode();
      memoryStore[code] = url;

      const baseUrl = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}`;
      const shortUrl = `${baseUrl}/api/generate?redirect=${code}`;

      return res.status(200).json({ original: url, short: shortUrl });
    } catch (err) {
      console.error('POST error:', err);
      return res.status(400).json({ error: 'Malformed JSON body.' });
    }
  }

  if (req.method === 'GET') {
    const code = req.query.redirect;

    if (!code || typeof code !== 'string') {
      return res.status(400).send('Missing or invalid redirect code.');
    }

    const destination = memoryStore[code];

    if (destination) {
      return res.writeHead(302, { Location: destination }).end();
    } else {
      return res.status(404).send('Short link not found.');
    }
  }

  res.status(405).send('Method Not Allowed');
}
