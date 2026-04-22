@echo off
echo ======================================
echo 人体关节监测传感器仿真系统 - 启动脚本
echo ======================================
echo.

echo 步骤 1/4: 安装后端依赖...
cd backend
if not exist venv (
    echo 创建Python虚拟环境...
    python -m venv venv
)

call venv\Scripts\activate.bat
pip install -r requirements.txt
echo 后端依赖安装完成！
echo.

echo 步骤 2/4: 启动后端服务...
start "后端服务" cmd /k "venv\Scripts\activate.bat && python app.py"
echo 后端服务已启动
echo 后端地址: http://localhost:5000
echo.

cd ..

echo 步骤 3/4: 安装前端依赖...
cd frontend
if not exist node_modules (
    echo 安装npm包...
    call npm install
)
echo 前端依赖安装完成！
echo.

echo 步骤 4/4: 启动前端服务...
echo 前端地址: http://localhost:3000
echo.
echo ======================================
echo 系统启动完成！
echo 请在浏览器中访问: http://localhost:3000
echo ======================================
echo.

call npm start

pause
