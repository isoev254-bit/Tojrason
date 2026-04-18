// Tojrason/frontend/client/src/utils/formatDate.ts
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
 * @param date - Сана дар формати гуногун (string, number, Date)
 * @returns Объекти Date ё null дар ҳолати нодуруст будани сана
 */
export const parseDate = (date: string | number | Date | null | undefined): Date | null => {
  if (!date) return null;
  
  try {
    const parsed = new Date(date);
    // Санҷиши валид будани сана
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
 * @param date - Сана барои форматкунӣ
 * @param options - Имконоти форматкунӣ
 * @param locale - Локал (пешфарз: 'tg-TJ')
 * @returns Санаи форматшуда ё сатри холӣ
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
 * @param date - Сана барои форматкунӣ
 * @param options - Имконоти форматкунӣ
 * @param locale - Локал (пешфарз: 'tg-TJ')
 * @returns Сана ва вақти форматшуда
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
 * @param date - Сана барои форматкунӣ
 * @param options - Имконоти форматкунӣ
 * @param locale - Локал (пешфарз: 'tg-TJ')
 * @returns Вақти форматшуда
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
 * @param date - Сана барои форматкунӣ
 * @returns Сана дар формати YYYY-MM-DD
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
 * @param date - Сана барои форматкунӣ
 * @returns Вақт дар формати HH:MM
 */
export const formatTimeForInput = (date: string | number | Date | null | undefined): string => {
  const parsedDate = parseDate(date);
  if (!parsedDate) return '';
  
  const hours = String(parsedDate.getHours()).padStart(2, '0');
  const minutes = String(parsedDate.getMinutes()).padStart(2, '0');
  
  return `${hours}:${minutes}`;
};

/**
 * Форматкунии сана барои паёмҳои нисбӣ (масалан: "2 соат пеш", "дирӯз")
 * @param date - Сана барои форматкунӣ
 * @returns Сатри нисбӣ ба забони тоҷикӣ
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
    const absDiffSec = Math.abs(diffSec);
    const absDiffMin = Math.abs(diffMin);
    const absDiffHour = Math.abs(diffHour);
    const absDiffDay = Math.abs(diffDay);
    
    if (absDiffSec < 60) return `пас аз ${absDiffSec} сония`;
    if (absDiffMin < 60) return `пас аз ${absDiffMin} дақиқа`;
    if (absDiffHour < 24) return `пас аз ${absDiffHour} соат`;
    if (absDiffDay < 30) return `пас аз ${absDiffDay} рӯз`;
    return formatDate(date);
  }
  
  // Гузашта
  if (diffSec < 60) return `${diffSec} сония пеш`;
  if (diffMin < 60) return `${diffMin} дақиқа пеш`;
  if (diffHour < 24) return `${diffHour} соат пеш`;
  if (diffDay === 1) return 'Дирӯз';
  if (diffDay < 7) return `${diffDay} рӯз пеш`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)} ҳафта пеш`;
  if (diffMonth < 12) return `${diffMonth} моҳ пеш`;
  if (diffYear === 1) return 'Як сол пеш';
  return `${diffYear} сол пеш`;
};

/**
 * Санҷиши имрӯз будани сана
 * @param date - Сана барои санҷиш
 * @returns true агар сана имрӯз бошад
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
 * @param date - Сана барои санҷиш
 * @returns true агар сана дирӯз бошад
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
 * Санҷиши фардо будани сана
 * @param date - Сана барои санҷиш
 * @returns true агар сана фардо бошад
 */
export const isTomorrow = (date: string | number | Date | null | undefined): boolean => {
  const parsedDate = parseDate(date);
  if (!parsedDate) return false;
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return (
    parsedDate.getDate() === tomorrow.getDate() &&
    parsedDate.getMonth() === tomorrow.getMonth() &&
    parsedDate.getFullYear() === tomorrow.getFullYear()
  );
};

/**
 * Форматкунии давомнокӣ (масалан: "2 соату 30 дақиқа")
 * @param minutes - Давомнокӣ бо дақиқа
 * @returns Сатри форматшуда
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 0) return '';
  
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
 * @param date - Сана барои табдил
 * @returns Сана дар формати YYYY-MM-DD
 */
export const toISODateString = (date: string | number | Date | null | undefined): string => {
  const parsedDate = parseDate(date);
  if (!parsedDate) return '';
  
  return parsedDate.toISOString().split('T')[0];
};

/**
 * Табдили объекти Date ба сатри ISO пурра
 * @param date - Сана барои табдил
 * @returns Сатри ISO
 */
export const toISOString = (date: string | number | Date | null | undefined): string => {
  const parsedDate = parseDate(date);
  if (!parsedDate) return '';
  
  return parsedDate.toISOString();
};

/**
 * Гирифтани номи моҳ ба забони тоҷикӣ
 * @param month - Индекси моҳ (0-11)
 * @returns Номи моҳ
 */
export const getMonthName = (month: number): string => {
  if (month < 0 || month > 11) return '';
  return MONTHS_TG[month];
};

/**
 * Гирифтани номи рӯзи ҳафта ба забони тоҷикӣ
 * @param day - Индекси рӯз (0-6, 0 = Якшанбе)
 * @returns Номи рӯз
 */
export const getWeekdayName = (day: number): string => {
  if (day < 0 || day > 6) return '';
  return WEEKDAYS_TG[day];
};
