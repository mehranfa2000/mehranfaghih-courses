import requests
from datetime import datetime
import jdatetime
try:
    from .database import add_log
except ImportError:
    from database import add_log

def format_news_for_telegram(news_item, include_summary=True):
    """
    فرمت زیبا برای تلگرام
    """
    title = news_item.get("title", "بدون عنوان")
    summary = news_item.get("summary", "")
    publisher = news_item.get("publisher", "نامشخص")
    link = news_item.get("link", "")
    keyword = news_item.get("keyword", "")
    jalali = news_item.get("published_at_jalali", "")
    time_str = news_item.get("time_str", "")
    source_type = news_item.get("source_type", "")
    
    type_emoji = "🇮🇷" if source_type == "domestic" else "🌍" if source_type == "international" else "📰"
    type_text = "داخلی" if source_type == "domestic" else "خارجی" if source_type == "international" else "عمومی"
    
    # تاریخ جلالی زیبا
    jalali_full = news_item.get("jalali_full", jalali)
    
    message = f"""{type_emoji} <b>{title}</b>

"""
    if include_summary and summary:
        message += f"📝 <i>{summary}</i>\n\n"
    
    message += f"🏢 <b>منبع:</b> {publisher} ({type_text})\n"
    message += f"🔑 <b>کلیدواژه:</b> #{keyword.replace(' ', '_')}\n"
    if jalali_full:
        message += f"📅 <b>تاریخ:</b> {jalali_full} - {time_str}\n"
    elif jalali:
        message += f"📅 {jalali} - {time_str}\n"
    
    message += f"\n🔗 <a href=\"{link}\">مشاهده خبر کامل</a>\n"
    message += f"\n━━━━━━━━━━━━━━━\n"
    message += f"🤖 <i>اینتلی‌نیوز - ایجنت هوشمند خبری</i>"
    
    return message

def format_digest_for_telegram(news_list, keyword=None):
    """خلاصه چند خبر در یک پیام"""
    if not news_list:
        return None
    
    now = datetime.now()
    j_now = jdatetime.datetime.fromgregorian(datetime=now)
    date_str = j_now.strftime("%d %B %Y - %H:%M")
    
    header = f"📬 <b>گزارش خبری {date_str}</b>\n"
    if keyword:
        header += f"🔑 کلیدواژه: <b>{keyword}</b>\n"
    header += f"📊 تعداد اخبار: {len(news_list)}\n"
    header += f"━━━━━━━━━━━━━━━\n\n"
    
    body = ""
    for i, item in enumerate(news_list[:10], 1):  # max 10 in digest
        title = item.get("title", "")[:90]
        publisher = item.get("publisher", "")
        link = item.get("link", "")
        time_str = item.get("time_str", "")
        type_emoji = "🇮🇷" if item.get("source_type") == "domestic" else "🌍"
        
        body += f"{i}. {type_emoji} <b>{title}</b>\n"
        body += f"   🏢 {publisher} | 🕐 {time_str}\n"
        body += f"   🔗 <a href=\"{link}\">لینک</a>\n\n"
    
    footer = f"━━━━━━━━━━━━━━━\n🤖 اینتلی‌نیوز"
    return header + body + footer

def send_to_telegram(bot_token, chat_id, message, parse_mode="HTML", disable_preview=False):
    if not bot_token or not chat_id:
        return False, "توکن یا آیدی کانال تنظیم نشده"
    
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": message,
        "parse_mode": parse_mode,
        "disable_web_page_preview": disable_preview
    }
    try:
        resp = requests.post(url, json=payload, timeout=15)
        data = resp.json()
        if resp.status_code == 200 and data.get("ok"):
            add_log(f"پیام به تلگرام ارسال شد: {chat_id}", "success")
            return True, "ارسال شد"
        else:
            err = data.get("description", str(data))
            add_log(f"خطا در ارسال تلگرام: {err}", "error")
            return False, err
    except Exception as e:
        err = str(e)
        add_log(f"خطای اتصال تلگرام: {err}", "error")
        return False, err

def send_news_item(bot_token, chat_id, news_item):
    msg = format_news_for_telegram(news_item)
    return send_to_telegram(bot_token, chat_id, msg, parse_mode="HTML", disable_preview=False)

def send_news_batch(bot_token, chat_id, news_items, mode="immediate"):
    if not news_items:
        return []
    
    results = []
    if mode == "digest":
        # یک پیام خلاصه
        digest_msg = format_digest_for_telegram(news_items)
        if digest_msg:
            ok, info = send_to_telegram(bot_token, chat_id, digest_msg, parse_mode="HTML")
            results.append((ok, info))
        # سپس لینک‌ها جداگانه؟ برای digest فقط همین
    else:
        # تک تک
        for item in news_items:
            ok, info = send_news_item(bot_token, chat_id, item)
            results.append((ok, info))
            # anti-flood
            import time
            time.sleep(1.2)
    return results

def test_telegram_connection(bot_token, chat_id):
    test_msg = f"""✅ <b>اتصال موفق!</b>

🤖 اینتلی‌نیوز فعال شد

📅 {jdatetime.datetime.now().strftime('%Y/%m/%d %H:%M')}

این یک پیام تستی است. از این پس اخبار مرتبط با کلیدواژه‌های شما هر ساعت به این کانال ارسال می‌شود.

✨ تنظیمات:
• فرمت: تیتر + خلاصه + تاریخ + لینک + ناشر
• بازه: هر یک ساعت
• منابع: داخلی و خارجی
"""
    return send_to_telegram(bot_token, chat_id, test_msg, parse_mode="HTML")
