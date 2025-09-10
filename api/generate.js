// pages/api/generate.js

// Temporary in-memory storage (replace with a real DB in production)
const links = new Map();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { telegramId, redirectUrl, secret } = req.body;

  // Require secret code to prevent unauthorized use
  if (secret !== process.env.SECRET_CODE) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  if (!telegramId || !redirectUrl) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Generate short token (8 characters)
  const token = [...Array(8)].map(() => Math.random().toString(36)[2]).join('');

  // Store mapping
  links.set(token, { telegramId, redirectUrl });

  const shortUrl = `${process.env.BASE_URL}/api/s/${token}`;
  return res.status(200).json({ link: shortUrl });
}

// Export links map so it can be used in the redirect API
export { links };
