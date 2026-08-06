from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pathlib import Path
import os
import sys
from datetime import datetime

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from models import KeywordCreate, TelegramConfig, Settings, FetchRequest
from database import (
    get_keywords, add_keyword, delete_keyword, update_keyword,
    get_news, add_news_items, clear_news,
    get_telegram_config, save_telegram_config,
    get_settings, save_settings,
    get_logs, add_log
)
from fetcher import search_news_by_keyword, fetch_all_keywords
from telegram_bot import send_news_batch, test_telegram_connection

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
import atexit

app = FastAPI(title="اینتلی‌نیوز - ایجنت هوشمند خبری", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Scheduler
scheduler = BackgroundScheduler(timezone="Asia/Tehran")
scheduler_started = False

def scheduled_fetch_job():
    try:
        print(f"[{datetime.now()}] اجرای وظیفه زمان‌بندی شده...")
        keywords = get_keywords()
        if not keywords:
            add_log("هیچ کلیدواژه‌ای برای جستجو وجود ندارد", "warning")
            return
        settings = get_settings()
        # only enabled
        enabled_kws = [k for k in keywords if k.get("enabled", True)]
        if not enabled_kws:
            add_log("همه کلیدواژه‌ها غیرفعال هستند", "warning")
            return
        
        all_new = fetch_all_keywords(enabled_kws, settings)
        if not all_new:
            add_log("در جستجوی زمان‌بندی شده خبری یافت نشد", "info")
            return
        
        added = add_news_items(all_new)
        add_log(f"زمان‌بندی: {len(all_new)} خبر یافت شد، {len(added)} خبر جدید اضافه شد", "success")
        
        # Telegram auto send
        if settings.get("auto_send_telegram") and added:
            tg_cfg = get_telegram_config()
            if tg_cfg.get("enabled") and tg_cfg.get("bot_token") and tg_cfg.get("chat_id"):
                mode = tg_cfg.get("send_mode", "immediate")
                send_news_batch(tg_cfg["bot_token"], tg_cfg["chat_id"], added, mode=mode)
                add_log(f"{len(added)} خبر به تلگرام ارسال شد", "success")
            else:
                add_log("ارسال خودکار تلگرام فعال است اما تنظیمات ناقص است", "warning")
                
    except Exception as e:
        add_log(f"خطا در وظیفه زمان‌بندی: {str(e)}", "error")
        print(f"Scheduled job error: {e}")

def start_scheduler():
    global scheduler_started
    if scheduler_started:
        return
    try:
        settings = get_settings()
        interval = settings.get("interval_minutes", 60)
        scheduler.add_job(
            scheduled_fetch_job,
            trigger=IntervalTrigger(minutes=interval),
            id="news_fetch_job",
            name="جستجوی دوره‌ای اخبار",
            replace_existing=True,
            max_instances=1
        )
        scheduler.start()
        scheduler_started = True
        add_log(f"زمان‌بند هر {interval} دقیقه تنظیم شد", "success")
        print(f"Scheduler started with {interval} min interval")
        atexit.register(lambda: scheduler.shutdown(wait=False))
    except Exception as e:
        print(f"Scheduler start error: {e}")

def restart_scheduler_with_new_interval():
    try:
        settings = get_settings()
        interval = settings.get("interval_minutes", 60)
        if scheduler.get_job("news_fetch_job"):
            scheduler.remove_job("news_fetch_job")
        scheduler.add_job(
            scheduled_fetch_job,
            trigger=IntervalTrigger(minutes=interval),
            id="news_fetch_job",
            name="جستجوی دوره‌ای اخبار",
            replace_existing=True,
            max_instances=1
        )
        add_log(f"بازه زمانی به {interval} دقیقه تغییر کرد", "info")
    except Exception as e:
        print(f"Restart scheduler error: {e}")

# --- API Routes ---

@app.get("/api/health")
def health():
    return {"status": "ok", "time": datetime.now().isoformat(), "scheduler": scheduler_started}

@app.get("/api/keywords")
def list_keywords():
    return get_keywords()

@app.post("/api/keywords")
def create_keyword(payload: KeywordCreate):
    if not payload.keyword or len(payload.keyword.strip()) < 2:
        raise HTTPException(status_code=400, detail="کلیدواژه نامعتبر است")
    kw = payload.keyword.strip()
    # dedup check
    existing = get_keywords()
    if any(k["keyword"].lower() == kw.lower() for k in existing):
        raise HTTPException(status_code=400, detail="این کلیدواژه قبلا اضافه شده")
    
    new_kw = add_keyword(payload.dict())
    add_log(f"کلیدواژه جدید اضافه شد: {kw}", "success")
    return new_kw

@app.delete("/api/keywords/{kid}")
def remove_keyword(kid: str):
    delete_keyword(kid)
    add_log(f"کلیدواژه حذف شد: {kid}", "info")
    return {"ok": True}

@app.patch("/api/keywords/{kid}")
def patch_keyword(kid: str, updates: dict):
    result = update_keyword(kid, updates)
    if not result:
        raise HTTPException(status_code=404, detail="یافت نشد")
    return result

@app.get("/api/news")
def list_news(limit: int = 100, keyword: str = None, source_type: str = None):
    news = get_news(limit=limit*2)  # get more then filter
    if keyword:
        news = [n for n in news if keyword.lower() in n.get("keyword","").lower() or keyword.lower() in n.get("title","").lower()]
    if source_type and source_type != "all":
        news = [n for n in news if n.get("source_type") == source_type]
    return news[:limit]

@app.delete("/api/news")
def delete_all_news():
    clear_news()
    add_log("همه اخبار پاک شدند", "warning")
    return {"ok": True}

@app.post("/api/fetch")
def trigger_fetch(req: FetchRequest, background_tasks: BackgroundTasks):
    settings = get_settings()
    if req.keyword:
        # single keyword
        try:
            items = search_news_by_keyword(req.keyword, settings)
            added = add_news_items(items)
            # telegram if enabled
            if settings.get("auto_send_telegram") and added:
                tg_cfg = get_telegram_config()
                if tg_cfg.get("enabled") and tg_cfg.get("bot_token") and tg_cfg.get("chat_id"):
                    background_tasks.add_task(send_news_batch, tg_cfg["bot_token"], tg_cfg["chat_id"], added, tg_cfg.get("send_mode","immediate"))
            
            return {"found": len(items), "added": len(added), "news": items}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    else:
        # all keywords
        keywords = get_keywords()
        if not keywords:
            raise HTTPException(status_code=400, detail="کلیدواژه‌ای وجود ندارد")
        enabled = [k for k in keywords if k.get("enabled", True)]
        all_new = fetch_all_keywords(enabled, settings)
        added = add_news_items(all_new)
        if settings.get("auto_send_telegram") and added:
            tg_cfg = get_telegram_config()
            if tg_cfg.get("enabled") and tg_cfg.get("bot_token") and tg_cfg.get("chat_id"):
                background_tasks.add_task(send_news_batch, tg_cfg["bot_token"], tg_cfg["chat_id"], added, tg_cfg.get("send_mode","immediate"))
        
        return {"found": len(all_new), "added": len(added), "news": all_new[:20]}

@app.post("/api/fetch-now")
def fetch_now_endpoint(background_tasks: BackgroundTasks):
    # quick trigger
    background_tasks.add_task(scheduled_fetch_job)
    return {"ok": True, "message": "جستجو در پس‌زمینه آغاز شد"}

@app.get("/api/settings")
def get_settings_api():
    return get_settings()

@app.post("/api/settings")
def save_settings_api(payload: Settings):
    save_settings(payload.dict())
    restart_scheduler_with_new_interval()
    add_log(f"تنظیمات ذخیره شد: بازه {payload.interval_minutes} دقیقه", "success")
    return payload

@app.get("/api/telegram")
def get_tg_api():
    cfg = get_telegram_config()
    # hide token partially
    safe = cfg.copy()
    if safe.get("bot_token"):
        t = safe["bot_token"]
        safe["bot_token_masked"] = t[:6] + "****" + t[-4:] if len(t) > 10 else "****"
    return safe

@app.post("/api/telegram")
def save_tg_api(payload: TelegramConfig):
    save_telegram_config(payload.dict())
    add_log("تنظیمات تلگرام ذخیره شد", "success")
    return {"ok": True}

@app.post("/api/telegram/test")
def test_tg_api(payload: TelegramConfig):
    ok, msg = test_telegram_connection(payload.bot_token, payload.chat_id)
    if not ok:
        raise HTTPException(status_code=400, detail=msg)
    return {"ok": True, "message": msg}

@app.post("/api/telegram/send")
def send_specific_news(data: dict, background_tasks: BackgroundTasks):
    # data: {ids: [...]} or send all latest?
    cfg = get_telegram_config()
    if not cfg.get("bot_token") or not cfg.get("chat_id"):
        raise HTTPException(status_code=400, detail="تنظیمات تلگرام ناقص است")
    
    news_ids = data.get("ids", [])
    news = get_news(limit=1000)
    if news_ids:
        selected = [n for n in news if n["id"] in news_ids]
    else:
        selected = news[:5]
    
    if not selected:
        raise HTTPException(status_code=400, detail="خبری برای ارسال یافت نشد")
    
    background_tasks.add_task(send_news_batch, cfg["bot_token"], cfg["chat_id"], selected, cfg.get("send_mode","immediate"))
    return {"ok": True, "count": len(selected)}

@app.get("/api/logs")
def get_logs_api(limit: int = 100):
    return get_logs(limit)

@app.get("/api/sources")
def get_sources_api():
    from sources import DOMESTIC_SOURCES, INTERNATIONAL_SOURCES
    return {
        "domestic": DOMESTIC_SOURCES,
        "international": INTERNATIONAL_SOURCES
    }

@app.get("/api/stats")
def stats_api():
    news = get_news(limit=1000)
    kws = get_keywords()
    # count by source type
    domestic = len([n for n in news if n.get("source_type")=="domestic"])
    international = len([n for n in news if n.get("source_type")=="international"])
    # per keyword
    per_kw = {}
    for n in news:
        k = n.get("keyword","")
        per_kw[k] = per_kw.get(k, 0) + 1
    
    return {
        "total_news": len(news),
        "total_keywords": len(kws),
        "domestic_count": domestic,
        "international_count": international,
        "per_keyword": per_kw,
        "last_fetch": news[0]["fetched_at"] if news else None
    }

# Frontend serve
FRONTEND_DIR = Path(__file__).parent.parent / "frontend"
if FRONTEND_DIR.exists():
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIR), name="assets")

@app.get("/")
def serve_frontend():
    index_path = FRONTEND_DIR / "index.html"
    if index_path.exists():
        return FileResponse(str(index_path))
    return {"message": "Frontend not found, API is running at /docs"}

@app.get("/{full_path:path}")
def catch_all(full_path: str):
    # If api, 404
    if full_path.startswith("api/"):
        return JSONResponse(status_code=404, content={"detail": "Not found"})
    # else serve frontend for SPA
    index_path = FRONTEND_DIR / "index.html"
    if index_path.exists():
        # Check if file exists in frontend
        file_path = FRONTEND_DIR / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(str(file_path))
        return FileResponse(str(index_path))
    return {"detail": "Frontend not found"}

# Start scheduler on startup
@app.on_event("startup")
async def on_start():
    start_scheduler()
