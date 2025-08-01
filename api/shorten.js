const urlMap = {}; // In-memory store (use a DB in prod)

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { longUrl } = req.body;

  if (!longUrl) {
    return res.status(400).json({ error: 'Missing longUrl' });
  }

  const shortId = Math.random().toString(36).substr(2, 6);

  urlMap[shortId] = longUrl;

  const shortUrl = `https://${req.headers.host}/s/${shortId}`;

  res.status(200).json({ shortUrl });
};
