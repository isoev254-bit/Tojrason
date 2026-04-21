// Tojrason/frontend/shared/utils/formatDate.ts
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

/**
 * Имконоти пешфарз барои форматкунии сана
 */
export interface DateFormatOptions {
  year?: 'numeric' | '2-digit';
  month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
  day?: 'numeric' | '2-digit';
  hour?: 'numeric' | '2-digit';
  minute?: 'numeric' | '2-digit';
  second?: 'numeric' | '2-digit';
  hour12?: boolean;
  weekday?: 'long' | 'short' | 'narrow';
}

/**
 * Номҳои моҳҳо ба забони тоҷикӣ
 */
export const MONTHS_TG: string[] = [
  'Январ', 'Феврал', 'Март', 'Апрел', 'Май', 'Июн',
  'Июл', 'Август', 'Сентябр', 'Октябр', 'Ноябр', 'Декабр'
];

/**
 * Номҳои кӯтоҳи моҳҳо ба забони тоҷикӣ
 */
export const MONTHS_SHORT_TG: string[] = [
  'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
  'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'
];

/**
 * Номҳои рӯзҳои ҳафта ба забони тоҷикӣ
 */
export const WEEKDAYS_TG: string[] = [
  'Якшанбе', 'Душанбе', 'Сешанбе', 'Чоршанбе', 'Панҷшанбе', 'Ҷумъа', 'Шанбе'
];

/**
 * Номҳои кӯтоҳи рӯзҳои ҳафта
 */
export const WEEKDAYS_SHORT_TG: string[] = [
  'Якш', 'Душ', 'Сеш', 'Чор', 'Пан', 'Ҷум', 'Шан'
];

/**
 * Танзимоти пешфарз барои формати пурраи сана
 */
const DEFAULT_DATE_OPTIONS: DateFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

/**
 * Танзимоти пешфарз барои формати сана ва вақт
 */
const DEFAULT_DATETIME_OPTIONS: DateFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
};

/**
 * Танзимоти пешфарз барои формати вақт
 */
const DEFAULT_TIME_OPTIONS: DateFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
};

/**
 * Табдил додани сана ба объекти Date
 */
export const parseDate = (date: string | number | Date | null | undefined): Date | null => {
  if (!date) return null;
  
  try {
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

/**
 * Форматкунии сана бо имконоти додашуда
 */
export const formatDate = (
  date: string | number | Date | null | undefined,
  options: DateFormatOptions = DEFAULT_DATE_OPTIONS,
  locale: string = 'tg-TJ'
): string => {
  const parsedDate = parseDate(date);
  if (!parsedDate) return '';
  
  return parsedDate.toLocaleDateString(locale, options);
};

/**
 * Форматкунии сана ва вақт
 */
export const formatDateTime = (
  date: string | number | Date | null | undefined,
  options: DateFormatOptions = DEFAULT_DATETIME_OPTIONS,
  locale: string = 'tg-TJ'
): string => {
  const parsedDate = parseDate(date);
  if (!parsedDate) return '';
  
  return parsedDate.toLocaleString(locale, options);
};

/**
 * Форматкунии танҳо вақт
 */
export const formatTime = (
  date: string | number | Date | null | undefined,
  options: DateFormatOptions = DEFAULT_TIME_OPTIONS,
  locale: string = 'tg-TJ'
): string => {
  const parsedDate = parseDate(date);
  if (!parsedDate) return '';
  
  return parsedDate.toLocaleTimeString(locale, options);
};

/**
 * Форматкунии сана барои input[type="date"]
 */
export const formatDateForInput = (date: string | number | Date | null | undefined): string => {
  const parsedDate = parseDate(date);
  if (!parsedDate) return '';
  
  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
  const day = String(parsedDate.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Форматкунии вақт барои input[type="time"]
 */
export const formatTimeForInput = (date: string | number | Date | null | undefined): string => {
  const parsedDate = parseDate(date);
  if (!parsedDate) return '';
  
  const hours = String(parsedDate.getHours()).padStart(2, '0');
  const minutes = String(parsedDate.getMinutes()).padStart(2, '0');
  
  return `${hours}:${minutes}`;
};

/**
 * Форматкунии сана барои паёмҳои нисбӣ
 */
export const formatRelativeTime = (date: string | number | Date | null | undefined): string => {
  const parsedDate = parseDate(date);
  if (!parsedDate) return '';
  
  const now = new Date();
  const diffMs = now.getTime() - parsedDate.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);
  
  // Оянда
  if (diffMs < 0) {
    const absDiffMin = Math.abs(diffMin);
    const absDiffHour = Math.abs(diffHour);
    const absDiffDay = Math.abs(diffDay);
    
    if (absDiffMin < 60) return `пас аз ${absDiffMin} дақиқа`;
    if (absDiffHour < 24) return `пас аз ${absDiffHour} соат`;
    if (absDiffDay < 30) return `пас аз ${absDiffDay} рӯз`;
    return formatDate(date);
  }
  
  // Гузашта
  if (diffSec < 60) return 'ҳозир';
  if (diffMin < 60) return `${diffMin} дақиқа пеш`;
  if (diffHour < 24) return `${diffHour} соат пеш`;
  if (diffDay === 1) return 'Дирӯз';
  if (diffDay < 7) return `${diffDay} рӯз пеш`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)} ҳафта пеш`;
  if (diffMonth < 12) return `${diffMonth} моҳ пеш`;
  if (diffYear === 1) return 'Як сол пеш';
  
  return formatDate(date);
};

/**
 * Санҷиши имрӯз будани сана
 */
export const isToday = (date: string | number | Date | null | undefined): boolean => {
  const parsedDate = parseDate(date);
  if (!parsedDate) return false;
  
  const today = new Date();
  return (
    parsedDate.getDate() === today.getDate() &&
    parsedDate.getMonth() === today.getMonth() &&
    parsedDate.getFullYear() === today.getFullYear()
  );
};

/**
 * Санҷиши дирӯз будани сана
 */
export const isYesterday = (date: string | number | Date | null | undefined): boolean => {
  const parsedDate = parseDate(date);
  if (!parsedDate) return false;
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  return (
    parsedDate.getDate() === yesterday.getDate() &&
    parsedDate.getMonth() === yesterday.getMonth() &&
    parsedDate.getFullYear() === yesterday.getFullYear()
  );
};

/**
 * Форматкунии давомнокӣ
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 0) return '0 дақиқа';
  
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  
  if (hours === 0) {
    return `${mins} дақиқа`;
  }
  
  if (mins === 0) {
    return `${hours} соат`;
  }
  
  return `${hours} соату ${mins} дақиқа`;
};

/**
 * Табдили объекти Date ба сатри ISO бе вақт
 */
export const toISODateString = (date: string | number | Date | null | undefined): string => {
  const parsedDate = parseDate(date);
  if (!parsedDate) return '';
  
  return parsedDate.toISOString().split('T')[0];
};

/**
 * Табдили объекти Date ба сатри ISO пурра
 */
export const toISOString = (date: string | number | Date | null | undefined): string => {
  const parsedDate = parseDate(date);
  if (!parsedDate) return '';
  
  return parsedDate.toISOString();
};

/**
 * Гирифтани номи моҳ ба забони тоҷикӣ
 */
export const getMonthName = (month: number, short: boolean = false): string => {
  if (month < 0 || month > 11) return '';
  return short ? MONTHS_SHORT_TG[month] : MONTHS_TG[month];
};

/**
 * Гирифтани номи рӯзи ҳафта ба забони тоҷикӣ
 */
export const getWeekdayName = (day: number, short: boolean = false): string => {
  if (day < 0 || day > 6) return '';
  return short ? WEEKDAYS_SHORT_TG[day] : WEEKDAYS_TG[day];
};

// Экспорти пешфарз
const formatDateUtils = {
  parseDate,
  formatDate,
  formatDateTime,
  formatTime,
  formatDateForInput,
  formatTimeForInput,
  formatRelativeTime,
  formatDuration,
  isToday,
  isYesterday,
  toISODateString,
  toISOString,
  getMonthName,
  getWeekdayName,
  MONTHS_TG,
  MONTHS_SHORT_TG,
  WEEKDAYS_TG,
  WEEKDAYS_SHORT_TG,
};

export default formatDateUtils;
