import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// RATE LIMITING — ограничение частоты запросов
//
// Зачем нужно: защита от DDoS атак, брутфорса паролей,
// парсинга сайта и злоупотребления API.
//
// Принцип работы (sliding window):
// Для каждого IP считаем количество запросов за последнюю минуту.
// Если превышен лимит — блокируем IP на 15 минут.
// ============================================================

// Map — структура данных "ключ → значение", как объект но лучше для частых операций
// Ключ: IP адрес (строка), Значение: { count: количество запросов, resetTime: когда сбросить счётчик }
// Map хранится в памяти процесса Node.js — при перезапуске сервера очищается
const requestCounts = new Map<string, { count: number; resetTime: number }>();

// Set — структура данных "множество уникальных значений"
// Хранит IP адреса которые временно заблокированы
// Set быстрее Array для проверки наличия элемента (O(1) vs O(n))
const blockedIPs = new Set<string>();

// Константы настроек rate limiting
const RATE_LIMIT = {
  windowMs: 60 * 1000,           // 60 секунд * 1000 мс = 1 минута в миллисекундах
  maxRequests: 100,               // максимум 100 запросов за 1 минуту с одного IP
  blockDuration: 15 * 60 * 1000, // 15 минут * 60 секунд * 1000 мс = блокировка на 15 минут
};

// ============================================================
// ФУНКЦИЯ getClientIP — определяет реальный IP адрес клиента
//
// Проблема: когда сервер стоит за nginx или другим прокси,
// request.ip содержит IP прокси (127.0.0.1), а не клиента.
// Реальный IP передаётся в специальных заголовках.
// ============================================================
const getClientIP = (request: NextRequest): string => {
  // X-Forwarded-For — стандартный заголовок от прокси серверов
  // Формат: "клиент, прокси1, прокси2" (цепочка через запятую)
  // Пример: "217.116.58.58, 10.0.0.1, 192.168.1.1"
  const forwarded = request.headers.get('x-forwarded-for');

  // X-Real-IP — заголовок который устанавливает nginx
  // Содержит только один IP (реальный IP клиента)
  const realIP = request.headers.get('x-real-ip');

  if (forwarded) {
    // Берём первый IP из цепочки — это и есть реальный клиент
    // split(',') разбивает строку по запятой, [0] берёт первый элемент
    // trim() убирает пробелы (в заголовке может быть "IP1, IP2" с пробелом)
    return forwarded.split(',')[0].trim();
  }

  if (realIP) {
    return realIP; // nginx уже дал нам чистый IP
  }

  // Fallback: встроенный IP из Next.js (работает без прокси)
  // || 'unknown' — если request.ip тоже undefined
  return request.ip || 'unknown';
};

// ============================================================
// ФУНКЦИЯ checkRateLimit — проверяет и обновляет счётчик запросов
//
// Возвращает:
//   true — запрос разрешён (лимит не превышен)
//   false — лимит превышен, IP заблокирован
// ============================================================
const checkRateLimit = (ip: string): boolean => {
  const now = Date.now(); // текущее время в миллисекундах (Unix timestamp)
  const record = requestCounts.get(ip); // получаем запись для этого IP (или undefined)

  if (!record || now > record.resetTime) {
    // Два случая когда создаём новую запись:
    // 1. !record — этот IP делает запрос впервые
    // 2. now > record.resetTime — прошла минута, окно сбросилось
    requestCounts.set(ip, {
      count: 1,                          // первый запрос в новом окне
      resetTime: now + RATE_LIMIT.windowMs // когда сбросить счётчик (через 1 минуту)
    });
    return true; // запрос разрешён
  }

  if (record.count >= RATE_LIMIT.maxRequests) {
    // Счётчик достиг лимита — блокируем IP
    blockedIPs.add(ip); // добавляем в чёрный список

    // Через 15 минут автоматически разблокируем IP
    // setTimeout — встроенная функция Node.js, выполняет колбэк через N миллисекунд
    setTimeout(() => blockedIPs.delete(ip), RATE_LIMIT.blockDuration);

    return false; // запрос заблокирован
  }

  // Лимит не превышен — увеличиваем счётчик и разрешаем запрос
  record.count++;
  return true;
};

// ============================================================
// АВТОМАТИЧЕСКАЯ ОЧИСТКА ПАМЯТИ
//
// Проблема: Map requestCounts растёт бесконечно если не чистить.
// Каждый уникальный IP добавляет запись. За день могут быть тысячи IP.
//
// Решение: каждую минуту проходим по всем записям и удаляем устаревшие
// (те у которых истекло окно — resetTime в прошлом).
// ============================================================
setInterval(() => {
  const now = Date.now();
  // entries() возвращает итератор пар [ключ, значение]
  // for...of перебирает все записи в Map
  for (const [ip, record] of requestCounts.entries()) {
    if (now > record.resetTime) {
      requestCounts.delete(ip); // удаляем устаревшую запись
    }
  }
}, RATE_LIMIT.windowMs); // запускаем каждую минуту (совпадает с размером окна)

// ============================================================
// ФУНКЦИЯ rateLimitMiddleware — основная функция rate limiting
// Вызывается из middleware.ts для каждого API запроса
//
// Возвращает:
//   NextResponse с кодом 429 — если запрос заблокирован
//   null — если запрос разрешён (продолжаем обработку)
// ============================================================
export const rateLimitMiddleware = (request: NextRequest) => {
  const ip = getClientIP(request); // определяем IP клиента

  // Сначала проверяем чёрный список — это быстрее чем проверять счётчик
  if (blockedIPs.has(ip)) {
    // has() — проверка наличия в Set, O(1) — очень быстро
    return NextResponse.json(
      { error: 'Too many requests. IP temporarily blocked.' },
      { status: 429 } // 429 Too Many Requests — стандартный HTTP код для rate limiting
    );
  }

  // Проверяем счётчик запросов
  if (!checkRateLimit(ip)) {
    // checkRateLimit вернул false — лимит превышен и IP только что заблокирован
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }

  return null; // null = "всё в порядке, продолжай обработку запроса"
};

// ============================================================
// ФУНКЦИЯ checkSuspiciousPatterns — проверяет URL на атаки
//
// Проверяет URL запроса на наличие паттернов SQL-инъекций,
// XSS атак и path traversal.
//
// Важно: это дополнительный слой защиты, не основной.
// Основная защита — параметризованные запросы Prisma (SQL)
// и React (XSS через JSX автоматически экранирует HTML).
//
// Возвращает true если запрос подозрительный (нужно заблокировать)
// ============================================================
export const checkSuspiciousPatterns = (request: NextRequest): boolean => {
  const url = request.url.toLowerCase(); // приводим к нижнему регистру для сравнения без учёта регистра

  const suspiciousPatterns = [
    // SQL инъекции — попытки выполнить SQL команды через URL
    'union select',  // UNION SELECT — объединение результатов запросов для кражи данных
    'drop table',    // DROP TABLE — удаление таблицы
    'insert into',   // INSERT INTO — вставка данных
    'delete from',   // DELETE FROM — удаление данных
    'update set',    // UPDATE SET — изменение данных

    // XSS (Cross-Site Scripting) — попытки внедрить JavaScript
    '<script',       // тег script для выполнения JS
    'javascript:',   // псевдо-протокол для выполнения JS в href
    'eval(',         // функция eval выполняет строку как JS код
    'expression(',   // CSS expression (старый IE) для выполнения JS

    // Path traversal — попытки выйти за пределы разрешённой директории
    '../',           // подъём на уровень выше в Unix/Linux
    '..\\',          // подъём на уровень выше в Windows
  ];

  // some() — возвращает true если хотя бы один элемент массива удовлетворяет условию
  // Останавливается при первом совпадении (не проверяет остальные)
  return suspiciousPatterns.some(pattern => url.includes(pattern));
};

// Экспортируем getClientIP для использования в других местах (например в логировании)
export { getClientIP };
