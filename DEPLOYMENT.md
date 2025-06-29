# Vercel 部署指南

本项目已经为 Vercel 部署做好了准备。请按照以下步骤进行部署：

## 前置条件

1. 确保你有一个 [Vercel](https://vercel.com) 账户
2. 项目代码已推送到 GitHub/GitLab/Bitbucket

## 部署步骤

### 1. 连接项目到 Vercel

1. 登录 Vercel 控制台
2. 点击 "New Project"
3. 选择你的 Git 仓库
4. 选择 "co-train_aptos" 项目

### 2. 配置构建设置

Vercel 会自动检测到这是一个 Next.js 项目，并使用以下设置：

- **Framework Preset**: Next.js
- **Build Command**: `pnpm run build`
- **Output Directory**: `.next`
- **Install Command**: `pnpm install`

### 3. 配置环境变量

在 Vercel 项目设置中添加以下环境变量：

```bash
# 必需的环境变量
NEXT_PUBLIC_APTOS_API_KEY_TESNET=your_testnet_api_key
NEXT_PUBLIC_APTOS_API_KEY_DEVNET=your_devnet_api_key
NEXT_PUBLIC_API_URL=https://your-domain.vercel.app/api

# 可选的功能开关
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_EXPERIMENTAL=false
NEXT_PUBLIC_PERFORMANCE_MONITORING=false
```

### 4. 部署

点击 "Deploy" 按钮开始部署。Vercel 会：

1. 克隆你的代码
2. 安装依赖 (`pnpm install`)
3. 构建项目 (`pnpm run build`)
4. 部署到全球 CDN

## 配置说明

### Next.js 配置优化

项目的 `next.config.mjs` 已经为 Vercel 部署进行了优化：

- 移除了静态导出配置（`output: "export"`）
- 移除了 `assetPrefix` 和 `basePath`
- 添加了图片优化配置
- 启用了 CSS 优化

### Vercel 配置

`vercel.json` 文件包含了以下优化：

- 函数超时设置（30秒）
- 安全头配置
- API 路由重写规则

## 域名配置

部署完成后，你可以：

1. 使用 Vercel 提供的默认域名（如 `your-project.vercel.app`）
2. 配置自定义域名

## 环境变量获取

### Aptos API Keys

1. 访问 [Aptos Labs](https://aptos.dev/)
2. 注册开发者账户
3. 获取 Testnet 和 Devnet API Keys

## 故障排除

### 常见问题

1. **构建失败**: 检查环境变量是否正确设置
2. **API 调用失败**: 确保 `NEXT_PUBLIC_API_URL` 指向正确的域名
3. **钱包连接问题**: 确保 Aptos API Keys 有效

### 查看日志

在 Vercel 控制台的 "Functions" 标签页可以查看详细的运行日志。

## 性能优化

项目已包含以下性能优化：

- 自动代码分割
- 图片优化
- CSS 优化
- 安全头配置
- CDN 缓存

## 更新部署

每次推送到主分支时，Vercel 会自动重新部署项目。你也可以在 Vercel 控制台手动触发部署。

---

如果遇到问题，请查看 [Vercel 文档](https://vercel.com/docs) 或提交 Issue。