import json
import os
import uuid
from datetime import datetime
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data"
DATA_DIR.mkdir(exist_ok=True)

KEYWORDS_FILE = DATA_DIR / "keywords.json"
NEWS_FILE = DATA_DIR / "news.json"
CONFIG_FILE = DATA_DIR / "config.json"
TELEGRAM_FILE = DATA_DIR / "telegram.json"
SETTINGS_FILE = DATA_DIR / "settings.json"
LOGS_FILE = DATA_DIR / "logs.json"

def _read_json(path, default):
    if not path.exists():
        return default
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except:
        return default

def _write_json(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# Keywords
def get_keywords():
    return _read_json(KEYWORDS_FILE, [])

def save_keywords(keywords):
    _write_json(KEYWORDS_FILE, keywords)

def add_keyword(keyword_data):
    keywords = get_keywords()
    new_item = {
        "id": str(uuid.uuid4())[:8],
        "keyword": keyword_data["keyword"],
        "enabled": keyword_data.get("enabled", True),
        "domestic": keyword_data.get("domestic", True),
        "international": keyword_data.get("international", True),
        "created_at": datetime.now().isoformat()
    }
    keywords.append(new_item)
    save_keywords(keywords)
    return new_item

def delete_keyword(kid):
    keywords = get_keywords()
    keywords = [k for k in keywords if k["id"] != kid]
    save_keywords(keywords)

def update_keyword(kid, updates):
    keywords = get_keywords()
    for k in keywords:
        if k["id"] == kid:
            k.update(updates)
    save_keywords(keywords)
    return next((k for k in keywords if k["id"] == kid), None)

# News
def get_news(limit=200):
    news = _read_json(NEWS_FILE, [])
    # sort by published_at desc
    try:
        news_sorted = sorted(news, key=lambda x: x.get("published_at",""), reverse=True)
    except:
        news_sorted = news
    return news_sorted[:limit]

def save_news(news):
    _write_json(NEWS_FILE, news)

def add_news_items(new_items):
    """Add new items with deduplication by link"""
    existing = _read_json(NEWS_FILE, [])
    existing_links = {n["link"] for n in existing}
    added = []
    for item in new_items:
        if item["link"] not in existing_links:
            existing.append(item)
            existing_links.add(item["link"])
            added.append(item)
    # Keep only last 1000
    if len(existing) > 1000:
        # sort and trim
        try:
            existing = sorted(existing, key=lambda x: x.get("published_at",""), reverse=True)[:1000]
        except:
            existing = existing[-1000:]
    save_news(existing)
    return added

def clear_news():
    save_news([])

# Telegram
def get_telegram_config():
    return _read_json(TELEGRAM_FILE, {
        "bot_token": "",
        "chat_id": "",
        "enabled": False,
        "send_mode": "immediate"
    })

def save_telegram_config(cfg):
    _write_json(TELEGRAM_FILE, cfg)

# Settings
def get_settings():
    default = {
        "interval_minutes": 60,
        "max_news_per_fetch": 15,
        "max_news_per_keyword": 5,
        "auto_send_telegram": True,
        "enable_domestic": True,
        "enable_international": True,
        "duplicate_check_hours": 24
    }
    stored = _read_json(SETTINGS_FILE, {})
    default.update(stored)
    return default

def save_settings(s):
    _write_json(SETTINGS_FILE, s)

# Logs
def add_log(message, level="info"):
    logs = _read_json(LOGS_FILE, [])
    logs.append({
        "time": datetime.now().isoformat(),
        "message": message,
        "level": level
    })
    if len(logs) > 200:
        logs = logs[-200:]
    _write_json(LOGS_FILE, logs)

def get_logs(limit=100):
    logs = _read_json(LOGS_FILE, [])
    return logs[-limit:][::-1]
