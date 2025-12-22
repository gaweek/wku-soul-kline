# 部署指南

本指南介绍如何将 Life-Kline 部署到生产环境。

## 目录

- [部署前准备](#部署前准备)
- [本地开发环境](#本地开发环境)
- [生产环境部署](#生产环境部署)
  - [方案一：单服务器部署](#方案一单服务器部署)
  - [方案二：Docker 部署](#方案二docker-部署)
  - [方案三：云平台部署](#方案三云平台部署)
- [环境变量配置](#环境变量配置)
- [数据库管理](#数据库管理)
- [性能优化](#性能优化)
- [监控和日志](#监控和日志)
- [故障排查](#故障排查)

---

## 部署前准备

### 系统要求

**最低配置：**
- CPU: 1 核
- 内存: 1GB
- 磁盘: 10GB
- 操作系统: Ubuntu 20.04+, CentOS 7+, macOS, Windows Server

**推荐配置：**
- CPU: 2 核+
- 内存: 2GB+
- 磁盘: 20GB+ SSD
- 操作系统: Ubuntu 22.04 LTS

### 软件依赖

- Node.js 18+ (推荐 LTS 版本)
- npm 或 pnpm
- Git
- PM2 (进程管理)
- Nginx (可选，用于反向代理)
- SSL 证书 (生产环境必需)

---

## 本地开发环境

### 安装步骤

```bash
# 1. 克隆仓库
git clone https://github.com/miounet11/life-kline.git
cd life-kline

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
nano .env  # 编辑配置

# 4. 启动开发服务器
npm run dev
```

访问 http://localhost:5173

---

## 生产环境部署

### 方案一：单服务器部署

适合小型项目，所有服务运行在一台服务器上。

#### 1. 准备服务器

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PM2
sudo npm install -g pm2

# 安装 Nginx
sudo apt install -y nginx
```

#### 2. 部署应用

```bash
# 克隆代码
cd /var/www
sudo git clone https://github.com/miounet11/life-kline.git
cd life-kline

# 安装依赖
sudo npm install --production

# 构建前端
sudo npm run build

# 配置环境变量
sudo cp .env.example .env
sudo nano .env
```

**关键环境变量：**

```bash
# API 配置
API_BASE_URL=https://api.openai.com/v1
API_KEY=your-production-api-key
DEFAULT_MODEL=gpt-4

# 服务器配置
PORT=3000
NODE_ENV=production

# 安全配置
JWT_SECRET=your-very-secure-random-string-at-least-32-chars

# 积分配置
FREE_INIT_POINTS=1000
COST_PER_ANALYSIS=50

# 邮件配置（如果需要）
MAIL_SMTP_HOST=smtp.gmail.com
MAIL_SMTP_PORT=587
MAIL_FROM=noreply@life-kline.com
MAIL_PASSWORD=your-mail-password
BASE_URL=https://www.life-kline.com
```

#### 3. 配置 PM2

创建 `ecosystem.config.js`：

```javascript
module.exports = {
  apps: [{
    name: 'life-kline',
    script: 'server/index.js',
    instances: 2,  // 或 'max' 使用所有 CPU 核心
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true
  }]
}
```

启动应用：

```bash
# 创建日志目录
sudo mkdir -p logs

# 启动应用
sudo pm2 start ecosystem.config.js

# 设置开机自启
sudo pm2 startup
sudo pm2 save

# 查看状态
sudo pm2 status
sudo pm2 logs
```

#### 4. 配置 Nginx

创建 Nginx 配置文件 `/etc/nginx/sites-available/life-kline`：

```nginx
server {
    listen 80;
    server_name www.life-kline.com life-kline.com;

    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name www.life-kline.com life-kline.com;

    # SSL 证书配置
    ssl_certificate /etc/letsencrypt/live/life-kline.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/life-kline.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # 前端静态文件
    root /var/www/life-kline/dist;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # 前端路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # SSE 支持
        proxy_buffering off;
        proxy_read_timeout 300s;
    }

    # 缓存静态资源
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

启用配置：

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/life-kline /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重载 Nginx
sudo systemctl reload nginx
```

#### 5. 配置 SSL 证书

使用 Let's Encrypt 免费证书：

```bash
# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d life-kline.com -d www.life-kline.com

# 自动续期
sudo certbot renew --dry-run
```

---

### 方案二：Docker 部署

适合容器化部署，易于迁移和扩展。

#### 1. 创建 Dockerfile

```dockerfile
# 多阶段构建
FROM node:18-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package*.json ./
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建前端
RUN npm run build

# 生产镜像
FROM node:18-alpine

WORKDIR /app

# 复制依赖和构建产物
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/package.json ./

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

EXPOSE 3000

CMD ["node", "server/index.js"]
```

#### 2. 创建 docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    container_name: life-kline
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    env_file:
      - .env
    volumes:
      - ./data:/app/data  # 数据库持久化
      - ./logs:/app/logs  # 日志持久化
    networks:
      - life-kline-network

  nginx:
    image: nginx:alpine
    container_name: life-kline-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./dist:/usr/share/nginx/html:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
    depends_on:
      - app
    networks:
      - life-kline-network

networks:
  life-kline-network:
    driver: bridge
```

#### 3. 部署命令

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 更新部署
git pull
docker-compose up -d --build
```

---

### 方案三：云平台部署

#### Vercel (推荐用于前端)

1. 连接 GitHub 仓库
2. 配置构建设置：
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. 设置环境变量
4. 部署

#### Railway / Render (全栈部署)

1. 创建新服务
2. 连接 GitHub 仓库
3. 设置环境变量
4. 自动部署

#### AWS / Google Cloud / Azure

参考各平台的 Node.js 部署文档。

---

## 环境变量配置

### 必需变量

```bash
# AI API 配置
API_BASE_URL=https://api.openai.com/v1
API_KEY=sk-your-api-key

# 服务器配置
PORT=3000
NODE_ENV=production
JWT_SECRET=your-secure-random-string-min-32-chars

# 积分配置
FREE_INIT_POINTS=1000
COST_PER_ANALYSIS=50
```

### 可选变量

```bash
# 邮件服务
MAIL_SMTP_HOST=smtp.gmail.com
MAIL_SMTP_PORT=587
MAIL_FROM=noreply@life-kline.com
MAIL_PASSWORD=your-password
BASE_URL=https://www.life-kline.com

# 积分奖励
EMAIL_BINDING_REWARD=1000
EMAIL_SUBSCRIPTION_REWARD=1000

# 管理员
ADMIN_VOUCHER_PASSWORD=admin-password
```

---

## 数据库管理

### 备份

```bash
# 自动备份脚本
#!/bin/bash
BACKUP_DIR="/var/backups/life-kline"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
cp /var/www/life-kline/data/database.db $BACKUP_DIR/database_$DATE.db

# 保留最近 30 天的备份
find $BACKUP_DIR -name "database_*.db" -mtime +30 -delete
```

设置 cron 定时任务：

```bash
# 编辑 crontab
crontab -e

# 每天凌晨 2 点备份
0 2 * * * /path/to/backup-script.sh
```

### 恢复

```bash
# 停止应用
pm2 stop life-kline

# 恢复数据库
cp /var/backups/life-kline/database_YYYYMMDD_HHMMSS.db /var/www/life-kline/data/database.db

# 重启应用
pm2 start life-kline
```

---

## 性能优化

### 前端优化

1. **代码分割**
   - 已通过 Vite 自动实现

2. **资源压缩**
   - Gzip/Brotli 压缩
   - 图片优化

3. **CDN 加速**
   - 静态资源托管到 CDN
   - 使用 Cloudflare 等服务

### 后端优化

1. **启用缓存**
   - Redis 缓存热门数据
   - 内存缓存 AI 分析结果

2. **数据库优化**
   - 添加索引
   - 定期清理过期数据

3. **负载均衡**
   - PM2 cluster 模式
   - Nginx 负载均衡

---

## 监控和日志

### PM2 监控

```bash
# 实时监控
pm2 monit

# Web 监控界面
pm2 install pm2-web
pm2 web
```

### 日志管理

```bash
# 查看日志
pm2 logs

# 清空日志
pm2 flush

# 日志轮转
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 应用监控

推荐使用：
- **Sentry** - 错误追踪
- **New Relic** - 性能监控
- **Datadog** - 全方位监控

---

## 故障排查

### 常见问题

#### 1. 应用无法启动

```bash
# 检查日志
pm2 logs life-kline --lines 100

# 检查端口占用
sudo lsof -i :3000

# 检查环境变量
pm2 env 0
```

#### 2. 数据库锁定

```bash
# SQLite 数据库被锁定
# 确保只有一个进程访问数据库
pm2 restart life-kline
```

#### 3. 内存溢出

```bash
# 增加 Node.js 内存限制
# 修改 ecosystem.config.js
node_args: '--max-old-space-size=2048'

# 重启应用
pm2 restart life-kline
```

#### 4. SSL 证书问题

```bash
# 检查证书有效期
sudo certbot certificates

# 手动续期
sudo certbot renew
```

### 健康检查

创建健康检查端点：

```javascript
// server/index.js
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() })
})
```

设置监控：

```bash
# 使用 curl 检查
curl https://www.life-kline.com/health

# 使用 uptimerobot.com 等服务监控
```

---

## 安全最佳实践

1. **HTTPS 强制**
   - 所有流量重定向到 HTTPS
   - HSTS 头设置

2. **防火墙配置**
   ```bash
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw allow 22/tcp
   sudo ufw enable
   ```

3. **定期更新**
   ```bash
   # 更新依赖
   npm audit fix

   # 更新系统
   sudo apt update && sudo apt upgrade
   ```

4. **环境变量保护**
   - 不要提交 `.env` 到版本控制
   - 使用密钥管理服务

5. **速率限制**
   - 配置 Nginx 限流
   - 使用 express-rate-limit

---

## 更新部署

### 滚动更新（零停机）

```bash
# 1. 拉取最新代码
cd /var/www/life-kline
git pull

# 2. 安装依赖
npm install

# 3. 构建前端
npm run build

# 4. 重启应用（PM2 会平滑重启）
pm2 reload ecosystem.config.js
```

### 蓝绿部署

1. 部署到新环境
2. 测试验证
3. 切换流量
4. 保留旧环境作为回滚选项

---

## 性能基准

**预期性能指标：**

- API 响应时间: < 100ms (不含 AI 分析)
- AI 分析时间: 10-30s (取决于模型)
- 并发用户: 1000+ (2 核 2GB 配置)
- 页面加载时间: < 2s

**压力测试：**

```bash
# 使用 Apache Bench
ab -n 1000 -c 10 http://localhost:3000/api/health

# 使用 wrk
wrk -t12 -c400 -d30s http://localhost:3000/api/health
```

---

## 联系支持

如果部署过程中遇到问题：

- 查看 [FAQ](https://github.com/miounet11/life-kline/wiki/FAQ)
- 提交 [Issue](https://github.com/miounet11/life-kline/issues)
- 阅读 [故障排查指南](https://github.com/miounet11/life-kline/wiki/Troubleshooting)

---

<p align="center">
  <a href="../README.md">返回主页</a> •
  <a href="API.md">API 文档</a> •
  <a href="ARCHITECTURE-SIMPLIFICATION.md">架构文档</a>
</p>
