import { NextRequest, NextResponse } from 'next/server';
import { rateLimitMiddleware, checkSuspiciousPatterns } from './lib/rate-limit';

// ============================================================
// NEXT.JS MIDDLEWARE
//
// Middleware — это функция которая выполняется на КАЖДЫЙ запрос
// ДО того как он попадёт на страницу или API маршрут.
//
// Это идеальное место для:
// - Проверки безопасности (блокировка атак)
// - Rate limiting (ограничение частоты запросов)
// - Добавления заголовков безопасности
// - Редиректов и авторизации
//
// Middleware работает на Edge Runtime (быстрее чем Node.js),
// поэтому нельзя использовать некоторые Node.js API (например fs).
// ============================================================

// Главная функция middleware — вызывается для каждого запроса
// request — объект запроса с URL, заголовками, методом и т.д.
export function middleware(request: NextRequest) {

  // ШАГ 1: Проверяем URL на SQL-инъекции и XSS паттерны
  // Если в URL есть "union select", "<script>" и т.д. — блокируем
  if (checkSuspiciousPatterns(request)) {
    // Логируем заблокированный запрос (URL и IP для анализа атак)
    console.warn(`Suspicious request blocked: ${request.url} from ${request.ip}`);

    // Возвращаем 403 Forbidden — запрос заблокирован по соображениям безопасности
    return NextResponse.json(
      { error: 'Request blocked for security reasons' },
      { status: 403 } // 403 Forbidden — сервер понял запрос но отказывает в доступе
    );
  }

  // ШАГ 2: Rate limiting — только для API маршрутов
  // Проверяем только /api/... чтобы не ограничивать загрузку страниц и статики
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // nextUrl.pathname — путь без домена (например "/api/orders")
    const rateLimitResponse = rateLimitMiddleware(request);
    if (rateLimitResponse) {
      // rateLimitMiddleware вернул ответ (не null) — значит лимит превышен
      // Возвращаем 429 Too Many Requests
      return rateLimitResponse;
    }
    // rateLimitMiddleware вернул null — лимит не превышен, продолжаем
  }

  // ШАГ 3: Пропускаем запрос дальше и добавляем заголовки безопасности
  // NextResponse.next() — говорит Next.js "продолжи обработку запроса как обычно"
  const response = NextResponse.next();

  // X-Content-Type-Options: nosniff
  // Запрещает браузеру "угадывать" тип контента (MIME sniffing).
  // Без этого заголовка браузер может выполнить JS файл загруженный как image/jpeg.
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // X-Frame-Options: DENY
  // Запрещает встраивать сайт в <iframe> на других сайтах.
  // Защищает от Clickjacking атак (когда поверх iframe рисуют прозрачные кнопки).
  response.headers.set('X-Frame-Options', 'DENY');

  // X-XSS-Protection: 1; mode=block
  // Включает встроенную XSS защиту старых браузеров (IE, старый Chrome).
  // mode=block — блокировать страницу при обнаружении XSS (не пытаться исправить).
  // Современные браузеры игнорируют этот заголовок (у них есть CSP).
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer-Policy: strict-origin-when-cross-origin
  // Контролирует что передаётся в заголовке Referer при переходе на другой сайт.
  // strict-origin-when-cross-origin:
  //   - При переходе на тот же домен: передаём полный URL
  //   - При переходе на другой домен: передаём только домен (без пути и параметров)
  //   - При переходе с HTTPS на HTTP: не передаём ничего
  // Защищает от утечки чувствительных данных из URL (токены, ID и т.д.)
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Content-Security-Policy (CSP)
  // Самый мощный заголовок безопасности — белый список разрешённых источников.
  // Браузер блокирует всё что не входит в список.
  response.headers.set(
    'Content-Security-Policy',
    // default-src 'self' — по умолчанию разрешаем только ресурсы с нашего домена
    // script-src 'self' 'unsafe-inline' 'unsafe-eval' — скрипты: свой домен + inline скрипты
    //   'unsafe-inline' нужен для Next.js (он вставляет inline скрипты для гидратации)
    //   'unsafe-eval' нужен для Next.js dev режима
    // style-src 'self' 'unsafe-inline' — стили: свой домен + inline стили (нужны для JSX style={{}})
    // img-src 'self' data: https: — картинки: свой домен + data: URI (SVG заглушки) + любой HTTPS
    // font-src 'self' data: — шрифты: свой домен + data: URI
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
  );

  return response; // возвращаем ответ с добавленными заголовками
}

// Конфигурация: для каких путей запускать middleware
export const config = {
  matcher: [
    // Регулярное выражение: все пути КРОМЕ:
    // _next/static — статические файлы Next.js (JS, CSS бандлы)
    // _next/image — оптимизированные изображения Next.js
    // favicon.ico — иконка сайта
    // Эти пути исключаем для производительности — нет смысла проверять статику
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
