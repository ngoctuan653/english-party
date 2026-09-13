const fs = require('fs');
const path = require('path');

function getGeminiApiKey() {
  if (process.env.VITE_GEMINI_API_KEY) return process.env.VITE_GEMINI_API_KEY;
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  try {
    const envPath = path.resolve(__dirname, '../.env.local');
    if (fs.existsSync(envPath)) {
      const match = fs.readFileSync(envPath, 'utf8').match(/VITE_GEMINI_API_KEY\s*=\s*([^\r\n]+)/);
      if (match) return match[1].trim();
    }
  } catch (e) {}
  return '';
}

module.exports = { getGeminiApiKey };
