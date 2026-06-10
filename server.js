// server.js
const express = require('express');
const path = require('path');

// 1. 导入你的 API 处理函数
const chatApiHandler = require('./api/chat.js');

const app = express();
const PORT = process.env.PORT || 3000;

// 2. 允许 Express 解析 JSON 格式的请求体
app.use(express.json());

// 3. 核心路由：把 /api/chat 的请求交给你的 chat.js 处理
app.post('/api/chat', async (req, res) => {
    // 构造一个符合 Vercel 函数格式的 req 和 res 对象
    const vercelReq = { method: req.method, body: req.body };
    const vercelRes = {
        status: (code) => ({ json: (data) => res.status(code).json(data) }),
        setHeader: () => {},
        end: () => {},
        json: (data) => res.json(data)
    };
    await chatApiHandler.default(vercelReq, vercelRes);
});

// 4. 静态文件服务：让所有其他请求都能找到你的 index.html
app.use(express.static(path.join(__dirname, '/')));
// 处理前端路由（SPA fallback）
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 5. 启动服务器
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});