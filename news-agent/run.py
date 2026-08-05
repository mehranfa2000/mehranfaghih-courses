#!/usr/bin/env python3
"""
اجرای سریع اینتلی‌نیوز
"""
import uvicorn
import sys
from pathlib import Path

# add backend to path
backend_dir = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_dir))

if __name__ == "__main__":
    print("""
╔════════════════════════════════════════╗
║  🤖 اینتلی‌نیوز - ایجنت هوشمند اخبار    ║
║  هر 1 ساعت - داخلی و خارجی             ║
║  تیتر + خلاصه + تاریخ + لینک + ناشر    ║
╚════════════════════════════════════════╝

🚀 سرور در حال اجرا...
📊 داشبورد: http://localhost:8000
📚 API docs: http://localhost:8000/docs
🔧 تنظیمات: http://localhost:8000#telegram

کلیدواژه را از داشبورد اضافه کنید!
""")
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True, reload_dirs=[str(backend_dir)], log_level="info")
