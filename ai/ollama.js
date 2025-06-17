const axios = require("axios");

module.exports = async function ollamaHandler(prompt) {
  const response = await axios.post(
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
  return {
    response: response.data.message?.content || "No response from Ollama.",
  };
};