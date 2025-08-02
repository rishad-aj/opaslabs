import { kv } from '@vercel/kv';

export default async (req, res) => {
  const { shortCode } = req.query;

  try {
    const data = await kv.get(`link:${shortCode}`);
    if (!data) return res.status(404).send('Link expired or invalid');

    // Update click count
    await kv.set(`link:${shortCode}`, { 
      ...data, 
      clicks: data.clicks + 1 
    });

    // Redirect
    res.redirect(302, data.originalUrl);

  } catch (error) {
    res.status(500).send('Server error');
  }
};
