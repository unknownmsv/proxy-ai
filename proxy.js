require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

app.post("/proxy/:ai", async (req, res) => {
  const ai = req.params.ai.toLowerCase();
  const prompt = req.body.prompt;

  try {
    let response;

    switch (ai) {
      case "openai":
        response = await axios.post(
          "https://api.openai.com/v1/chat/completions",
          {
            model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );
        return res.json(response.data);

      case "claude":
        response = await axios.post(
          "https://api.anthropic.com/v1/messages",
          {
            model: process.env.CLAUDE_MODEL || "claude-3-sonnet-20240229",
            max_tokens: 1024,
            messages: [{ role: "user", content: prompt }],
          },
          {
            headers: {
              "x-api-key": process.env.CLAUDE_API_KEY,
              "anthropic-version": "2023-06-01",
              "Content-Type": "application/json",
            },
          }
        );
        return res.json(response.data);

      case "gemini":
        response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || "gemini-pro"}:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            contents: [{ parts: [{ text: prompt }] }],
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const geminiReply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini.";
        return res.json({ response: geminiReply });

      case "ollama":
        response = await axios.post(
          "http://localhost:11434/api/chat",
          {
            model: process.env.OLLAMA_MODEL || "llama3",
            messages: [{ role: "user", content: prompt }],
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const ollamaReply = response.data.message?.content || "No response from Ollama.";
        return res.json({ response: ollamaReply });

      default:
        return res.status(404).json({ error: `AI provider "${ai}" not supported.` });
    }
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Failed to get response from AI provider." });
  }
});

const PORT = 8080;
app.listen(PORT, () => console.log(`⚡ Multi-AI Proxy running on http://localhost:${PORT}`));