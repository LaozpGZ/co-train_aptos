# Vercel 部署指南

本项目已经为 Vercel 部署做好了准备。请按照以下步骤进行部署：

## 前置条件

1. 确保你有一个 [Vercel](https://vercel.com) 账户
2. 项目代码已推送到 GitHub/GitLab/Bitbucket

## 部署方式

本项目支持两种部署方式：

### 方式一：标准部署（推荐）
Vercel 自动构建和部署

### 方式二：预构建部署
本地构建后上传构建文件到 Git，Vercel 直接使用预构建文件

---

## 标准部署步骤

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

## 预构建部署步骤

如果你想要使用本地构建的文件进行部署（适用于构建时间较长或需要特定构建环境的情况）：

### 1. 准备工作

项目已经配置为支持预构建部署：
- ✅ `.gitignore` 已更新，不再忽略 `.next` 构建目录
- ✅ `vercel.json` 已配置为使用预构建文件
- ✅ 提供了自动化部署脚本

### 2. 使用自动化脚本（推荐）

```bash
# 运行预构建部署脚本
pnpm run deploy:prebuild
```

这个脚本会：
1. 检查Git状态
2. 清理之前的构建
3. 安装依赖
4. 构建项目
5. 将构建文件添加到Git
6. 提交并推送到远程仓库

### 3. 手动预构建部署

如果你想手动控制每个步骤：

```bash
# 1. 清理并重新构建
pnpm run build:clean

# 2. 添加构建文件到Git
git add .next

# 3. 提交构建文件
git commit -m "chore: update build files for deployment"

# 4. 推送到远程仓库
git push
```

### 4. Vercel配置

在Vercel项目设置中：
- **Build Command** 已设置为 `echo 'Using pre-built files'`
- **Output Directory** 设置为 `.next`
- Vercel会直接使用你上传的构建文件，跳过构建步骤

### 5. 预构建部署的优势

- ⚡ **更快的部署**：跳过Vercel的构建步骤
- 🔒 **一致性**：确保本地和生产环境使用相同的构建
- 🛠️ **调试友好**：可以在本地验证构建结果
- 💾 **节省资源**：减少Vercel的构建时间和资源消耗

### 6. 注意事项

- 📁 构建文件会增加仓库大小
- 🔄 每次代码更改后都需要重新构建和提交
- 🚨 确保 `.env` 文件不被提交（已在 `.gitignore` 中配置）

### 7. 切换回标准部署

如果想切换回让Vercel自动构建：

1. 更新 `vercel.json`：
```json
{
  "buildCommand": "pnpm run build",
  // ... 其他配置
}
```

2. 重新添加构建目录到 `.gitignore`：
```
/.next/
/out/
/build
```

---

如果遇到问题，请查看 [Vercel 文档](https://vercel.com/docs) 或提交 Issue。