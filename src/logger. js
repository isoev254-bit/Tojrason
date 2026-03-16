// backend/utils/logger.js
'use strict';

const colors = {
  INFO:  '\x1b[36m',  // cyan
  WARN:  '\x1b[33m',  // yellow
  ERROR: '\x1b[31m',  // red
  RESET: '\x1b[0m'
};

function fmt(level, ...args) {
  const ts  = new Date().toISOString();
  const col = colors[level] || '';
  const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ');
  return `${col}[${ts}] [${level}]${colors.RESET} ${msg}`;
}

const logger = {
  info:  (...a) => console.log(fmt('INFO',  ...a)),
  warn:  (...a) => console.warn(fmt('WARN',  ...a)),
  error: (...a) => console.error(fmt('ERROR', ...a))
};

module.exports = logger;
