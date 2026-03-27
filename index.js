export default {
  async fetch(request, env) {
    // 1. التأكد أن الطلب قادم من تلجرام عبر POST
    if (request.method !== "POST") {
      return new Response("Bot is active!", { status: 200 });
    }

    try {
      const payload = await request.json();

      // 2. معالجة الرسائل النصية فقط
      if (payload.message && payload.message.text) {
        const { chat, from, text, date } = payload.message;

        // استخراج البيانات
        const chatId = chat.id.toString();
        const userId = from.id.toString();
        const username = from.username || from.first_name || "Unknown";
        const messageText = text;

        // 3. تخزين الرسالة في قاعدة البيانات D1
        // تأكد أن اسم الربط (Binding) في wrangler.toml هو DB
        await env.DB.prepare(
          "INSERT INTO messages (chat_id, user_id, username, message_text) VALUES (?, ?, ?, ?)"
        )
        .bind(chatId, userId, username, messageText)
        .run();

        // (اختياري) الرد على أمر معين للتأكد من عمل البot
        if (messageText === "/status") {
          await sendMessage(chatId, "✅ أنا متصل وأقوم بتخزين الرسائل الآن!", env.BOT_TOKEN);
        }
      }

      return new Response("OK", { status: 200 });
    } catch (error) {
      console.error("Error:", error.message);
      return new Response("Error processing update", { status: 500 });
    }
  },
};

// وظيفة مساعدة لإرسال الرسائل (تستخدم التوكن من السيكرتس)
async function sendMessage(chatId, text, token) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: text }),
  });
}
