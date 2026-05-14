// ============================================================
// КОНФИГУРАЦИЯ NEXT.JS
//
// Этот файл читается Next.js при запуске и сборке.
// Здесь настраиваются глобальные параметры приложения.
// ============================================================

/** @type {import('next').NextConfig} */
// @type — JSDoc аннотация для TypeScript подсказок в редакторе
// Даёт автодополнение при редактировании этого файла
const nextConfig = {

  // eslint.ignoreDuringBuilds: true — не останавливать сборку из-за ESLint ошибок
  // ESLint — инструмент проверки качества кода (находит потенциальные ошибки)
  // В продакшене сборка не должна падать из-за предупреждений линтера
  eslint: { ignoreDuringBuilds: true },

  // typescript.ignoreBuildErrors: true — не останавливать сборку из-за TypeScript ошибок
  // Позволяет задеплоить код даже если есть TypeScript предупреждения
  // Используется для быстрого деплоя, в идеале должно быть false
  typescript: { ignoreBuildErrors: true },

  // images.domains — список разрешённых доменов для компонента <Image> из Next.js
  // Next.js оптимизирует изображения (сжимает, конвертирует в WebP)
  // только с разрешённых доменов — защита от проксирования чужих картинок
  images: {
    domains: ['localhost', 'images.unsplash.com'],
    // localhost — для разработки на локальной машине
    // images.unsplash.com — сток фотографий (если используются заглушки)
  },
}

module.exports = nextConfig
// module.exports — экспорт в формате CommonJS (не ES modules)
// Next.js читает этот файл через require(), поэтому нужен module.exports, не export default
