import './globals.css'
import type { Metadata, Viewport } from 'next'

import './globals.css'
import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'TopPizza — Доставка пиццы',
  description: 'Быстрая доставка вкусной пиццы. Большой выбор пицц, закусок и напитков. Закажите прямо сейчас!',
  keywords: 'пицца, доставка пиццы, TopPizza, заказать пиццу',
  openGraph: {
    title: 'TopPizza — Доставка пиццы',
    description: 'Быстрая доставка вкусной пиццы',
    type: 'website',
    locale: 'ru_RU',
    siteName: 'TopPizza',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <style>{`
          #page-loader {
            position: fixed; inset: 0; background: #fff; z-index: 99999;
            display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px;
          }
          #page-loader-spinner {
            width: 48px; height: 48px;
            border: 4px solid #f0f0f0; border-top: 4px solid #ff6900;
            border-radius: 50%; animation: spin 0.8s linear infinite;
          }
          #page-loader p { color: #6b6b6b; font-size: 16px; font-family: sans-serif; margin: 0; }
          @keyframes spin { to { transform: rotate(360deg) } }
        `}</style>
        <script dangerouslySetInnerHTML={{ __html: `
          window.addEventListener('DOMContentLoaded', function() {
            var loader = document.getElementById('page-loader');
            if (loader) loader.style.display = 'flex';
          });
          window.addEventListener('load', function() {
            setTimeout(function() {
              var loader = document.getElementById('page-loader');
              if (loader) loader.style.display = 'none';
            }, 300);
          });
        `}} />
      </head>
      <body suppressHydrationWarning>
        <div id="page-loader" style={{ display: 'none' }}>
          <div id="page-loader-spinner" />
          <p>Загрузка...</p>
        </div>
        {children}
      </body>
    </html>
  )
}
