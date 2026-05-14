# TopPizza — Сайт пиццерии

🌐 **https://top-pizza.shop** — задеплоен на VPS рег.ру

Сайт доставки пиццы в стиле Додо Пицца, построенный на Next.js, TypeScript и PostgreSQL.

## Технологии

- **Next.js 14** — React фреймворк (App Router)
- **TypeScript** — типизация
- **PostgreSQL** — база данных
- **Prisma** — ORM
- **Nodemailer** — отправка email
- **Leaflet / React Leaflet** — карта для выбора адреса доставки

## Установка и запуск

### 1. Настройка переменных окружения

Создайте `.env` и заполните:

```
DATABASE_URL="postgresql://user:password@localhost:5432/toppizza?schema=public"
DIRECT_URL="postgresql://user:password@localhost:5432/toppizza?schema=public"
```

> `DIRECT_URL` нужен для Prisma при работе через connection pooler (Neon, Railway и т.п.). На VPS можно указать тот же URL что и `DATABASE_URL`.

### 2. Инициализация базы данных

```bash
npm run prisma:generate   # генерация Prisma клиента
npm run prisma:push       # применение схемы к БД
npm run prisma:seed       # заполнение начальными данными
```

### 3. Запуск

```bash
npm run dev     # разработка (порт 6767)
npm run build   # сборка
npm run start   # продакшн (порт 6767)
```

## Деплой на VPS

Сайт запущен на VPS рег.ру. Приложение слушает на порту `6767` (настроено в `package.json`).

Применение схемы на сервере:

```bash
ssh user@top-pizza.shop
cd /path/to/toppizza
npx prisma db push
```

## Функционал

- ✅ Каталог пицц, закусок, напитков
- ✅ Выбор размера пиццы с динамической ценой
- ✅ Добавки к товарам (платные ингредиенты)
- ✅ Убираемые ингредиенты в карточке товара
- ✅ Комбо-наборы со скидкой
- ✅ Баннерная карусель на главной
- ✅ Корзина с изменением количества
- ✅ Карта для выбора адреса доставки (Leaflet)
- ✅ Авторизация по номеру телефона (SMS-код)
- ✅ Профиль пользователя
- ✅ Оформление заказа с комментарием
- ✅ Сохранение заказов в PostgreSQL
- ✅ Шифрование персональных данных (RSA)
- ✅ Отправка email при заказе
- ✅ Панель администратора
- ✅ Загрузка изображений товаров и баннеров

## Структура проекта

```
toppizza/
├── app/
│   ├── api/
│   │   ├── admin/          # управление товарами, заказами
│   │   ├── avtorizaciya/   # авторизация по телефону
│   │   ├── geokod/         # геокодирование адреса
│   │   ├── ingredienty/    # добавки
│   │   ├── oplata/         # оплата
│   │   ├── polzovatel/     # профиль пользователя
│   │   ├── tovary/         # каталог товаров
│   │   ├── zagruzka/       # загрузка изображений
│   │   ├── zagruzka-bannera/
│   │   └── zakazy/         # заказы
│   ├── admin/              # страница админки
│   ├── dostavka/           # страница доставки
│   ├── oferta/             # публичная оферта
│   ├── oformlenie/         # оформление заказа
│   ├── profil/             # профиль пользователя
│   ├── rekvizity/          # реквизиты
│   └── page.tsx            # главная страница
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── ProductCard.tsx
│   ├── ComboCard.tsx
│   ├── Cart.tsx
│   ├── BannerCarousel.tsx
│   ├── AddressMap.tsx
│   ├── AuthModal.tsx
│   ├── AlertModal.tsx
│   ├── ConfirmModal.tsx
│   ├── HomeClient.tsx
│   └── AdminClient.tsx
├── lib/
│   ├── prisma.ts           # Prisma клиент
│   ├── email.ts            # отправка email
│   ├── sms.ts              # отправка SMS
│   ├── security.ts         # шифрование RSA
│   ├── encrypted-data.ts   # работа с зашифрованными данными
│   └── rate-limit.ts       # защита от спама
├── prisma/
│   ├── schema.prisma
│   └── seed.js
└── public/
    ├── uploads/            # загруженные изображения товаров
    └── leaflet.css
```

## База данных

- **Category** — категории (тип: `pizza`, `snack`, `drink` и т.д.)
- **Product** — товары с ингредиентами (обязательные / убираемые)
- **Variant** — варианты товара (размер + цена)
- **Ingredient** — платные добавки, привязанные к категориям
- **Combo / ComboItem** — комбо-наборы со скидкой
- **Banner** — баннеры для карусели
- **User** — пользователи (авторизация по телефону)
- **VerificationCode** — временные SMS-коды (TTL 10 минут)
- **Order / OrderItem** — заказы с историей цен и названий товаров

Персональные данные (имя, email, телефон, адрес) хранятся как в открытом виде (для отображения), так и в зашифрованном (RSA).
