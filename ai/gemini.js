const axios = require("axios");

module.exports = async function geminiHandler(prompt) {
  const response = await axios.post(
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
  return {
    response:
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from Gemini.",
  };
};