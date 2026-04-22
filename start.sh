#!/bin/bash

echo "======================================"
echo "人体关节监测传感器仿真系统 - 启动脚本"
echo "======================================"
echo ""

# 检查Python是否安装
if ! command -v python3 &> /dev/null; then
    echo "错误: 未找到Python3，请先安装Python 3.8+"
    exit 1
fi

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "错误: 未找到Node.js，请先安装Node.js"
    exit 1
fi

echo "步骤 1/4: 安装后端依赖..."
cd backend
if [ ! -d "venv" ]; then
    echo "创建Python虚拟环境..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt
echo "后端依赖安装完成！"
echo ""

echo "步骤 2/4: 启动后端服务..."
python app.py &
BACKEND_PID=$!
echo "后端服务已启动 (PID: $BACKEND_PID)"
echo "后端地址: http://localhost:5000"
echo ""

cd ..

echo "步骤 3/4: 安装前端依赖..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "安装npm包..."
    npm install
fi
echo "前端依赖安装完成！"
echo ""

echo "步骤 4/4: 启动前端服务..."
echo "前端地址: http://localhost:3000"
echo ""
echo "======================================"
echo "系统启动完成！"
echo "请在浏览器中访问: http://localhost:3000"
echo "按 Ctrl+C 停止所有服务"
echo "======================================"
echo ""

npm start

# 清理
kill $BACKEND_PID
