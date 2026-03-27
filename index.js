export default {
  async fetch(request, env) {
    if (request.method === "POST") {
      const payload = await request.json();

      // التحقق من وجود رسالة نصية
      if (payload.message && payload.message.text) {
        const msg = payload.message;
        const chatId = msg.chat.id.toString();
        const userId = msg.from.id.toString();
        const username = msg.from.username || msg.from.first_name;
        const text = msg.text;

        try {
          // إدخال البيانات في D1
          await env.DB.prepare(
            "INSERT INTO messages (chat_id, user_id, username, message_text) VALUES (?, ?, ?, ?)"
          )
          .bind(chatId, userId, username, text)
          .run();
          
          return new Response("OK", { status: 200 });
        } catch (e) {
          console.error("D1 Error:", e.message);
          return new Response("Error storing message", { status: 500 });
        }
      }
    }
    return new Response("Bot is running!");
  },
};
