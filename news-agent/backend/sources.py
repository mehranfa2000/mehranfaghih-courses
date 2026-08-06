"""
منابع خبری داخلی و خارجی
"""
DOMESTIC_SOURCES = [
    {
        "name": "خبرگزاری ایرنا",
        "domain": "irna.ir",
        "rss": "https://www.irna.ir/rss",
        "type": "domestic",
        "lang": "fa"
    },
    {
        "name": "ایسنا",
        "domain": "isna.ir",
        "rss": "https://www.isna.ir/rss",
        "type": "domestic",
        "lang": "fa"
    },
    {
        "name": "خبرگزاری مهر",
        "domain": "mehrnews.com",
        "rss": "https://www.mehrnews.com/rss",
        "type": "domestic",
        "lang": "fa"
    },
    {
        "name": "خبرگزاری تسنیم",
        "domain": "tasnimnews.com",
        "rss": "https://www.tasnimnews.com/fa/rss/feed/0/0/0/%D9%87%D9%85%D9%87-%D8%A8%D8%AE%D8%B4-%D9%87%D8%A7",
        "type": "domestic",
        "lang": "fa"
    },
    {
        "name": "خبر آنلاین",
        "domain": "khabaronline.ir",
        "rss": "https://www.khabaronline.ir/rss",
        "type": "domestic",
        "lang": "fa"
    },
    {
        "name": "تابناک",
        "domain": "tabnak.ir",
        "rss": "https://www.tabnak.ir/fa/rss/allnews",
        "type": "domestic",
        "lang": "fa"
    },
    {
        "name": "فارس",
        "domain": "farsnews.ir",
        "rss": "https://www.farsnews.ir/rss",
        "type": "domestic",
        "lang": "fa"
    },
    {
        "name": "اقتصاد آنلاین",
        "domain": "eghtesadonline.com",
        "rss": "https://www.eghtesadonline.com/rss",
        "type": "domestic",
        "lang": "fa"
    },
]

INTERNATIONAL_SOURCES = [
    {
        "name": "BBC فارسی",
        "domain": "bbc.com",
        "rss": "https://feeds.bbci.co.uk/persian/rss.xml",
        "type": "international",
        "lang": "fa"
    },
    {
        "name": "رادیو فردا",
        "domain": "radiofarda.com",
        "rss": "https://www.radiofarda.com/api/z$_oqq$oqvr",
        "type": "international",
        "lang": "fa"
    },
    {
        "name": "دویچه وله فارسی",
        "domain": "dw.com",
        "rss": "https://rss.dw.com/xml/rss-fa-all",
        "type": "international",
        "lang": "fa"
    },
    {
        "name": "یورونیوز فارسی",
        "domain": "euronews.com",
        "rss": "https://parsi.euronews.com/rss?format=mrss",
        "type": "international",
        "lang": "fa"
    },
]

# برای جستجوی کلیدواژه، از Google News RSS استفاده می‌کنیم که همه منابع را پوشش می‌دهد
GOOGLE_NEWS_TEMPLATES = {
    "fa": "https://news.google.com/rss/search?q={keyword}&hl=fa&gl=IR&ceid=IR:fa",
    "en": "https://news.google.com/rss/search?q={keyword}&hl=en-US&gl=US&ceid=US:en",
    "ar": "https://news.google.com/rss/search?q={keyword}&hl=ar&gl=SA&ceid=SA:ar",
}

def get_all_sources(include_domestic=True, include_international=True):
    result = []
    if include_domestic:
        result.extend(DOMESTIC_SOURCES)
    if include_international:
        result.extend(INTERNATIONAL_SOURCES)
    return result

def get_source_by_domain(domain_part):
    for src in DOMESTIC_SOURCES + INTERNATIONAL_SOURCES:
        if src["domain"] in domain_part:
            return src
    return None
