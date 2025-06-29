#!/bin/bash

# 预构建部署脚本
# 此脚本会构建项目并将构建文件提交到Git，然后推送到远程仓库

set -e

echo "🚀 开始预构建部署流程..."

# 检查是否有未提交的更改
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  检测到未提交的更改，请先提交或暂存更改"
    exit 1
fi

# 清理之前的构建
echo "🧹 清理之前的构建文件..."
rm -rf .next

# 安装依赖
echo "📦 安装依赖..."
pnpm install

# 构建项目
echo "🔨 构建项目..."
pnpm run build

# 检查构建是否成功
if [ ! -d ".next" ]; then
    echo "❌ 构建失败，.next 目录不存在"
    exit 1
fi

echo "✅ 构建成功！"

# 添加构建文件到Git
echo "📝 添加构建文件到Git..."
git add .next

# 检查是否有新的构建文件需要提交
if git diff --cached --quiet; then
    echo "ℹ️  没有新的构建文件需要提交"
else
    # 提交构建文件
    echo "💾 提交构建文件..."
    git commit -m "chore: update build files for deployment"
fi

# 推送到远程仓库
echo "🚀 推送到远程仓库..."
git push

echo "🎉 预构建部署完成！"
echo "📋 下一步："
echo "   1. 在Vercel中触发重新部署"
echo "   2. 或者等待自动部署完成"
echo "   3. 检查部署状态"