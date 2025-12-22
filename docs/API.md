# API 文档

Life-Kline 后端 API 接口文档

## 基础信息

- **Base URL**: `http://localhost:3000` (本地开发)
- **生产环境**: `https://api.life-kline.com` (如果有)
- **认证方式**: JWT Token (部分接口需要)
- **数据格式**: JSON

---

## 认证

### 注册

创建新用户账号。

```http
POST /api/auth/register
```

**请求体：**

```json
{
  "username": "string",
  "password": "string"
}
```

**响应：**

```json
{
  "token": "jwt-token-string",
  "user": {
    "id": 1,
    "username": "string",
    "points": 1000,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**错误响应：**

- `400 Bad Request` - 用户名已存在或参数无效
- `500 Internal Server Error` - 服务器错误

---

### 登录

用户登录获取 token。

```http
POST /api/auth/login
```

**请求体：**

```json
{
  "username": "string",
  "password": "string"
}
```

**响应：** 同注册接口

---

### 刷新 Token

使用 cookie 中的 token 刷新认证。

```http
POST /api/auth/refresh
```

**响应：**

```json
{
  "user": {
    "id": 1,
    "username": "string",
    "points": 1000,
    "email": "user@example.com",
    "email_verified": true
  }
}
```

---

## 用户信息

所有用户相关接口需要在请求头携带 JWT token：

```http
Authorization: Bearer <token>
```

### 获取用户信息

```http
GET /api/user/me
```

**响应：**

```json
{
  "id": 1,
  "username": "string",
  "points": 1000,
  "email": "user@example.com",
  "email_verified": true,
  "email_subscribed": false
}
```

---

### 更新邮箱

```http
POST /api/user/update-email
```

**请求体：**

```json
{
  "email": "new-email@example.com"
}
```

**响应：**

```json
{
  "message": "验证码已发送",
  "email": "new-email@example.com"
}
```

---

### 验证邮箱

```http
POST /api/user/verify-email
```

**请求体：**

```json
{
  "code": "123456"
}
```

**响应：**

```json
{
  "message": "邮箱验证成功",
  "points": 2000
}
```

---

## 八字分析

### 计算八字

基于出生信息计算八字命盘。

```http
POST /api/bazi/calculate
```

**请求体：**

```json
{
  "name": "张三",
  "gender": "male",
  "birthDate": "1990-01-15",
  "birthTime": "14:30",
  "birthplace": {
    "name": "北京市",
    "longitude": 116.4074,
    "latitude": 39.9042
  },
  "isLunar": false
}
```

**响应：**

```json
{
  "bazi": {
    "year": { "gan": "庚", "zhi": "午" },
    "month": { "gan": "戊", "zhi": "寅" },
    "day": { "gan": "甲", "zhi": "子" },
    "hour": { "gan": "辛", "zhi": "未" }
  },
  "dayun": [
    {
      "age": 8,
      "gan": "己",
      "zhi": "卯",
      "startYear": 1998,
      "endYear": 2008
    }
    // ... 更多大运
  ],
  "liunian": [
    {
      "age": 1,
      "year": 1990,
      "gan": "庚",
      "zhi": "午"
    }
    // ... 每年的流年
  ]
}
```

---

### AI 分析 (流式)

基于八字进行 AI 深度分析，返回流式数据。

```http
POST /api/analyze/unified-stream
```

**请求头：**

```http
Content-Type: application/json
Accept: text/event-stream
```

**请求体：**

```json
{
  "name": "张三",
  "gender": "male",
  "birthDate": "1990-01-15",
  "birthTime": "14:30",
  "birthplace": {
    "name": "北京市",
    "longitude": 116.4074,
    "latitude": 39.9042
  },
  "isLunar": false,
  "baziData": {
    // 八字数据（从 /api/bazi/calculate 获取）
  }
}
```

**响应：** Server-Sent Events (SSE) 流

```
data: {"type":"start","section":"core"}

data: {"type":"content","section":"core","content":"【命主性格】\n..."}

data: {"type":"complete","section":"core"}

data: {"type":"start","section":"career"}

...

data: {"type":"done"}
```

**事件类型：**

- `start` - 开始某个章节
- `content` - 章节内容（增量）
- `complete` - 章节完成
- `error` - 发生错误
- `done` - 全部完成

**章节类型：**

- `core` - 核心命理
- `career` - 事业财富
- `relationship` - 婚姻健康
- `past_kline` - 过去 K 线
- `future_kline` - 未来 K 线
- `crypto` - Web3 运势

---

## 档案管理

### 创建档案

```http
POST /api/profiles
```

**请求体：**

```json
{
  "name": "张三",
  "gender": "male",
  "birthDate": "1990-01-15",
  "birthTime": "14:30",
  "birthplace": {
    "name": "北京市",
    "longitude": 116.4074,
    "latitude": 39.9042
  },
  "isLunar": false,
  "notes": "备注信息（可选）"
}
```

**响应：**

```json
{
  "id": 1,
  "user_id": 1,
  "name": "张三",
  "gender": "male",
  "birth_date": "1990-01-15",
  "birth_time": "14:30",
  "birthplace": "{...}",
  "is_lunar": false,
  "notes": "备注信息",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

---

### 获取所有档案

```http
GET /api/profiles
```

**响应：**

```json
[
  {
    "id": 1,
    "name": "张三",
    "gender": "male",
    "birth_date": "1990-01-15",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
  // ... 更多档案
]
```

---

### 获取单个档案

```http
GET /api/profiles/:id
```

**响应：** 同创建档案响应

---

### 更新档案

```http
PUT /api/profiles/:id
```

**请求体：** 同创建档案请求体

---

### 删除档案

```http
DELETE /api/profiles/:id
```

**响应：**

```json
{
  "message": "档案已删除"
}
```

---

## 名人案例

### 获取所有案例

```http
GET /api/celebrities
```

**查询参数：**

- `limit` - 返回数量（默认 50）
- `offset` - 偏移量（默认 0）

**响应：**

```json
{
  "cases": [
    {
      "id": 1,
      "name": "乔布斯",
      "gender": "male",
      "birth_date": "1955-02-24",
      "category": "科技",
      "description": "苹果公司联合创始人",
      "achievements": "革新了个人电脑、智能手机行业"
    }
    // ... 更多案例
  ],
  "total": 100
}
```

---

### 搜索案例

```http
GET /api/celebrities/search
```

**查询参数：**

- `q` - 搜索关键词
- `category` - 分类筛选

**响应：** 同获取所有案例

---

### 获取相似案例

基于八字相似度匹配案例。

```http
POST /api/celebrities/similar
```

**请求体：**

```json
{
  "baziData": {
    // 八字数据
  }
}
```

**响应：**

```json
{
  "matches": [
    {
      "celebrity": {
        "id": 1,
        "name": "乔布斯",
        "description": "..."
      },
      "similarity": 0.85,
      "matchDetails": {
        "yearMatch": true,
        "monthMatch": false,
        "dayMatch": true,
        "hourMatch": false
      }
    }
    // ... 更多匹配
  ]
}
```

---

## 积分系统

### 获取积分记录

```http
GET /api/points/history
```

**响应：**

```json
{
  "history": [
    {
      "id": 1,
      "amount": -50,
      "reason": "AI 分析",
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "amount": 1000,
      "reason": "邮箱绑定奖励",
      "created_at": "2024-01-02T00:00:00.000Z"
    }
  ],
  "current_points": 1950
}
```

---

### 兑换积分

```http
POST /api/points/redeem
```

**请求体：**

```json
{
  "code": "VOUCHER-CODE-HERE"
}
```

**响应：**

```json
{
  "message": "兑换成功",
  "points": 500,
  "new_balance": 2450
}
```

---

## 知识中心

### 获取知识文章列表

```http
GET /api/knowledge
```

**查询参数：**

- `category` - 分类（可选）

**响应：**

```json
{
  "articles": [
    {
      "id": 1,
      "title": "什么是八字",
      "category": "基础知识",
      "excerpt": "八字，也称四柱...",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 获取知识文章详情

```http
GET /api/knowledge/:id
```

**响应：**

```json
{
  "id": 1,
  "title": "什么是八字",
  "category": "基础知识",
  "content": "完整的 Markdown 内容...",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 错误码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 409 | 资源冲突（如用户名已存在） |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |

**错误响应格式：**

```json
{
  "error": "错误描述"
}
```

---

## 速率限制

为防止滥用，部分接口有速率限制：

- **AI 分析**: 每用户每分钟 3 次
- **注册/登录**: 每 IP 每小时 10 次
- **邮件发送**: 每用户每小时 5 次

超出限制将返回 `429 Too Many Requests`。

---

## WebSocket (未来计划)

计划中的实时功能：

- 实时运势推送
- 在线聊天咨询
- 多人在线分析

---

## 示例代码

### JavaScript/TypeScript

```typescript
// 登录
const login = async (username: string, password: string) => {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  const data = await response.json()
  localStorage.setItem('token', data.token)
  return data
}

// 计算八字
const calculateBazi = async (birthInfo: any) => {
  const response = await fetch('http://localhost:3000/api/bazi/calculate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(birthInfo)
  })
  return await response.json()
}

// AI 分析（流式）
const analyzeStream = async (data: any, onMessage: (msg: any) => void) => {
  const response = await fetch('http://localhost:3000/api/analyze/unified-stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(data)
  })

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value)
    const lines = chunk.split('\n')

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6))
        onMessage(data)
      }
    }
  }
}
```

### Python

```python
import requests

# 登录
def login(username, password):
    response = requests.post('http://localhost:3000/api/auth/login', json={
        'username': username,
        'password': password
    })
    data = response.json()
    return data['token']

# 计算八字
def calculate_bazi(token, birth_info):
    response = requests.post('http://localhost:3000/api/bazi/calculate',
        headers={'Authorization': f'Bearer {token}'},
        json=birth_info
    )
    return response.json()
```

### cURL

```bash
# 登录
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user","password":"pass"}'

# 计算八字
curl -X POST http://localhost:3000/api/bazi/calculate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "张三",
    "gender": "male",
    "birthDate": "1990-01-15",
    "birthTime": "14:30",
    "birthplace": {"name":"北京市","longitude":116.4074,"latitude":39.9042},
    "isLunar": false
  }'
```

---

## 开发者工具

推荐使用以下工具测试 API：

- [Postman](https://www.postman.com/) - API 测试工具
- [HTTPie](https://httpie.io/) - 命令行 HTTP 客户端
- [Thunder Client](https://www.thunderclient.com/) - VS Code 插件

---

<p align="center">
  <a href="../README.md">返回主页</a> •
  <a href="ARCHITECTURE-SIMPLIFICATION.md">架构文档</a>
</p>
