const axios = require("axios");

module.exports = async function ollamaHandler(prompt, { stream = false } = {}) {
  try {
    const response = await axios.post(
      "http://localhost:11434/api/chat",
      {
        model: process.env.OLLAMA_MODEL || "llama3",
        messages: [{ role: "user", content: prompt }],
        stream: stream
      },
      {
        headers: { "Content-Type": "application/json" },
        responseType: stream ? "stream" : "json"
      }
    );

    return stream ? response.data : { response: response.data.message?.content };
  } catch (err) {
    console.error("Ollama Error:", err.message);
    throw err;
  }
};