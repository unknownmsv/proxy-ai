require("dotenv").config();
const express = require("express");

const app = express();
app.use(express.json());

const handlers = {
  openai: require("./ai/openai"),
  claude: require("./ai/claude"),
  gemini: require("./ai/gemini"),
  ollama: require("./ai/ollama"),
};

app.post("/proxy/:ai", async (req, res) => {
  const ai = req.params.ai.toLowerCase();
  const prompt = req.body.prompt;
  const acceptStream = req.headers.accept === "text/event-stream"; // تشخیص کلاینت استریم

  if (!prompt) {
    return res.status(400).json({ error: "پارامتر 'prompt' الزامی است." });
  }

  const handler = handlers[ai];
  if (!handler) {
    return res.status(404).json({ error: `سرویس ${ai} پشتیبانی نمی‌شود.` });
  }

  try {
    if (acceptStream) {
      // حالت استریم برای کلاینت‌های سازگار (مثل EventSource)
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const ollamaStream = await handler(prompt, { stream: true });
      ollamaStream.on("data", (chunk) => {
        const data = chunk.toString();
        res.write(`data: ${data}\n\n`); // ارسال به فرمت SSE
      });

      ollamaStream.on("end", () => res.end());
    } else {
      // حالت عادی برای کلاینت‌های معمولی (مثل fetch/axios)
      const result = await handler(prompt, { stream: false });
      res.json(result);
    }
  } catch (err) {
    console.error("Proxy Error:", err.message);
    if (acceptStream) {
      res.write(`event: error\ndata: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

const PORT = 8080;
app.listen(PORT, () => console.log(`⚡ Proxy-AI running at http://localhost:${PORT}`));