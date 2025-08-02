import { kv } from '@vercel/kv';

export default async (req, res) => {
  const { shortCode } = req.query;

  try {
    const urlData = await kv.get(`short:${shortCode}`);
    
    if (!urlData) {
      return res.status(404).send(`
        <h1>404 - Link Not Found</h1>
        <p>This short URL doesn't exist or has expired.</p>
      `);
    }

    // Update click count
    await kv.set(`short:${shortCode}`, {
      ...urlData,
      clicks: urlData.clicks + 1
    });

    // Redirect to original URL
    res.redirect(302, urlData.originalUrl);

  } catch (error) {
    console.error('Redirect error:', error);
    res.status(500).send('Server error');
  }
};
