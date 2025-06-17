const axios = require("axios");

module.exports = async function claudeHandler(prompt) {
  const response = await axios.post(
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
  return response.data;
};