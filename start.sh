#!/bin/bash

# 企业内推与推荐奖励系统启动脚本

echo "=================================="
echo "企业内推与推荐奖励系统"
echo "=================================="
echo ""

# 检查 Python 是否安装
if ! command -v python3 &> /dev/null; then
    echo "错误: 未找到 Python3，请先安装 Python 3.8+"
    exit 1
fi

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "错误: 未找到 Node.js，请先安装 Node.js 16+"
    exit 1
fi

# 创建虚拟环境（如果不存在）
if [ ! -d "venv" ]; then
    echo "创建 Python 虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境
echo "激活虚拟环境..."
source venv/bin/activate

# 安装后端依赖
echo "安装后端依赖..."
cd backend
pip install -r requirements.txt

# 执行数据库迁移
echo "执行数据库迁移..."
python manage.py migrate --noinput

# 初始化测试数据
echo "初始化测试数据..."
python manage.py init_data

# 收集静态文件
echo "收集静态文件..."
python manage.py collectstatic --noinput

# 启动后端服务（后台运行）
echo "启动后端服务..."
python manage.py runserver 0.0.0.0:8000 &
BACKEND_PID=$!

cd ..

# 安装前端依赖
echo "安装前端依赖..."
cd frontend
npm install

# 启动前端服务
echo "启动前端服务..."
npm start &
FRONTEND_PID=$!

cd ..

echo ""
echo "=================================="
echo "服务启动成功！"
echo "=================================="
echo ""
echo "访问地址:"
echo "  前端页面: http://localhost:3000"
echo "  后端API:  http://localhost:8000"
echo "  管理后台: http://localhost:8000/admin"
echo ""
echo "测试账号:"
echo "  管理员: admin / admin123"
echo "  HR用户: hruser / hr123456"
echo ""
echo "按 Ctrl+C 停止服务"
echo ""

# 等待用户中断
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
