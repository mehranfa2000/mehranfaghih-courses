import feedparser
import requests
import uuid
import re
import time
import os
from datetime import datetime, timedelta
from urllib.parse import quote_plus, urlparse
from dateutil import parser as date_parser
import jdatetime
from bs4 import BeautifulSoup
import trafilatura

try:
    from .sources import GOOGLE_NEWS_TEMPLATES, DOMESTIC_SOURCES, INTERNATIONAL_SOURCES, get_source_by_domain, get_all_sources
    from .database import add_log
except ImportError:
    from sources import GOOGLE_NEWS_TEMPLATES, DOMESTIC_SOURCES, INTERNATIONAL_SOURCES, get_source_by_domain, get_all_sources
    from database import add_log

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

def clean_html(text):
    if not text:
        return ""
    soup = BeautifulSoup(text, "html.parser")
    return soup.get_text(separator=" ", strip=True)

def extract_publisher_from_url(url):
    try:
        domain = urlparse(url).netloc
        domain = domain.replace("www.", "")
        # check known sources
        src = get_source_by_domain(domain)
        if src:
            return src["name"]
        # fallback: extract domain name
        if domain:
            return domain.split(".")[0].capitalize() + " - " + domain
        return domain
    except:
        return "نامشخص"

def to_jalali_and_time(dt_obj):
    try:
        if dt_obj.tzinfo is not None:
            dt_obj = dt_obj.replace(tzinfo=None)
        # Jalali
        j = jdatetime.datetime.fromgregorian(datetime=dt_obj)
        jalali_str = j.strftime("%Y/%m/%d")
        time_str = dt_obj.strftime("%H:%M")
        date_str = dt_obj.strftime("%Y-%m-%d")
        iso = dt_obj.isoformat()
        jalali_full = j.strftime("%d %B %Y")
        return {
            "jalali": jalali_str,
            "jalali_full": jalali_full,
            "time": time_str,
            "date": date_str,
            "iso": iso
        }
    except Exception as e:
        now = datetime.now()
        j = jdatetime.datetime.fromgregorian(datetime=now)
        return {
            "jalali": j.strftime("%Y/%m/%d"),
            "jalali_full": j.strftime("%d %B %Y"),
            "time": now.strftime("%H:%M"),
            "date": now.strftime("%Y-%m-%d"),
            "iso": now.isoformat()
        }

def parse_entry_date(entry):
    dt = None
    # try different fields
    for field in ["published", "updated", "pubDate"]:
        if field in entry and entry[field]:
            try:
                dt = date_parser.parse(entry[field])
                break
            except:
                continue
    if not dt:
        dt = datetime.now()
    # If dt is future or too old, keep as is but log
    return dt

def extract_summary(entry, max_len=300):
    # Try to get summary/content
    summary = ""
    if "summary" in entry and entry.summary:
        summary = clean_html(entry.summary)
    elif "description" in entry and entry.description:
        summary = clean_html(entry.description)
    
    # Try to extract more via trafilatura if link exists (optional, heavy)
    # For speed, we skip heavy fetching unless summary too short
    if len(summary) < 100 and "link" in entry:
        try:
            summary_extra = fetch_article_summary(entry.link)
            if summary_extra and len(summary_extra) > len(summary):
                summary = summary_extra
        except:
            pass

    # Clean and truncate
    summary = re.sub(r'\s+', ' ', summary).strip()
    if len(summary) > max_len:
        # cut by sentence
        cut = summary[:max_len]
        last_dot = cut.rfind('۔')
        if last_dot == -1:
            last_dot = cut.rfind('.')
        if last_dot == -1:
            last_dot = cut.rfind('؟')
        if last_dot > max_len * 0.6:
            cut = cut[:last_dot+1]
        else:
            cut = cut + "..."
        summary = cut
    if not summary:
        summary = "خلاصه‌ای در دسترس نیست، برای مطالعه متن کامل روی لینک کلیک کنید."
    return summary

def fetch_article_summary(url, timeout=6):
    try:
        downloaded = trafilatura.fetch_url(url)
        if not downloaded:
            return None
        text = trafilatura.extract(downloaded, include_comments=False, include_tables=False)
        if text:
            # first 2-3 sentences
            text = re.sub(r'\s+', ' ', text).strip()
            sentences = re.split(r'[.!?؟۔]\s+', text)
            summary = ' '.join(sentences[:2])
            if len(summary) < 50 and len(sentences) > 2:
                summary = ' '.join(sentences[:3])
            return summary[:400]
    except Exception as e:
        pass
    # fallback with requests + bs4
    try:
        r = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=timeout)
        if r.status_code == 200:
            soup = BeautifulSoup(r.text, "html.parser")
            # remove scripts
            for tag in soup(["script", "style", "nav", "footer"]):
                tag.decompose()
            # try meta description
            meta = soup.find("meta", attrs={"name": "description"}) or soup.find("meta", attrs={"property": "og:description"})
            if meta and meta.get("content"):
                return meta.get("content")[:400]
            # first p
            ps = soup.find_all("p")
            for p in ps:
                txt = p.get_text(strip=True)
                if len(txt) > 80:
                    return txt[:400]
    except:
        pass
    return None

def _generate_fallback_news(keyword, lang="fa", max_items=5):
    """تولید اخبار نمونه برای حالت دمو / زمانی که شبکه در دسترس نیست"""
    import random
    now = datetime.now()
    samples_fa_domestic = [
        ("ایرنا", "خبرگزاری ایرنا", "domestic"),
        ("ایسنا", "ایسنا", "domestic"),
        ("مهر", "خبرگزاری مهر", "domestic"),
        ("تسنیم", "خبرگزاری تسنیم", "domestic"),
        ("فارس", "خبرگزاری فارس", "domestic"),
        ("تابناک", "تابناک", "domestic"),
        ("خبرآنلاین", "خبر آنلاین", "domestic"),
    ]
    samples_fa_int = [
        ("BBC", "BBC فارسی", "international"),
        ("DW", "دویچه وله فارسی", "international"),
        ("Euronews", "یورونیوز فارسی", "international"),
        ("RadioFarda", "رادیو فردا", "international"),
    ]
    samples_en = [
        ("Reuters", "Reuters", "international"),
        ("BBC News", "BBC News", "international"),
        ("The Guardian", "The Guardian", "international"),
        ("AP News", "AP News", "international"),
        ("Bloomberg", "Bloomberg", "international"),
    ]

    if lang == "fa":
        pools = samples_fa_domestic + samples_fa_int
        titles_templates = [
            f"آخرین تحولات مرتبط با {keyword} در بازار",
            f"بررسی تخصصی تاثیر {keyword} بر اقتصاد ایران",
            f"گزارش جدید درباره {keyword} منتشر شد",
            f"کارشناسان درباره آینده {keyword} چه می‌گویند؟",
            f"جزئیات تازه از پروژه {keyword} اعلام شد",
            f"افزایش توجه جهانی به موضوع {keyword}",
            f"تحلیل: چرا {keyword} ترند شده است؟",
        ]
        summaries_templates = [
            f"در این گزارش آخرین اخبار و تحلیل‌ها پیرامون {keyword} بررسی شده است. کارشناسان معتقدند روند فعلی می‌تواند تاثیر قابل توجهی بر بازار داشته باشد.",
            f"منابع آگاه از تحولات جدید در حوزه {keyword} خبر دادند. این تحولات ممکن است مسیر آینده این حوزه را تغییر دهد.",
            f"با توجه به افزایش جستجو برای {keyword}، رسانه‌های داخلی و خارجی پوشش گسترده‌ای به این موضوع اختصاص داده‌اند. جزئیات بیشتر در متن خبر.",
            f"یک مطالعه جدید نشان می‌دهد که علاقه به {keyword} در ماه‌های اخیر رشد چشمگیری داشته است. این گزارش به بررسی دلایل این رشد می‌پردازد.",
        ]
    else:
        pools = samples_en
        titles_templates = [
            f"Breaking: New developments in {keyword}",
            f"Analysis: Why {keyword} is trending worldwide",
            f"Report: The future of {keyword} explained",
            f"Experts weigh in on {keyword} latest news",
            f"{keyword} market sees significant movement",
        ]
        summaries_templates = [
            f"Latest updates on {keyword} show interesting trends. Experts and analysts are closely watching the developments in this field.",
            f"A new report about {keyword} has been released, shedding light on previously unknown aspects. The findings could impact related industries.",
            f"The global attention on {keyword} continues to grow. This article covers the most important points you need to know.",
        ]
    
    items = []
    for i in range(max_items):
        dt = now - timedelta(minutes=random.randint(5, 300), hours=random.randint(0, 12))
        jalali_info = to_jalali_and_time(dt)
        pub_name, pub_display, s_type = random.choice(pools)
        title = random.choice(titles_templates)
        summary = random.choice(summaries_templates)
        # Add some variance
        if i > 0:
            title = f"{title} - به‌روزرسانی {i+1}"
        items.append({
            "id": str(uuid.uuid4())[:10],
            "title": title,
            "summary": summary,
            "link": f"https://example.com/news/{keyword.replace(' ', '-')}-{i+1}?utm_source=intellinews",
            "publisher": pub_display,
            "published_at": jalali_info["iso"],
            "published_at_jalali": jalali_info["jalali"],
            "time_str": jalali_info["time"],
            "date_str": jalali_info["date"],
            "jalali_full": jalali_info["jalali_full"],
            "keyword": keyword,
            "source_type": s_type,
            "image_url": None,
            "fetched_at": datetime.now().isoformat(),
            "lang": lang,
            "is_fallback": True
        })
    return items

def fetch_google_news(keyword, lang="fa", max_items=10):
    """جستجو در گوگل نیوز بر اساس کلیدواژه"""
    template = GOOGLE_NEWS_TEMPLATES.get(lang, GOOGLE_NEWS_TEMPLATES["fa"])
    url = template.format(keyword=quote_plus(keyword))
    add_log(f"در حال جستجو Google News [{lang}]: {keyword}", "info")
    try:
        # use requests to get feed to avoid blocking
        resp = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=10)
        if resp.status_code != 200:
            add_log(f"خطا در دریافت Google News {lang}: {resp.status_code}", "error")
            # Fallback for demo
            if "DEMO_MODE" in os.environ or resp.status_code in [403, 404]:
                return _generate_fallback_news(keyword, lang, max_items)
            return []
        feed = feedparser.parse(resp.content)
        if len(feed.entries) == 0:
            # احتمال مسدود بودن یا نتیجه نداشتن - fallback دمو
            add_log(f"نتیجه‌ای از Google News دریافت نشد، تولید نمونه دمو برای {keyword}", "warning")
            return _generate_fallback_news(keyword, lang, max_items)
        items = []
        for entry in feed.entries[:max_items]:
            dt = parse_entry_date(entry)
            jalali_info = to_jalali_and_time(dt)
            
            # Google News often wraps real link
            link = entry.get("link", "")
            
            publisher = "گوگل نیوز"
            if "source" in entry:
                try:
                    if isinstance(entry.source, dict):
                        publisher = entry.source.get("title", publisher)
                    else:
                        # feedparser source object
                        publisher = getattr(entry.source, "title", publisher)
                except:
                    pass
            # try extract from title - format "Title - Publisher"
            title_raw = clean_html(entry.get("title", ""))
            if " - " in title_raw:
                parts = title_raw.rsplit(" - ", 1)
                if len(parts) == 2:
                    title_raw = parts[0].strip()
                    if len(parts[1]) < 50:
                        publisher = parts[1].strip()
            
            # Determine domestic/international by publisher or language
            source_type = "domestic" if lang == "fa" else "international"
            # Better heuristic: if publisher is Iranian...
            domestic_publishers = ["ایرنا", "ایسنا", "مهر", "تسنیم", "فارس", "تابناک", "خبرآنلاین", "اقتصاد"]
            is_domestic_hint = any(d in publisher for d in domestic_publishers)
            if is_domestic_hint:
                source_type = "domestic"
            
            summary = extract_summary(entry)
            
            news_item = {
                "id": str(uuid.uuid4())[:10],
                "title": title_raw,
                "summary": summary,
                "link": link,
                "publisher": publisher,
                "published_at": jalali_info["iso"],
                "published_at_jalali": jalali_info["jalali"],
                "time_str": jalali_info["time"],
                "date_str": jalali_info["date"],
                "jalali_full": jalali_info["jalali_full"],
                "keyword": keyword,
                "source_type": source_type,
                "image_url": None,
                "fetched_at": datetime.now().isoformat(),
                "lang": lang
            }
            items.append(news_item)
        add_log(f"{len(items)} خبر برای '{keyword}' [{lang}] یافت شد", "success")
        return items
    except Exception as e:
        add_log(f"خطا در fetch_google_news: {str(e)} - استفاده از نمونه دمو", "warning")
        # در محیط‌های بدون اینترنت، نمونه دمو برگردان
        return _generate_fallback_news(keyword, lang, max_items)

def fetch_rss_sources(keyword, sources, max_items_per_source=3):
    """جستجو در RSS مستقیم منابع داخلی/خارجی"""
    all_items = []
    keyword_lower = keyword.lower()
    for src in sources:
        try:
            add_log(f"بررسی منبع مستقیم: {src['name']}", "info")
            resp = requests.get(src["rss"], headers={"User-Agent": USER_AGENT}, timeout=8)
            if resp.status_code != 200:
                continue
            feed = feedparser.parse(resp.content)
            count = 0
            for entry in feed.entries:
                if count >= max_items_per_source:
                    break
                title = clean_html(entry.get("title", ""))
                summary_raw = clean_html(entry.get("summary", "") or entry.get("description", ""))
                combined = (title + " " + summary_raw).lower()
                # check keyword present
                if keyword_lower not in combined:
                    # also check English transliteration? skip
                    continue
                
                dt = parse_entry_date(entry)
                jalali_info = to_jalali_and_time(dt)
                news_item = {
                    "id": str(uuid.uuid4())[:10],
                    "title": title,
                    "summary": extract_summary(entry, max_len=320),
                    "link": entry.get("link", ""),
                    "publisher": src["name"],
                    "published_at": jalali_info["iso"],
                    "published_at_jalali": jalali_info["jalali"],
                    "time_str": jalali_info["time"],
                    "date_str": jalali_info["date"],
                    "jalali_full": jalali_info["jalali_full"],
                    "keyword": keyword,
                    "source_type": src["type"],
                    "image_url": None,
                    "fetched_at": datetime.now().isoformat(),
                    "lang": src["lang"]
                }
                all_items.append(news_item)
                count += 1
            time.sleep(0.3)  # polite
        except Exception as e:
            add_log(f"خطا در منبع {src['name']}: {str(e)}", "error")
            continue
    return all_items

def search_news_by_keyword(keyword, settings=None):
    """تابع اصلی جستجو - ترکیبی از گوگل نیوز + منابع مستقیم"""
    if settings is None:
        settings = {}
    
    enable_domestic = settings.get("enable_domestic", True)
    enable_international = settings.get("enable_international", True)
    max_per_keyword = settings.get("max_news_per_keyword", 5)
    max_per_fetch = settings.get("max_news_per_fetch", 15)
    
    all_news = []
    
    # Google News Persian
    if enable_domestic:
        fa_items = fetch_google_news(keyword, lang="fa", max_items=max_per_keyword)
        all_news.extend(fa_items)
    
    # Google News English for international
    if enable_international:
        en_items = fetch_google_news(keyword, lang="en", max_items=max_per_keyword)
        all_news.extend(en_items)
    
    # If still not enough, search direct RSS
    if len(all_news) < max_per_keyword:
        domestic_sources = DOMESTIC_SOURCES if enable_domestic else []
        international_sources = INTERNATIONAL_SOURCES if enable_international else []
        direct_sources = domestic_sources[:3] + international_sources[:2]  # limit to 5 to be fast
        direct_items = fetch_rss_sources(keyword, direct_sources, max_items_per_source=2)
        all_news.extend(direct_items)
    
    # Fallback: اگر هنوز چیزی نداریم (مثلا شبکه قطع)، نمونه دمو بساز
    if len(all_news) == 0:
        add_log(f"هیچ خبری یافت نشد، تولید نمونه دمو برای {keyword}", "warning")
        all_news = _generate_fallback_news(keyword, lang="fa", max_items=max_per_keyword)
        if enable_international:
            all_news += _generate_fallback_news(keyword, lang="en", max_items=2)
    
    # Deduplicate by link
    seen_links = set()
    deduped = []
    for item in all_news:
        link = item["link"]
        if link not in seen_links:
            seen_links.add(link)
            deduped.append(item)
    
    # Sort by published_at desc
    try:
        deduped = sorted(deduped, key=lambda x: x["published_at"], reverse=True)
    except:
        pass
    
    # Limit
    return deduped[:max_per_fetch]

def fetch_all_keywords(keywords_list, settings):
    """برای همه کلیدواژه‌های فعال"""
    results = []
    for kw_obj in keywords_list:
        if not kw_obj.get("enabled", True):
            continue
        # Respect per-keyword domestic/international setting
        custom_settings = settings.copy()
        if "domestic" in kw_obj:
            # if keyword disabled domestic, override
            if not kw_obj["domestic"]:
                custom_settings["enable_domestic"] = False
        if "international" in kw_obj:
            if not kw_obj["international"]:
                custom_settings["enable_international"] = False
        
        kw = kw_obj["keyword"]
        try:
            items = search_news_by_keyword(kw, custom_settings)
            results.extend(items)
        except Exception as e:
            add_log(f"خطا در جستجوی کلیدواژه {kw}: {str(e)}", "error")
        time.sleep(0.5)
    return results
