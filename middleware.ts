import { NextRequest, NextResponse } from 'next/server';
import { rateLimitMiddleware, checkSuspiciousPatterns } from './lib/rate-limit';

export function middleware(request: NextRequest) {
  // Проверка на подозрительные паттерны (SQL-инъекции, XSS)
  if (checkSuspiciousPatterns(request)) {
    console.warn(`Suspicious request blocked: ${request.url} from ${request.ip}`);
    return NextResponse.json(
      { error: 'Request blocked for security reasons' },
      { status: 403 }
    );
  }
  
  // Применяем rate limiting только к API маршрутам
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const rateLimitResponse = rateLimitMiddleware(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
  }
  
  // Добавляем security headers
  const response = NextResponse.next();
  
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
  );
  
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};