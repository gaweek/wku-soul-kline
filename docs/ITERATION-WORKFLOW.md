# WKU soul-kline 迭代与线上更新流程

这份文档用于每次项目迭代后的固定操作：先在本地完成修改、测试、提交并推送到 GitHub，再连接阿里云 ECS 拉取最新代码、构建并重启线上服务。

## 当前线上环境

```text
GitHub 仓库：https://github.com/gaweek/wku-soul-kline
服务器公网 IP：118.190.107.123
服务器项目目录：/var/www/wku-soul-kline
PM2 应用名：wku-soul-kline
Node 服务端口：3000
公网访问端口：80，由 Nginx 转发到 127.0.0.1:3000
```

`.env` 只保存在本地或服务器，不能提交到 GitHub。

## 一、本地迭代流程

每次开始改代码前，先确认自己在项目目录中：

```bash
cd "/Users/a1021500805/IdeaProjects/WKU soul-kline"
```

### 1. 拉取远端最新代码

```bash
git pull origin main
```

如果提示有本地改动冲突，先执行：

```bash
git status
```

确认哪些文件是自己正在改的，不要随便覆盖或删除。

### 2. 本地开发和调试

```bash
npm run dev
```

默认地址：

```text
前端：http://localhost:5173
后端：http://localhost:3000
健康检查：http://localhost:3000/api/health
```

修改完成后，先在浏览器里走一遍核心功能：

- Who Know U 单人分析
- Who Know Us 双人共振
- 页面刷新后是否正常
- 控制台是否有明显报错

### 3. 运行测试和构建

提交前至少执行：

```bash
node --test tests/*.test.js
npm run build
```

如果改了依赖，先安装依赖并确认 `package-lock.json` 一起更新：

```bash
npm install
node --test tests/*.test.js
npm run build
```

### 4. 查看改动

```bash
git status
git diff
```

确认没有把这些内容提交上去：

- `.env`
- API Key
- `node_modules`
- `dist`
- 临时截图、压缩包、日志文件

### 5. 提交并推送到 GitHub

```bash
git add .
git commit -m "简短描述这次迭代"
git push origin main
```

提交信息建议写清楚做了什么，例如：

```bash
git commit -m "Update Who Know Us copy labels"
git commit -m "Fix DeepSeek elapsed timing"
git commit -m "Add iteration deployment workflow"
```

推送成功后，可以打开 GitHub 仓库确认最新 commit 是否出现在 `main` 分支。

## 二、线上服务器更新流程

本地已经 `git push origin main` 后，再更新线上服务器。

### 1. 从本地终端连接 ECS

```bash
ssh root@118.190.107.123
```

连接成功后进入项目目录：

```bash
cd /var/www/wku-soul-kline
```

### 2. 确认服务器当前状态

```bash
git status
pm2 status
```

正常情况下，`git status` 应该是干净的。如果服务器上出现未提交改动，先不要继续 `git pull`，确认这些改动是不是临时调试留下的。

### 3. 拉取 GitHub 最新代码

```bash
git pull origin main
```

如果只是改前端、后端业务代码，通常直接继续构建即可。

如果这次改过 `package.json` 或 `package-lock.json`，执行：

```bash
npm ci
```

不确定有没有改依赖时，也可以直接执行 `npm ci`，只是会多花一点时间。

### 4. 重新构建前端

```bash
npm run build
```

看到 `built` 或 `✓ built` 表示构建完成。

### 5. 重启 PM2 服务

```bash
pm2 restart wku-soul-kline --update-env
pm2 save
```

`--update-env` 可以让 PM2 重新读取当前环境变量。如果只是改代码，没有改 `.env`，也可以使用：

```bash
pm2 restart wku-soul-kline
```

### 6. 检查服务是否正常

服务器本机检查：

```bash
curl http://127.0.0.1:3000/api/health
pm2 status
```

公网检查：

```bash
curl http://118.190.107.123/api/health
```

浏览器打开：

```text
http://118.190.107.123
```

如果接口正常，页面也能打开，这次线上更新就完成了。

## 三、只修改环境变量时

如果只是修改 DeepSeek Key、模型名、端口等 `.env` 配置，不需要重新拉代码。

服务器上执行：

```bash
cd /var/www/wku-soul-kline
nano .env
pm2 restart wku-soul-kline --update-env
curl http://127.0.0.1:3000/api/health
```

注意：`.env` 不要提交到 GitHub。

## 四、常见排查命令

查看 PM2 状态：

```bash
pm2 status
```

查看最近日志：

```bash
pm2 logs wku-soul-kline --lines 100
```

查看 3000 端口是否监听：

```bash
ss -ltnp | grep 3000
```

检查 Nginx 配置：

```bash
nginx -t
systemctl status nginx
```

重载 Nginx：

```bash
systemctl reload nginx
```

## 五、推荐的完整命令清单

### 本地每次迭代后

```bash
cd "/Users/a1021500805/IdeaProjects/WKU soul-kline"
node --test tests/*.test.js
npm run build
git status
git add .
git commit -m "描述这次修改"
git push origin main
```

### 服务器每次更新线上后

```bash
ssh root@118.190.107.123
cd /var/www/wku-soul-kline
git pull origin main
npm ci
npm run build
pm2 restart wku-soul-kline --update-env
pm2 save
curl http://127.0.0.1:3000/api/health
curl http://118.190.107.123/api/health
```

## 六、回滚思路

如果新版本上线后发现明显问题，优先用 GitHub 提交一个修复 commit，再按上面的服务器更新流程部署。

如果必须临时回到上一个版本，可以在服务器查看最近提交：

```bash
cd /var/www/wku-soul-kline
git log --oneline -5
```

选择一个确认可用的旧 commit：

```bash
git checkout <commit-id>
npm ci
npm run build
pm2 restart wku-soul-kline --update-env
```

临时回滚后，记得在本地仓库用正常 commit 修复问题，再推送到 `main`，最后服务器执行：

```bash
git checkout main
git pull origin main
npm ci
npm run build
pm2 restart wku-soul-kline --update-env
```
