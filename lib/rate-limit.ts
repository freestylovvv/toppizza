import { NextRequest, NextResponse } from 'next/server';

// Хранилище для отслеживания запросов
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const blockedIPs = new Set<string>();

// Настройки rate limiting
const RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 минута
  maxRequests: 100, // максимум запросов за окно
  blockDuration: 15 * 60 * 1000, // блокировка на 15 минут
};

// Получение IP адреса
const getClientIP = (request: NextRequest): string => {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return request.ip || 'unknown';
};

// Проверка rate limit
const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const record = requestCounts.get(ip);
  
  if (!record || now > record.resetTime) {
    // Новое окно или первый запрос
    requestCounts.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT.windowMs
    });
    return true;
  }
  
  if (record.count >= RATE_LIMIT.maxRequests) {
    // Превышен лимит - блокируем IP
    blockedIPs.add(ip);
    setTimeout(() => blockedIPs.delete(ip), RATE_LIMIT.blockDuration);
    return false;
  }
  
  // Увеличиваем счетчик
  record.count++;
  return true;
};

// Очистка старых записей
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of requestCounts.entries()) {
    if (now > record.resetTime) {
      requestCounts.delete(ip);
    }
  }
}, RATE_LIMIT.windowMs);

export const rateLimitMiddleware = (request: NextRequest) => {
  const ip = getClientIP(request);
  
  // Проверяем, заблокирован ли IP
  if (blockedIPs.has(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. IP temporarily blocked.' },
      { status: 429 }
    );
  }
  
  // Проверяем rate limit
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }
  
  return null; // Продолжаем обработку
};

// Проверка подозрительных паттернов в URL
export const checkSuspiciousPatterns = (request: NextRequest): boolean => {
  const url = request.url.toLowerCase();
  const suspiciousPatterns = [
    'union select',
    'drop table',
    'insert into',
    'delete from',
    'update set',
    '<script',
    'javascript:',
    'eval(',
    'expression(',
    '../',
    '..\\',
  ];
  
  return suspiciousPatterns.some(pattern => url.includes(pattern));
};

export { getClientIP };