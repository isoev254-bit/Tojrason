// Tojrason/frontend/shared/utils/formatPrice.ts
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

/**
 * Намудҳои асъори дастгиришаванда
 */
export type Currency = 'TJS' | 'USD' | 'EUR' | 'RUB';

/**
 * Конфигуратсияи асъорҳо
 */
export const CURRENCY_CONFIG: Record<Currency, {
  symbol: string;
  name: string;
  nameTg: string;
  decimals: number;
}> = {
  TJS: {
    symbol: 'смн',
    name: 'Somoni',
    nameTg: 'Сомонӣ',
    decimals: 2,
  },
  USD: {
    symbol: '$',
    name: 'US Dollar',
    nameTg: 'Доллар',
    decimals: 2,
  },
  EUR: {
    symbol: '€',
    name: 'Euro',
    nameTg: 'Евро',
    decimals: 2,
  },
  RUB: {
    symbol: '₽',
    name: 'Russian Ruble',
    nameTg: 'Рубл',
    decimals: 2,
  },
};

/**
 * Асъори пешфарз
 */
export const DEFAULT_CURRENCY: Currency = 'TJS';

/**
 * Имконоти форматкунии нарх
 */
export interface FormatPriceOptions {
  currency?: Currency;
  showSymbol?: boolean;
  symbolPosition?: 'before' | 'after';
  showCode?: boolean;
  decimals?: number;
  thousandsSeparator?: string;
  decimalSeparator?: string;
}

/**
 * Танзимоти пешфарз барои форматкунӣ
 */
const DEFAULT_OPTIONS: Required<FormatPriceOptions> = {
  currency: DEFAULT_CURRENCY,
  showSymbol: true,
  symbolPosition: 'after',
  showCode: false,
  decimals: 2,
  thousandsSeparator: ' ',
  decimalSeparator: ',',
};

/**
 * Форматкунии нарх
 */
export const formatPrice = (
  amount: number | string | null | undefined,
  options: FormatPriceOptions = {}
): string => {
  if (amount === null || amount === undefined || amount === '') {
    return '';
  }

  let numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numericAmount)) {
    return '';
  }

  const opts = { ...DEFAULT_OPTIONS, ...options };
  const currencyConfig = CURRENCY_CONFIG[opts.currency];
  const decimals = opts.decimals ?? currencyConfig.decimals;

  const roundedAmount = Math.round(numericAmount * Math.pow(10, decimals)) / Math.pow(10, decimals);

  const [integerPart, decimalPart] = roundedAmount.toString().split('.');

  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, opts.thousandsSeparator);

  const formattedDecimal = decimalPart
    ? decimalPart.padEnd(decimals, '0')
    : '0'.repeat(decimals);

  let formattedAmount = `${formattedInteger}${opts.decimalSeparator}${formattedDecimal}`;

  let currencyDisplay = '';
  if (opts.showSymbol) {
    currencyDisplay = currencyConfig.symbol;
  }
  if (opts.showCode) {
    currencyDisplay = currencyDisplay ? `${currencyDisplay} (${opts.currency})` : opts.currency;
  }

  if (currencyDisplay) {
    return opts.symbolPosition === 'before'
      ? `${currencyDisplay}${formattedAmount}`
      : `${formattedAmount} ${currencyDisplay}`;
  }

  return formattedAmount;
};

/**
 * Форматкунии нарх бо асъори пешфарз (Сомонӣ)
 */
export const formatPriceTJS = (amount: number | string | null | undefined): string => {
  return formatPrice(amount, { currency: 'TJS' });
};

/**
 * Форматкунии кӯтоҳи нарх барои маблағҳои калон
 */
export const formatPriceShort = (
  amount: number | string | null | undefined,
  currency: Currency = DEFAULT_CURRENCY
): string => {
  if (amount === null || amount === undefined) return '';
  
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '';

  const currencyConfig = CURRENCY_CONFIG[currency];
  const symbol = currencyConfig.symbol;

  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}М ${symbol}`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}К ${symbol}`;
  }
  return formatPrice(num, { currency });
};

/**
 * Ҳисобкунии маблағи тахфиф
 */
export const calculateDiscountAmount = (
  originalPrice: number,
  discountPercent: number
): number => {
  if (originalPrice < 0 || discountPercent < 0 || discountPercent > 100) {
    return 0;
  }
  return (originalPrice * discountPercent) / 100;
};

/**
 * Ҳисобкунии нархи ниҳоӣ пас аз тахфиф
 */
export const calculateDiscountedPrice = (
  originalPrice: number,
  discountPercent: number
): number => {
  const discount = calculateDiscountAmount(originalPrice, discountPercent);
  return Math.max(0, originalPrice - discount);
};

/**
 * Ҳисобкунии фоизи тахфиф аз нархҳо
 */
export const calculateDiscountPercent = (
  originalPrice: number,
  discountedPrice: number
): number => {
  if (originalPrice <= 0 || discountedPrice < 0) return 0;
  if (discountedPrice >= originalPrice) return 0;
  
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
};

/**
 * Форматкунии фоизи тахфиф
 */
export const formatDiscountPercent = (percent: number): string => {
  if (percent <= 0) return '';
  return `-${Math.round(percent)}%`;
};

/**
 * Ҳисобкунии андоз аз маблағ
 */
export const calculateTax = (amount: number, taxRate: number): number => {
  if (amount < 0 || taxRate < 0) return 0;
  return (amount * taxRate) / 100;
};

/**
 * Ҳисобкунии нархи умумӣ бо андоз
 */
export const calculateTotalWithTax = (subtotal: number, taxRate: number): number => {
  const tax = calculateTax(subtotal, taxRate);
  return subtotal + tax;
};

/**
 * Табдили асъор
 */
export const convertCurrency = (
  amount: number,
  from: Currency,
  to: Currency,
  exchangeRate: number
): number => {
  if (from === to) return amount;
  return amount * exchangeRate;
};

/**
 * Форматкунии диапазони нарх
 */
export const formatPriceRange = (
  minPrice: number,
  maxPrice: number,
  currency: Currency = DEFAULT_CURRENCY
): string => {
  if (minPrice === maxPrice) {
    return formatPrice(minPrice, { currency });
  }
  
  const formattedMin = formatPrice(minPrice, { showSymbol: false });
  const formattedMax = formatPrice(maxPrice, { currency });
  return `${formattedMin} - ${formattedMax}`;
};

/**
 * Табдили маблағ ба ҳарф (ба забони тоҷикӣ)
 */
export const amountToWords = (amount: number): string => {
  if (amount === 0) return 'сифр';
  
  const units = ['', 'як', 'ду', 'се', 'чор', 'панҷ', 'шаш', 'ҳафт', 'ҳашт', 'нӯҳ'];
  const teens = ['даҳ', 'ёздаҳ', 'дувоздаҳ', 'сенздаҳ', 'чордаҳ', 'понздаҳ', 'шонздаҳ', 'ҳабдаҳ', 'ҳаждаҳ', 'нуздаҳ'];
  const tens = ['', '', 'бист', 'сӣ', 'чил', 'панҷоҳ', 'шаст', 'ҳафтод', 'ҳаштод', 'навад'];
  const hundreds = ['', 'сад', 'дусад', 'сесад', 'чорсад', 'панҷсад', 'шашсад', 'ҳафтсад', 'ҳаштсад', 'нӯҳсад'];
  
  const convertLessThanThousand = (n: number): string => {
    if (n === 0) return '';
    
    if (n < 10) return units[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) {
      const unit = n % 10;
      return tens[Math.floor(n / 10)] + (unit ? 'у ' + units[unit] : '');
    }
    
    const hundred = Math.floor(n / 100);
    const remainder = n % 100;
    return hundreds[hundred] + (remainder ? 'у ' + convertLessThanThousand(remainder) : '');
  };
  
  if (amount < 1000) {
    return convertLessThanThousand(amount) + ' сомонӣ';
  }
  
  const thousands = Math.floor(amount / 1000);
  const remainder = amount % 1000;
  
  let result = convertLessThanThousand(thousands) + ' ҳазор';
  if (remainder > 0) {
    result += 'у ' + convertLessThanThousand(remainder);
  }
  
  return result + ' сомонӣ';
};

/**
 * Валид кардани нарх (бузургтар аз 0)
 */
export const isValidPrice = (amount: number | string | null | undefined): boolean => {
  if (amount === null || amount === undefined || amount === '') return false;
  
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return !isNaN(num) && num >= 0;
};

// Экспорти пешфарз
const formatPriceUtils = {
  formatPrice,
  formatPriceTJS,
  formatPriceShort,
  calculateDiscountAmount,
  calculateDiscountedPrice,
  calculateDiscountPercent,
  formatDiscountPercent,
  calculateTax,
  calculateTotalWithTax,
  convertCurrency,
  formatPriceRange,
  amountToWords,
  isValidPrice,
  CURRENCY_CONFIG,
  DEFAULT_CURRENCY,
};

export default formatPriceUtils;
