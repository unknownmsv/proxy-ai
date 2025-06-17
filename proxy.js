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

  const handler = handlers[ai];
  if (!handler) {
    return res.status(404).json({ error: `AI provider "${ai}" not supported.` });
  }

  try {
    const result = await handler(prompt);
    res.json(result);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to get response from AI provider." });
  }
});

const PORT = 8080;
app.listen(PORT, () => console.log(`⚡ Proxy-AI running at http://localhost:${PORT}`));