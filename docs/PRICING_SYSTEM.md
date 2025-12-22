# 定价管理系统 - 实施文档

## 概述

为 life-kline 项目添加了完整的定价管理后台功能,允许部署者自由配置功能定价和积分套餐。

## 已创建的文件

### 1. 服务端模块
- **`server/pricingManager.js`** - 定价管理核心模块
  - 功能定价配置管理
  - 积分套餐配置管理
  - 默认配置初始化
  - 数据库 CRUD 操作

### 2. 前端页面
- **`pages/AdminPricingPage.tsx`** - 定价管理后台页面
  - 功能定价配置界面
  - 积分套餐配置界面
  - 实时预览
  - 批量保存功能

### 3. 数据库改动
- **`server/database.js`** - 添加了两个新表:
  - `pricing_config` - 功能定价配置表
  - `point_packages` - 积分套餐表

### 4. API 端点
在 **`server/index.js`** 中添加了以下端点:
- `GET  /api/admin/pricing` - 获取定价配置
- `PUT  /api/admin/pricing` - 更新定价配置
- `GET  /api/admin/packages` - 获取积分套餐
- `PUT  /api/admin/packages` - 更新积分套餐
- `GET  /api/public/pricing` - 公开定价信息(供前端展示)

### 5. 路由配置
- **`App.tsx`** - 添加了 `/admin/pricing` 路由

---

## 功能特性

### 功能定价管理
- 配置各功能的积分消耗
- 设置美元和人民币价格
- 支持功能分类(分析、运势、K线等)
- 批量更新配置

### 积分套餐管理
- 配置套餐名称和积分数量
- 设置基础积分和赠送积分
- 推荐套餐标记
- 实时计算折扣百分比
- 可视化预览

### 默认配置
系统内置默认配置,包括:

**功能定价:**
```javascript
FULL_ANALYSIS: { points: 50, price_usd: 0.99, price_cny: 6.99 }
DAILY_FORTUNE_AI: { points: 20, price_usd: 0.49, price_cny: 2.99 }
MONTHLY_KLINE: { points: 30, price_usd: 0.69, price_cny: 4.99 }
DAILY_KLINE: { points: 20, price_usd: 0.49, price_cny: 2.99 }
```

**积分套餐:**
```javascript
starter: 500 积分 = $4.99 / ¥29.99
popular: 1000+100赠送 = $8.99 / ¥59.99 (推荐)
premium: 5000+750赠送 = $39.99 / ¥269.99
```

---

## 使用方法

### 1. 启动项目
```bash
cd life-kline
npm install  # 如果还没安装依赖
npm run dev  # 或 npm start
```

### 2. 访问管理后台
打开浏览器访问:
```
http://localhost:3000/admin/pricing
```

### 3. 配置定价

#### 功能定价配置:
1. 切换到"功能定价"标签
2. 修改各功能的积分消耗、美元价格、人民币价格
3. 点击"保存配置"按钮

#### 积分套餐配置:
1. 切换到"积分套餐"标签
2. 编辑套餐名称、基础积分、赠送积分
3. 勾选"推荐套餐"设置推荐标记
4. 调整美元和人民币价格
5. 点击"保存套餐"按钮

### 4. 前端集成

在前端代码中调用公开 API 获取定价信息:

```typescript
// 获取定价信息
const response = await fetch('/api/public/pricing');
const data = await response.json();

// data.features - 功能定价列表
// data.packages - 积分套餐列表
```

示例响应:
```json
{
  "features": [
    {
      "feature_key": "FULL_ANALYSIS",
      "points": 50,
      "price_usd": 0.99,
      "price_cny": 6.99,
      "display_name": "完整命理分析",
      "category": "analysis"
    }
  ],
  "packages": [
    {
      "id": "starter",
      "name": "入门套餐",
      "points": 500,
      "price_usd": 4.99,
      "price_cny": 29.99,
      "bonus": 0,
      "is_recommended": false
    }
  ]
}
```

---

## 数据库结构

### pricing_config 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT | 主键 |
| feature_key | TEXT | 功能键名(唯一) |
| points_cost | INTEGER | 积分消耗 |
| price_usd | REAL | 美元价格 |
| price_cny | REAL | 人民币价格 |
| display_name | TEXT | 显示名称 |
| category | TEXT | 功能分类 |
| is_active | INTEGER | 是否激活(0/1) |
| updated_at | TEXT | 更新时间 |

### point_packages 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT | 主键 |
| name | TEXT | 套餐名称 |
| points_amount | INTEGER | 基础积分 |
| price_usd | REAL | 美元价格 |
| price_cny | REAL | 人民币价格 |
| bonus_points | INTEGER | 赠送积分 |
| is_recommended | INTEGER | 是否推荐(0/1) |
| display_order | INTEGER | 显示顺序 |
| is_active | INTEGER | 是否激活(0/1) |

---

## 注意事项

1. **首次运行**: 系统会自动创建表并初始化默认配置
2. **数据持久化**: 所有配置保存在 SQLite 数据库中
3. **推荐套餐**: 同一时间只能有一个推荐套餐
4. **积分消耗为0**: 表示该功能免费
5. **价格立即生效**: 修改价格后对新用户立即生效,不影响已购买用户

---

## API 文档

### GET /api/admin/pricing
获取所有定价配置

**响应:**
```json
{
  "features": [...],
  "packages": [...]
}
```

### PUT /api/admin/pricing
更新功能定价配置

**请求体:**
```json
{
  "features": [
    {
      "feature_key": "FULL_ANALYSIS",
      "points": 50,
      "price_usd": 0.99,
      "price_cny": 6.99,
      "display_name": "完整命理分析",
      "category": "analysis"
    }
  ]
}
```

**响应:**
```json
{
  "success": true,
  "updated": 4,
  "message": "成功更新 4 项配置"
}
```

### PUT /api/admin/packages
更新积分套餐配置

**请求体:**
```json
{
  "packages": [
    {
      "id": "starter",
      "name": "入门套餐",
      "points": 500,
      "price_usd": 4.99,
      "price_cny": 29.99,
      "bonus": 0,
      "is_recommended": false,
      "display_order": 1
    }
  ]
}
```

**响应:**
```json
{
  "success": true,
  "updated": 3,
  "message": "成功更新 3 个套餐"
}
```

### GET /api/public/pricing
获取公开定价信息(供前端展示)

**响应:**
```json
{
  "features": [...],
  "packages": [...]
}
```

---

## 扩展建议

### 1. 添加权限控制
目前管理后台没有权限验证,建议添加:
```javascript
app.get('/api/admin/pricing', requireAuth(JWT_SECRET), requireAdmin, (req, res) => {
  // ...
});
```

### 2. 添加历史记录
记录每次价格变更:
```sql
CREATE TABLE pricing_history (
  id TEXT PRIMARY KEY,
  feature_key TEXT,
  old_value TEXT,
  new_value TEXT,
  changed_by TEXT,
  changed_at TEXT
);
```

### 3. 支付集成
集成 Stripe/PayPal/微信支付:
```javascript
app.post('/api/payment/create', async (req, res) => {
  const { package_id } = req.body;
  const pkg = getPackageById(package_id);
  // 创建支付订单
});
```

### 4. 优惠码系统
添加折扣码功能:
```sql
CREATE TABLE discount_codes (
  code TEXT PRIMARY KEY,
  discount_percent INTEGER,
  valid_until TEXT
);
```

---

## 故障排除

### 问题: 数据库表未创建
**解决:** 重启服务器,系统会自动创建表

### 问题: 保存失败
**解决:** 检查浏览器控制台和服务器日志,确认数据格式正确

### 问题: 定价未生效
**解决:** 刷新页面,确认点击了"保存"按钮

---

## 技术栈

- **后端:** Node.js + Express
- **数据库:** SQLite (better-sqlite3)
- **前端:** React + TypeScript
- **样式:** Tailwind CSS
- **图标:** Lucide React

---

## 作者

实施日期: 2025-12-22
版本: 1.0.0

## 许可证

Apache-2.0
