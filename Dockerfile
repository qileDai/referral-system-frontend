# 使用 Python 3.11 作为基础镜像
FROM python:3.11-slim

# 设置工作目录
WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# 复制后端依赖并安装
COPY backend/requirements.txt /app/backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# 复制后端代码
COPY backend/ /app/backend/

# 复制前端代码并构建
COPY frontend/ /app/frontend/
WORKDIR /app/frontend
RUN npm install && npm run build

# 回到应用根目录
WORKDIR /app

# 创建启动脚本
RUN echo '#!/bin/bash\n\
cd /app/backend\n\
python manage.py migrate --noinput\n\
python manage.py init_data\n\
python manage.py collectstatic --noinput\n\
mkdir -p /app/backend/staticfiles\n\
cp -r /app/frontend/build/* /app/backend/staticfiles/\n\
python manage.py runserver 0.0.0.0:8000' > /app/start.sh && chmod +x /app/start.sh

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["/app/start.sh"]
