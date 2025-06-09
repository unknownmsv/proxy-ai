import * as dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import axios, { AxiosError } from 'axios';


interface AIRequest {
  prompt: string;
}

interface AIResponse {
  [key: string]: any; 
}


const AI_CONFIG = {
  openai: {
    url: "https://api.openai.com/v1/chat/completions",
    model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
  },
  claude: {
    url: "https://api.anthropic.com/v1/messages",
    model: process.env.CLAUDE_MODEL || "claude-3-sonnet-20240229",
    headers: {
      "x-api-key": process.env.CLAUDE_API_KEY,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
  },
  gemini: {
    url: `https://generativelanguage.googleapis.com/v1beta/models/${
      process.env.GEMINI_MODEL || "gemini-pro"
    }:generateContent`,
    key: `?key=${process.env.GEMINI_API_KEY}`,
    headers: {
      "Content-Type": "application/json",
    },
  },
  ollama: {
    url: "http://localhost:11434/api/chat",
    model: process.env.OLLAMA_MODEL || "llama3",
    headers: {
      "Content-Type": "application/json",
    },
  },
};

const app = express();
app.use(express.json());


const validateInput = (ai: string, prompt: string): string | null => {
  if (!Object.keys(AI_CONFIG).includes(ai)) {
    return `Unsupported AI provider. Valid options: ${Object.keys(AI_CONFIG).join(", ")}`;
  }
  if (!prompt || typeof prompt !== "string") {
    return "Prompt must be a non-empty string";
  }
  return null;
};


app.post("/proxy/:ai", async (req: Request<{ ai: string }, {}, AIRequest>, res: Response) => {
  const ai = req.params.ai.toLowerCase();
  const { prompt } = req.body;


  const validationError = validateInput(ai, prompt);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    let response: AIResponse;

    switch (ai) {
      case "openai":
        response = await axios.post(
          AI_CONFIG.openai.url,
          {
            model: AI_CONFIG.openai.model,
            messages: [{ role: "user", content: prompt }],
          },
          { headers: AI_CONFIG.openai.headers, timeout: 10000 }
        );
        break;

      case "claude":
        response = await axios.post(
          AI_CONFIG.claude.url,
          {
            model: AI_CONFIG.claude.model,
            max_tokens: 1024,
            messages: [{ role: "user", content: prompt }],
          },
          { headers: AI_CONFIG.claude.headers, timeout: 10000 }
        );
        break;

      case "gemini":
        response = await axios.post(
          `${AI_CONFIG.gemini.url}${AI_CONFIG.gemini.key}`,
          {
            contents: [{ parts: [{ text: prompt }] }],
          },
          { headers: AI_CONFIG.gemini.headers, timeout: 10000 }
        );
        response = { response: response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini." };
        break;

      case "ollama":
        response = await axios.post(
          AI_CONFIG.ollama.url,
          {
            model: AI_CONFIG.ollama.model,
            messages: [{ role: "user", content: prompt }],
          },
          { headers: AI_CONFIG.ollama.headers, timeout: 10000 }
        );
        response = { response: response.data.message?.content || "No response from Ollama." };
        break;

      default:
        return res.status(404).json({ error: "AI provider not found" });
    }

    return res.json(response);
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(axiosError.response?.data || axiosError.message);
    return res.status(500).json({
      error: "AI provider request failed",
      details: axiosError.response?.data || axiosError.message,
    });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`⚡ Multi-AI Proxy running on http://localhost:${PORT}`);
});