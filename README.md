# 🤖 Proxy-AI

یک API Proxy هوشمند برای اتصال به چندین مدل هوش مصنوعی از طریق یک نقطه‌ی واحد!

---

## 📦 درباره پروژه

این پروژه یک **پراکسی API** ساخته شده با `Node.js + Express` است که به شما اجازه می‌دهد با استفاده از یک مسیر یکتا مانند:

localhost:8080/proxy/{ai_name}

به چندین مدل هوش مصنوعی متصل شوید، از جمله:

- 🧠 OpenAI GPT
- 🧠 Google Gemini
- 🧠 xAI Grok
- 🧠 Anthropic Claude
- 🧠 Ollama (local)

---

## ⚙️ ویژگی‌ها

- اتصال به چندین API با یک مسیر ساده
- تنظیم مدل‌ها از طریق فایل `.env`
- ساختار ماژولار و قابل گسترش برای اضافه کردن مدل‌های جدید
- امکان اجرای local مدل‌هایی مثل Ollama
- قابل دیپلوی روی سرور خانگی یا cloud

---

## 🛠️ نصب

### 1. Clone پروژه:

```bash
git clone https://github.com/unknownmsv/proxy-ai.git
cd proxy-ai

### 2. نصب کتاب خونه ها:
```bash
npm install
