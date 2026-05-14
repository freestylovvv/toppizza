// Импортируем глобальные CSS стили — применяются ко всем страницам
import './globals.css'
// Импортируем типы Next.js для метаданных и viewport
import type { Metadata, Viewport } from 'next'

// ============================================================
// МЕТАДАННЫЕ СТРАНИЦЫ
//
// Metadata — объект с SEO данными страницы.
// Next.js автоматически вставляет их в <head> как <meta> теги.
// Используется поисковиками (Google, Яндекс) и соцсетями (превью при шаринге).
// ============================================================
export const metadata: Metadata = {
  title: 'TopPizza - Доставка пиццы',       // <title> в браузере и в результатах поиска
  description: 'Вкусная пицца с доставкой', // <meta name="description"> — описание для поисковиков
}

// ============================================================
// НАСТРОЙКИ VIEWPORT
//
// Viewport — настройки отображения на мобильных устройствах.
// Без этих настроек мобильный браузер масштабирует страницу
// как будто это десктопный сайт (очень мелко).
// ============================================================
export const viewport: Viewport = {
  width: 'device-width',  // ширина viewport = ширина экрана устройства
  initialScale: 1,        // начальный масштаб = 100% (не уменьшать при загрузке)
  maximumScale: 1,        // запрещаем пользователю увеличивать масштаб (pinch-to-zoom)
  // maximumScale: 1 спорное решение — ухудшает доступность для слабовидящих
}

// ============================================================
// КОРНЕВОЙ LAYOUT
//
// Layout — компонент который оборачивает ВСЕ страницы приложения.
// Рендерится один раз и не перерендеривается при навигации между страницами.
// Идеальное место для: шапки, подвала, глобальных провайдеров.
//
// children — содержимое конкретной страницы (page.tsx)
// React.ReactNode — тип для любого JSX контента
// ============================================================
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // lang="ru" — указываем язык страницы для браузера и скринридеров
    // Помогает браузеру выбрать правильный словарь для проверки орфографии
    <html lang="ru">
      <head>
        {/* SVG иконка сайта (favicon) — отображается во вкладке браузера */}
        {/* type="image/svg+xml" — указываем что это SVG, не PNG */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />

        {/* ============================================================
            СТИЛИ ЛОАДЕРА — встроены прямо в <head>
            
            Почему не в globals.css:
            CSS файлы загружаются асинхронно — лоадер может не появиться
            в нужный момент. Встроенные стили применяются мгновенно.
            
            Лоадер показывается пока страница загружается,
            скрывается когда всё готово.
            ============================================================ */}
        <style>{`
          #page-loader {
            position: fixed;      /* фиксированное позиционирование — поверх всего */
            inset: 0;             /* inset: 0 = top:0, right:0, bottom:0, left:0 (на весь экран) */
            background: #fff;     /* белый фон */
            z-index: 99999;       /* очень высокий z-index — поверх всех элементов */
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
          }
          #page-loader-spinner {
            width: 48px; height: 48px;
            border: 4px solid #f0f0f0;      /* серая граница */
            border-top: 4px solid #ff6900;  /* оранжевая верхняя граница — создаёт эффект вращения */
            border-radius: 50%;             /* круглая форма */
            animation: spin 0.8s linear infinite; /* бесконечное вращение */
          }
          #page-loader p { color: #6b6b6b; font-size: 16px; font-family: sans-serif; margin: 0; }
          @keyframes spin { to { transform: rotate(360deg) } } /* анимация: поворот на 360° */
        `}</style>

        {/* ============================================================
            СКРИПТ УПРАВЛЕНИЯ ЛОАДЕРОМ
            
            dangerouslySetInnerHTML — способ вставить сырой HTML/JS в React.
            Называется "dangerously" потому что может привести к XSS если
            вставлять пользовательские данные. Здесь это безопасно — 
            вставляем только наш собственный код.
            
            __html — обязательное поле объекта для dangerouslySetInnerHTML
            ============================================================ */}
        <script dangerouslySetInnerHTML={{ __html: `
          window.addEventListener('DOMContentLoaded', function() {
            // DOMContentLoaded — HTML разобран, DOM готов (но картинки ещё грузятся)
            // Показываем лоадер как только DOM готов
            var loader = document.getElementById('page-loader');
            if (loader) loader.style.display = 'flex';
          });
          window.addEventListener('load', function() {
            // load — всё загружено: HTML, CSS, JS, картинки
            // Скрываем лоадер через 300мс после полной загрузки
            // 300мс — небольшая задержка чтобы не было резкого исчезновения
            setTimeout(function() {
              var loader = document.getElementById('page-loader');
              if (loader) loader.style.display = 'none';
            }, 300);
          });
        `}} />
      </head>

      {/* suppressHydrationWarning — подавляет предупреждения React о расхождении
          между серверным и клиентским HTML.
          
          Гидратация (hydration) — процесс когда React "оживляет" серверный HTML,
          добавляя обработчики событий и состояние.
          
          Иногда серверный и клиентский HTML немного отличаются (например из-за
          браузерных расширений которые добавляют атрибуты в <body>).
          suppressHydrationWarning говорит React игнорировать эти различия. */}
      <body suppressHydrationWarning>

        {/* Лоадер скрыт по умолчанию (display: 'none')
            JavaScript выше показывает его при DOMContentLoaded
            и скрывает при load.
            
            Почему display: 'none' а не убрать совсем:
            Элемент должен существовать в DOM чтобы JS мог его найти
            через getElementById */}
        <div id="page-loader" style={{ display: 'none' }}>
          <div id="page-loader-spinner" />
          <p>Загрузка...</p>
        </div>

        {/* children — здесь рендерится содержимое текущей страницы
            При переходе на /checkout — рендерится checkout/page.tsx
            При переходе на /profile — рендерится profile/page.tsx
            и т.д. */}
        {children}
      </body>
    </html>
  )
}
