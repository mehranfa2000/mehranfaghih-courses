from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class KeywordCreate(BaseModel):
    keyword: str
    enabled: bool = True
    domestic: bool = True
    international: bool = True

class Keyword(BaseModel):
    id: str
    keyword: str
    enabled: bool = True
    domestic: bool = True
    international: bool = True
    created_at: str

class NewsItem(BaseModel):
    id: str
    title: str
    summary: str
    link: str
    publisher: str
    published_at: str  # ISO
    published_at_jalali: Optional[str] = None
    time_str: Optional[str] = None
    date_str: Optional[str] = None
    keyword: str
    source_type: str  # domestic / international / both
    image_url: Optional[str] = None
    fetched_at: str

class TelegramConfig(BaseModel):
    bot_token: str
    chat_id: str  # کانال: @channel یا -100...
    enabled: bool = True
    send_mode: str = "immediate"  # immediate / digest

class Settings(BaseModel):
    interval_minutes: int = 60
    max_news_per_fetch: int = 15
    max_news_per_keyword: int = 5
    auto_send_telegram: bool = True
    enable_domestic: bool = True
    enable_international: bool = True
    duplicate_check_hours: int = 24

class FetchRequest(BaseModel):
    keyword: Optional[str] = None
    force: bool = False

class SearchResult(BaseModel):
    keyword: str
    count: int
    news: List[NewsItem]
