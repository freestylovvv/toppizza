# TopPizza - Сайт пиццерии

Сайт доставки пиццы в стиле Додо Пицца, построенный на Next.js, TypeScript и PostgreSQL.

## Технологии

- **Next.js 14** - React фреймворк
- **TypeScript** - типизация
- **PostgreSQL** - база данных
- **Prisma** - ORM для работы с БД

## Установка и запуск

### 1. Настройка базы данных

Убедитесь, что PostgreSQL установлен и запущен. Создайте базу данных:

```bash
createdb toppizza
```

### 2. Настройка переменных окружения

Отредактируйте файл `.env` и укажите правильные данные для подключения к PostgreSQL:

```
DATABASE_URL="postgresql://user:password@localhost:5432/toppizza?schema=public"
```

### 3. Инициализация базы данных

```bash
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
```

### 4. Запуск проекта

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## Функционал

- ✅ Каталог пицц и закусок
- ✅ Выбор размера пиццы
- ✅ Корзина с возможностью изменения количества
- ✅ Оформление заказа
- ✅ Сохранение заказов в PostgreSQL

## Структура проекта

```
TopPizza/
├── app/                    # Next.js App Router
│   ├── api/               # API маршруты
│   ├── globals.css        # Глобальные стили
│   ├── layout.tsx         # Корневой layout
│   └── page.tsx           # Главная страница
├── components/            # React компоненты
│   ├── Header.tsx
│   ├── ProductCard.tsx
│   └── Cart.tsx
├── lib/                   # Утилиты
│   └── prisma.ts         # Prisma клиент
├── prisma/               # Prisma схема и seed
│   ├── schema.prisma
│   └── seed.js
└── package.json
```

## База данных

Схема включает:
- **Category** - категории товаров
- **Product** - товары (пиццы, закуски)
- **Variant** - варианты товаров (размеры, цены)
- **Order** - заказы
- **OrderItem** - позиции в заказе
