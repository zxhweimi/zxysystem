#!/bin/bash

echo "======================================"
echo "修复前端npm权限并安装依赖"
echo "======================================"
echo ""

echo "步骤 1/3: 修复npm缓存权限..."
echo "需要输入管理员密码"
sudo chown -R $(whoami) "/Users/zhangxinhui/.npm"

if [ $? -eq 0 ]; then
    echo "✓ npm缓存权限修复成功"
else
    echo "✗ 权限修复失败，请手动执行："
    echo "  sudo chown -R $(whoami) \"/Users/zhangxinhui/.npm\""
    exit 1
fi

echo ""
echo "步骤 2/3: 清除npm缓存..."
cd frontend
npm cache clean --force
echo "✓ 缓存清除完成"

echo ""
echo "步骤 3/3: 安装前端依赖..."
npm install --legacy-peer-deps

if [ $? -eq 0 ]; then
    echo ""
    echo "======================================"
    echo "✓ 前端依赖安装成功！"
    echo "======================================"
    echo ""
    echo "现在可以启动前端服务："
    echo "  cd frontend"
    echo "  npm start"
    echo ""
else
    echo ""
    echo "✗ 依赖安装失败"
    exit 1
fi
