# 使用 Python 映像檔
FROM python:3.10-slim

# 安裝 LibreOffice (處理 .doc 轉檔)
RUN apt-get update && apt-get install -y libreoffice --no-install-recommends && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 注意這裡的路徑要指向 backend 資料夾
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 複製 backend 資料夾下的所有內容到容器的 /app
COPY backend/ .

# 執行指令
CMD ["python", "app.py"]