#!/bin/bash
set -e
echo "🤖 اینتلی‌نیوز - نصب و اجرا"

# Check python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 not found"
    exit 1
fi

cd "$(dirname "$0")"

echo "📦 نصب پیش‌نیازها..."
pip install --break-system-packages -r backend/requirements.txt -q || pip install -r backend/requirements.txt -q

echo "📁 ساخت پوشه داده..."
mkdir -p data

echo "🚀 اجرای سرور روی پورت 8000..."
echo "   داشبورد: http://localhost:8000"
echo "   API: http://localhost:8000/docs"

cd backend
python3 -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload
