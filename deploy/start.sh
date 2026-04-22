#!/bin/bash
set -e

echo "=========================================="
echo "人体关节监测传感器仿真系统 - 启动"
echo "=========================================="

# Start Flask backend in background
echo "启动后端服务 (Flask :5001)..."
cd /app/backend
export PYTHONUNBUFFERED=1
python app.py &
BACKEND_PID=$!
echo "后端 PID: $BACKEND_PID"

# Wait for backend to start
sleep 3

# Start nginx
echo "启动前端服务 (nginx :3000)..."
nginx

echo "=========================================="
echo "服务启动完成！"
echo "  前端: http://localhost:3000"
echo "  后端: http://localhost:5001"
echo "=========================================="

# Keep container running
wait $BACKEND_PID
