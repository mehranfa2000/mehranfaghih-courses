/**
 * ============================================================
 * Logger Utility — سیستم لاگ حرفه‌ای
 * ============================================================
 * جایگزین مناسب برای console.log با قابلیت‌های:
 * - سطوح مختلف لاگ
 * - رنگ‌بندی خودکار
 * - فعال/غیرفعال‌سازی
 * - نمایش زمان
 * - ارسال به سرویس خارجی (اختیاری)
 */

const LEVELS = {
  DEBUG: { priority: 0, color: '#888', icon: '🔍', label: 'DEBUG' },
  INFO: { priority: 1, color: '#2196F3', icon: 'ℹ️', label: 'INFO' },
  WARN: { priority: 2, color: '#FF9800', icon: '⚠️', label: 'WARN' },
  ERROR: { priority: 3, color: '#F44336', icon: '❌', label: 'ERROR' },
  SUCCESS: { priority: 1, color: '#4CAF50', icon: '✅', label: 'SUCCESS' },
};

export class Logger {
  /**
   * @param {Object} options
   * @param {string} options.prefix - پیشوند نام ماژول
   * @param {boolean} options.enabled - فعال/غیرفعال
   * @param {string} options.minLevel - حداقل سطح نمایش
   * @param {Function} options.transport - تابع ارسال لاگ
   */
  constructor({
    prefix = 'App',
    enabled = true,
    minLevel = import.meta.env?.PROD ? 'WARN' : 'DEBUG',
    transport = null,
  } = {}) {
    this.prefix = prefix;
    this.enabled = enabled;
    this.minLevel = minLevel;
    this.transport = transport;
  }

  /**
   * بررسی اینکه لاگ باید نمایش داده شود یا نه
   */
  _shouldLog(level) {
    if (!this.enabled) return false;
    const minPriority = LEVELS[this.minLevel]?.priority ?? 0;
    const currentPriority = LEVELS[level]?.priority ?? 0;
    return currentPriority >= minPriority;
  }

  /**
   * لاگ اصلی
   */
  _log(level, ...args) {
    if (!this._shouldLog(level)) return;

    const config = LEVELS[level] || LEVELS.INFO;
    const timestamp = new Date().toLocaleTimeString('fa-IR');
    const prefixStyle = `color: ${config.color}; font-weight: bold;`;
    const timeStyle = 'color: #999; font-size: 11px;';

    const consoleMethod =
      level === 'ERROR' ? 'error' : level === 'WARN' ? 'warn' : level === 'DEBUG' ? 'debug' : 'log';

    console[consoleMethod](
      `%c[${config.icon} ${this.prefix}]%c ${timestamp}`,
      prefixStyle,
      timeStyle,
      ...args
    );

    if (this.transport) {
      this.transport({ level, prefix, timestamp, args });
    }
  }

  debug(...args) { this._log('DEBUG', ...args); }
  info(...args) { this._log('INFO', ...args); }
  warn(...args) { this._log('WARN', ...args); }
  error(...args) { this._log('ERROR', ...args); }
  success(...args) { this._log('SUCCESS', ...args); }

  setEnabled(enabled) { this.enabled = enabled; }
  setLevel(level) { this.minLevel = level; }
}

export const logger = new Logger({ prefix: 'App' });
