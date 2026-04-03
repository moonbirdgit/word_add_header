import pythoncom
import os
import re
import uuid
import shutil
import zipfile
import sys
import time
from flask import Flask, request, send_file, after_this_request
from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
import win32com.client as win32
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'temp_uploads'
sys.stdout.reconfigure(encoding='utf-8')

# 確保啟動時先清空一次舊的暫存區
def init_storage():
    if os.path.exists(UPLOAD_FOLDER):
        try:
            shutil.rmtree(UPLOAD_FOLDER)
            print("已清理舊的暫存目錄")
        except Exception as e:
            print(f"啟動清理失敗: {e}")
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def extract_number(filename):
    match = re.search(r'附件(\d+)', filename)
    return int(match.group(1)) if match else None

def convert_doc_to_docx(folder_path):
    pythoncom.CoInitialize()
    try:
        # 使用更穩定的 Dispatch 方式
        word = win32.DispatchEx('Word.Application')
        word.Visible = False
        files = [f for f in os.listdir(folder_path) if f.lower().endswith('.doc') and not f.startswith('~$')]
        
        for f in files:
            abs_path = os.path.abspath(os.path.join(folder_path, f))
            new_path = abs_path + "x"
            if not os.path.exists(new_path):
                doc = word.Documents.Open(abs_path)
                doc.SaveAs(new_path, FileFormat=16) # 16 = wdFormatXMLDocument
                doc.Close()
        word.Quit()
    except Exception as e:
        print(f"轉檔出錯: {e}")
    finally:
        pythoncom.CoUninitialize()

@app.route('/process', methods=['POST'])
def process():
    session_id = str(uuid.uuid4())
    user_dir = os.path.join(UPLOAD_FOLDER, session_id)
    os.makedirs(user_dir, exist_ok=True)

    # 1. 儲存檔案
    uploaded_files = request.files.getlist('files')
    for file in uploaded_files:
        if file.filename:
            # 🚀 關鍵修正：使用 os.path.basename 確保只取得 "附件0.docx"
            # 這樣就不會出現 "for_doc/附件0.docx" 導致路徑找不到的問題
            safe_filename = os.path.basename(file.filename)
            file.save(os.path.join(user_dir, safe_filename))

    # 2. 轉檔 (.doc -> .docx)
    convert_doc_to_docx(user_dir)

    # 3. 標註邏輯
    docx_files = [f for f in os.listdir(user_dir) if f.endswith('.docx') and not f.startswith('~$')]
    for filename in docx_files:
        num = extract_number(filename)
        if num is not None:
            try:
                doc = Document(os.path.join(user_dir, filename))
                for section in doc.sections:
                    header = section.header
                    p = header.paragraphs[0] if header.paragraphs else header.add_paragraph()
                    p.text = f"附件{num}"
                    p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
                doc.save(os.path.join(user_dir, filename))
            except Exception as e:
                print(f"標註 {filename} 失敗: {e}")

    # 4. 打包 ZIP
    zip_filename = f"{session_id}.zip"
    zip_path = os.path.join(UPLOAD_FOLDER, zip_filename)
    
    with zipfile.ZipFile(zip_path, 'w', compression=zipfile.ZIP_DEFLATED) as z:
        for f in os.listdir(user_dir):
            if f.endswith('.docx'):
                z.write(os.path.join(user_dir, f), f)

    # 🚀 5. 自動清理邏輯
    # 使用 after_this_request 在發送完檔案後把整個資料夾刪掉
    @after_this_request
    def cleanup(response):
        try:
            # 關閉所有可能佔用的檔案流後刪除
            shutil.rmtree(user_dir)
            # ZIP 檔案也刪除
            if os.path.exists(zip_path):
                os.remove(zip_path)
            print(f"成功清理 Session: {session_id}")
        except Exception as e:
            print(f"清理失敗: {e}")
        return response

    return send_file(zip_path, as_attachment=True, download_name="processed_files.zip")

if __name__ == '__main__':
    init_storage()
    import os
    port = int(os.environ.get('PORT', 8080))
    # 必須監聽 0.0.0.0，不能寫 127.0.0.1
    app.run(host='0.0.0.0', port=port)