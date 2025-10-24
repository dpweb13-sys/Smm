import { Telegraf } from "telegraf";
import axios from "axios";

const BOT_TOKEN = process.env.BOT_TOKEN;
const VIRALSMM_API_KEY = process.env.VIRALSMM_API_KEY;
const VIRALSMM_API_URL = "https://viralsmm.in/api/v2";

const bot = new Telegraf(BOT_TOKEN);

// ✅ Web server to keep alive (Render requirement)
import express from "express";
const app = express();
app.get("/", (req, res) => res.send("ViralSMM Bot Running ✅"));
app.listen(process.env.PORT || 3000);

// === COMMANDS ===
bot.start((ctx) =>
  ctx.reply(
    `👋 Welcome ${ctx.from.first_name}!
আমি ViralSMM বট 💸  
তুমি এখান থেকে সরাসরি অর্ডার দিতে পারবে।

📌 Commands:
👉 /balance — ব্যালান্স দেখো  
👉 /services — সার্ভিস দেখো  
👉 /order — নতুন অর্ডার দাও  
👉 /status — অর্ডার স্ট্যাটাস`
  )
);

bot.command("balance", async (ctx) => {
  try {
    const { data } = await axios.post(VIRALSMM_API_URL, {
      key: VIRALSMM_API_KEY,
      action: "balance",
    });
    ctx.reply(`💰 ব্যালান্স: ${data.balance} ${data.currency}`);
  } catch {
    ctx.reply("⚠️ ব্যালান্স আনতে সমস্যা হচ্ছে!");
  }
});

bot.command("services", async (ctx) => {
  try {
    ctx.reply("⏳ সার্ভিস লোড হচ্ছে...");
    const { data } = await axios.post(VIRALSMM_API_URL, {
      key: VIRALSMM_API_KEY,
      action: "services",
    });

    let msg = "📋 First 10 Services:\n\n";
    data.slice(0, 10).forEach((s) => {
      msg += `🆔 ${s.service}\n📛 ${s.name}\n💵 ${s.rate}/1000\n📦 Min: ${s.min} / Max: ${s.max}\n\n`;
    });
    ctx.reply(msg);
  } catch {
    ctx.reply("⚠️ সার্ভিস আনতে সমস্যা হচ্ছে!");
  }
});

bot.command("order", async (ctx) => {
  const args = ctx.message.text.split(" ");
  if (args.length < 4)
    return ctx.reply("🛒 ব্যবহার: /order <service_id> <link> <quantity>");

  const [cmd, service, link, quantity] = args;

  try {
    const { data } = await axios.post(VIRALSMM_API_URL, {
      key: VIRALSMM_API_KEY,
      action: "add",
      service,
      link,
      quantity,
    });

    if (data.order)
      ctx.reply(`✅ অর্ডার সফল!\n🆔 Order ID: ${data.order}`);
    else ctx.reply("❌ অর্ডার দিতে সমস্যা হয়েছে!");
  } catch {
    ctx.reply("⚠️ API Error!");
  }
});

bot.command("status", async (ctx) => {
  const args = ctx.message.text.split(" ");
  if (args.length < 2) return ctx.reply("📦 ব্যবহার: /status <order_id>");
  const order = args[1];

  try {
    const { data } = await axios.post(VIRALSMM_API_URL, {
      key: VIRALSMM_API_KEY,
      action: "status",
      order,
    });
    ctx.reply(
      `📦 Order ID: ${order}\n📊 Status: ${data.status}\n💰 Charge: ${data.charge}\n🔢 Remains: ${data.remains}`
    );
  } catch {
    ctx.reply("⚠️ স্ট্যাটাস আনতে সমস্যা হচ্ছে!");
  }
});

bot.launch();
console.log("🤖 ViralSMM Bot is running...");
