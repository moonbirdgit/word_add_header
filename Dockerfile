FROM python:3.10-slim

# 安裝 Linux 轉檔必備工具
RUN apt-get update && apt-get install -y \
    libreoffice \
    dbus \
    --no-install-recommends && rm -rf /var/lib/apt/lists/*

# 1. 設定容器內的工作目錄為 /app (這只是個代號)
WORKDIR /app

# 2. 從「根目錄的 backend」資料夾複製清單到「容器內的當前目錄(.)」
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 3. 將「根目錄的 backend」所有程式碼複製進來
COPY backend/ .

# 4. 最終檢查：確保 app.py 就在 /app 裡面
# 執行時，Cloud Run 會在 /app 資料夾下跑這行
CMD ["python", "app.py"]