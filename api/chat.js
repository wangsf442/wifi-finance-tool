// api/chat.js - CommonJS 版本，用于 Railway / Node.js 环境

module.exports = async function handler(req, res) {
  // 处理 OPTIONS 预检请求（解决 CORS 问题）
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // 仅允许 POST 方法
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 获取环境变量中的 API Key（Railway 中配置 BAILIAN_API_KEY）
  const apiKey = process.env.BAILIAN_API_KEY;
  if (!apiKey) {
    console.error('Missing BAILIAN_API_KEY environment variable');
    return res.status(500).json({ error: 'Server misconfiguration: missing API key' });
  }

  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Invalid request: messages array is required and must not be empty' });
    }

    // 调用阿里云百炼 API（兼容 OpenAI 接口格式）
    const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'qwen-plus',     // 可换成 qwen-turbo / qwen-max
        messages: messages,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`External API error: ${response.status} - ${errorText}`);
      return res.status(response.status).json({ error: 'External API request failed' });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Internal server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};