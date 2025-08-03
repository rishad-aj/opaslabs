export default async function handler(req, res) {
  const token = process.env.TELEGRAM_TOKEN;
  const apiUrl = `https://api.telegram.org/bot${token}/sendMessage`;

  if (req.method !== "POST") {
    return res.status(200).send("OK");
  }

  const body = req.body;
  const message = body.message || body.edited_message;

  if (!message || !message.text) {
    return res.status(200).send("No valid message");
  }

  const chatId = message.chat.id;
  const text = message.text.trim();

  // Handle /start or /start=payload
  if (text.startsWith("/start")) {
    const responseText = `Your Chat ID: \`${chatId}\`\nTap to copy.`;

    await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: responseText,
        parse_mode: "Markdown"
      })
    });

    return res.status(200).json({ ok: true });
  }

  // Default fallback for unknown commands
  await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: "❓ Unknown command. Try /start"
    })
  });

  return res.status(200).json({ ok: true });
}
