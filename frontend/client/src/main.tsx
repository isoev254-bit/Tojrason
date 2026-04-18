// Tojrason/frontend/client/src/main.tsx
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';
import './styles/variables.css';

// Илова кардани конфигуратсияи Vite барои тағйирёбандаҳои муҳит
// дар файли .env ё .env.local анҷом дода мешавад

// Гирифтани элементи решавӣ
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Элементи решавӣ бо ID "root" ёфт нашуд. Лутфан index.html-ро тафтиш кунед.');
}

// Эҷоди решаи React ва рендер кардани барнома
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
