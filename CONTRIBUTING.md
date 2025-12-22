# 贡献指南

感谢你对人生 K 线项目的关注！我们欢迎并感激任何形式的贡献。

## 目录

- [行为准则](#行为准则)
- [我能做什么](#我能做什么)
- [如何提交 Issue](#如何提交-issue)
- [如何提交 Pull Request](#如何提交-pull-request)
- [开发环境设置](#开发环境设置)
- [代码风格规范](#代码风格规范)
- [提交信息规范](#提交信息规范)
- [测试要求](#测试要求)

---

## 行为准则

本项目采用 [Contributor Covenant](CODE_OF_CONDUCT.md) 行为准则。参与本项目即表示你同意遵守该准则。

---

## 我能做什么

有很多方式可以为本项目做出贡献：

### 报告 Bug
- 在使用中发现了问题？请提交详细的 Bug 报告
- 包含复现步骤、环境信息、期望行为和实际行为

### 提出功能建议
- 有好的想法？告诉我们！
- 解释为什么这个功能对用户有价值
- 如果可能，提供设计草图或伪代码

### 改进文档
- 发现文档错误或不清楚的地方？
- 可以改进 README、API 文档、注释
- 翻译文档到其他语言

### 提交代码
- 修复 Bug
- 实现新功能
- 优化性能
- 改进 UI/UX

---

## 如何提交 Issue

### Bug 报告

使用 Bug 报告模板，包含以下信息：

```markdown
**描述问题**
清晰简洁地描述 Bug

**复现步骤**
1. 打开 '...'
2. 点击 '...'
3. 滚动到 '...'
4. 看到错误

**期望行为**
应该发生什么

**实际行为**
实际发生了什么

**截图**
如果适用，添加截图帮助解释问题

**环境信息**
- 操作系统: [如 macOS 13.0]
- 浏览器: [如 Chrome 120]
- Node.js 版本: [如 18.17.0]
- 项目版本: [如 1.0.0]

**额外信息**
其他相关内容
```

### 功能建议

```markdown
**功能描述**
清晰简洁地描述你想要的功能

**问题或需求**
这个功能解决什么问题？为什么需要？

**建议方案**
描述你希望如何实现

**替代方案**
考虑过的其他解决方案

**额外信息**
设计稿、参考链接等
```

---

## 如何提交 Pull Request

### 1. Fork 并克隆仓库

```bash
# Fork 仓库（在 GitHub 页面点击 Fork 按钮）

# 克隆你 fork 的仓库
git clone https://github.com/YOUR_USERNAME/life-kline.git
cd life-kline

# 添加上游仓库
git remote add upstream https://github.com/miounet11/life-kline.git
```

### 2. 创建分支

```bash
# 更新主分支
git checkout main
git pull upstream main

# 创建新分支（使用有意义的名称）
git checkout -b feature/add-new-chart
# 或
git checkout -b fix/calculation-error
```

分支命名规范：
- `feature/` - 新功能
- `fix/` - Bug 修复
- `docs/` - 文档更新
- `style/` - 代码格式（不影响功能）
- `refactor/` - 重构
- `perf/` - 性能优化
- `test/` - 测试相关
- `chore/` - 构建/工具相关

### 3. 开发和测试

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 进行你的修改...

# 测试你的修改
# 确保功能正常工作
```

### 4. 提交更改

```bash
# 添加文件
git add .

# 提交（遵循提交信息规范）
git commit -m "feat: 添加新的 K 线图表类型"
```

### 5. 推送并创建 Pull Request

```bash
# 推送到你的 fork
git push origin feature/add-new-chart
```

在 GitHub 上创建 Pull Request：

1. 访问你 fork 的仓库页面
2. 点击 "Compare & pull request" 按钮
3. 填写 PR 标题和描述
4. 等待代码审查

### PR 描述模板

```markdown
## 变更类型
- [ ] Bug 修复
- [ ] 新功能
- [ ] 破坏性变更
- [ ] 文档更新

## 描述
简要描述这个 PR 的变更内容

## 相关 Issue
关闭 #123

## 变更内容
- 添加了 XXX 功能
- 修复了 YYY 问题
- 优化了 ZZZ 性能

## 测试
- [ ] 本地测试通过
- [ ] 添加了单元测试
- [ ] 更新了文档

## 截图（如适用）
放置截图或 GIF

## 检查清单
- [ ] 代码遵循项目风格规范
- [ ] 自我审查了代码
- [ ] 添加了必要的注释
- [ ] 更新了相关文档
- [ ] 没有产生新的警告
- [ ] 测试通过
```

---

## 开发环境设置

### 系统要求

- Node.js 18 或更高版本
- npm、pnpm 或 yarn
- Git
- 现代浏览器（Chrome、Firefox、Safari、Edge）

### 安装步骤

```bash
# 1. 克隆仓库
git clone https://github.com/YOUR_USERNAME/life-kline.git
cd life-kline

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入你的 API 配置

# 4. 启动开发服务器（前后端同时启动）
npm run dev
```

### 项目脚本

```bash
npm run dev           # 启动开发服务器（前后端）
npm run dev:client    # 仅启动前端
npm run dev:server    # 仅启动后端
npm run build         # 构建生产版本
npm run preview       # 预览生产构建
npm run start         # 启动生产服务器
```

### 推荐的开发工具

- **编辑器**: VS Code、WebStorm
- **VS Code 扩展**:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - ES7+ React/Redux/React-Native snippets

---

## 代码风格规范

### JavaScript/TypeScript

- 使用 2 空格缩进
- 使用单引号（字符串）
- 语句末尾不加分号
- 使用 ES6+ 语法
- 使用有意义的变量名

```javascript
// ✅ 推荐
const calculateBazi = (birthInfo) => {
  const { year, month, day, hour } = birthInfo
  return baziCalculator.calculate(year, month, day, hour)
}

// ❌ 不推荐
function calc(b){
  var y=b.year;var m=b.month;var d=b.day;var h=b.hour;
  return baziCalculator.calculate(y,m,d,h);
}
```

### React 组件

- 使用函数组件和 Hooks
- 组件名使用 PascalCase
- Props 解构
- 提取复杂逻辑到自定义 Hooks

```tsx
// ✅ 推荐
interface ChartProps {
  data: KLineData[]
  title: string
}

const KLineChart: React.FC<ChartProps> = ({ data, title }) => {
  const [selectedRange, setSelectedRange] = useState('1Y')

  return (
    <div className="chart-container">
      <h2>{title}</h2>
      <ResponsiveContainer>
        {/* 图表内容 */}
      </ResponsiveContainer>
    </div>
  )
}
```

### CSS/Tailwind

- 优先使用 Tailwind 工具类
- 复杂样式抽取为组件
- 保持类名顺序一致

```tsx
// ✅ 推荐
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  {/* 内容 */}
</div>
```

### 注释

- 为复杂逻辑添加注释
- 使用 JSDoc 注释函数
- 避免无意义的注释

```javascript
/**
 * 计算八字命盘
 * @param {Object} birthInfo - 出生信息
 * @param {number} birthInfo.year - 出生年份
 * @param {number} birthInfo.month - 出生月份
 * @param {number} birthInfo.day - 出生日期
 * @param {number} birthInfo.hour - 出生时辰
 * @returns {Object} 八字命盘结果
 */
const calculateBazi = (birthInfo) => {
  // 计算真太阳时修正
  const solarTime = adjustTrueSolarTime(birthInfo)

  // 使用 lunar-javascript 库进行八字计算
  return lunar.calculate(solarTime)
}
```

---

## 提交信息规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范。

### 格式

```
<类型>[可选范围]: <描述>

[可选正文]

[可选脚注]
```

### 类型

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构（既不是新功能也不是修复）
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具/依赖相关

### 示例

```bash
# 新功能
git commit -m "feat: 添加导出 K 线图为图片功能"

# Bug 修复
git commit -m "fix: 修复八字计算中的真太阳时错误"

# 文档
git commit -m "docs: 更新 API 文档"

# 重构
git commit -m "refactor: 优化运势计算算法"

# 带范围
git commit -m "feat(chart): 添加缩放功能"

# 破坏性变更
git commit -m "feat!: 重构 API 接口结构

BREAKING CHANGE: API 端点从 /api/analyze 改为 /api/v2/analyze"
```

---

## 测试要求

### 手动测试

提交 PR 前，请确保：

1. **功能测试**
   - 新功能正常工作
   - 不影响现有功能
   - 在不同浏览器中测试

2. **UI 测试**
   - 响应式设计正常
   - 样式正确显示
   - 交互流畅

3. **边界情况**
   - 测试空数据
   - 测试错误输入
   - 测试极端值

### 测试清单

- [ ] 前端启动无错误
- [ ] 后端启动无错误
- [ ] 核心功能正常工作
- [ ] 新功能符合预期
- [ ] 没有控制台错误或警告
- [ ] 响应式设计正常
- [ ] 不同浏览器测试通过

---

## 代码审查流程

1. **提交 PR** - 填写完整的 PR 描述
2. **自动检查** - 等待自动化检查通过
3. **代码审查** - 维护者会审查你的代码
4. **修改反馈** - 根据反馈进行修改
5. **合并** - 审查通过后合并到主分支

### 审查标准

- 代码质量和可读性
- 是否遵循项目规范
- 是否有充分的注释
- 是否考虑了边界情况
- 性能影响
- 安全性考虑

---

## 获得帮助

如果你有任何问题：

- 查看 [README.md](README.md) 和现有文档
- 搜索 [已有 Issues](https://github.com/miounet11/life-kline/issues)
- 在 Issue 中提问
- 查看现有代码寻找示例

---

## 许可

提交到本项目的代码将遵循 [Apache 2.0 License](LICENSE)。

---

## 致谢

感谢你的贡献！每一个贡献都让这个项目变得更好。

你的名字将出现在贡献者列表中：

```bash
# 查看贡献者
git log --format='%aN' | sort -u
```

---

<p align="center">
  <strong>再次感谢你的贡献！</strong>
</p>

<p align="center">
  <a href="https://github.com/miounet11/life-kline">返回主页</a> •
  <a href="CODE_OF_CONDUCT.md">行为准则</a> •
  <a href="SECURITY.md">安全政策</a>
</p>
