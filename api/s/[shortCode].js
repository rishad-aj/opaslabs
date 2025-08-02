// pages/api/s/[shortCode].js
import { links } from '../generate';

export default async function handler(req, res) {
  const { shortCode } = req.query;

  const entry = links.get(shortCode);

  if (!entry) {
    return res.status(404).send('Short link not found');
  }

  // Optional: log usage, telegramId, etc.
  console.log(`Redirecting shortCode ${shortCode} for telegramId: ${entry.telegramId}`);

  res.writeHead(302, { Location: entry.redirectUrl });
  res.end();
}
