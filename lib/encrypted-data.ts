import { prisma } from './prisma';
import { encrypt, decrypt } from './security';

// ============================================================
// УТИЛИТЫ ДЛЯ РАБОТЫ С ЗАШИФРОВАННЫМИ ДАННЫМИ
//
// Зачем нужен этот файл:
// Личные данные пользователей (email, телефон, адрес, дата рождения)
// хранятся в БД в двух видах:
//   1. Открытый текст — для быстрого поиска и отображения
//   2. Зашифрованный RSA — для защиты при утечке БД
//
// Этот файл содержит функции которые:
// - Читают данные из БД и расшифровывают их
// - Обновляют данные с автоматическим шифрованием
//
// Используется только на сервере (в API маршрутах),
// никогда не отправляется в браузер.
// ============================================================

// ============================================================
// ФУНКЦИЯ getUserWithDecryptedData
// Получает пользователя из БД и возвращает его с расшифрованными данными
//
// Параметры:
//   userId — числовой ID пользователя
//
// Возвращает:
//   объект пользователя с расшифрованными email и birthday
//   или null если пользователь не найден
// ============================================================
export const getUserWithDecryptedData = async (userId: number) => {
  // findUnique — ищет ровно одну запись по уникальному полю (id)
  // Быстрее чем findFirst так как использует индекс первичного ключа
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  // Если пользователь не найден — возвращаем null
  // Вызывающий код должен проверить результат на null
  if (!user) return null;

  return {
    ...user,
    // Оператор spread (...user) копирует все поля объекта user
    // Затем мы переопределяем только те поля которые нужно расшифровать

    // Тернарный оператор: если есть зашифрованный email — расшифровываем его,
    // иначе берём открытый email (для старых записей до введения шифрования)
    email: user.encryptedEmail ? decrypt(user.encryptedEmail) : user.email,

    // Для даты рождения: расшифровываем ISO строку и конвертируем в объект Date
    // new Date('2000-01-15T00:00:00.000Z') → объект Date
    birthday: user.encryptedBirthday ? new Date(decrypt(user.encryptedBirthday)) : user.birthday,
  };
};

// ============================================================
// ФУНКЦИЯ getOrderWithDecryptedData
// Получает один заказ из БД и расшифровывает личные данные покупателя
//
// Параметры:
//   orderId — числовой ID заказа
//
// Возвращает:
//   объект заказа с расшифрованными fullName, email, phone, address
//   или null если заказ не найден
// ============================================================
export const getOrderWithDecryptedData = async (orderId: number) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true }
    // include: { items: true } — подгружаем все позиции заказа (OrderItem)
    // Без include пришлось бы делать отдельный запрос для позиций
  });

  if (!order) return null;

  return {
    ...order, // копируем все поля заказа
    // Для каждого зашифрованного поля: если есть зашифрованная версия — расшифровываем,
    // иначе берём открытую версию (обратная совместимость со старыми заказами)
    fullName: order.encryptedFullName ? decrypt(order.encryptedFullName) : order.fullName,
    email:    order.encryptedEmail    ? decrypt(order.encryptedEmail)    : order.email,
    phone:    order.encryptedPhone    ? decrypt(order.encryptedPhone)    : order.phone,
    address:  order.encryptedAddress  ? decrypt(order.encryptedAddress)  : order.address,
  };
};

// ============================================================
// ФУНКЦИЯ updateUserWithEncryption
// Обновляет данные пользователя, автоматически шифруя чувствительные поля
//
// Параметры:
//   userId — ID пользователя для обновления
//   data — объект с полями для обновления (все необязательные через ?)
//
// Почему поля необязательные (знак ?):
// Пользователь может обновить только имя, только email или только дату рождения.
// Не нужно передавать все поля сразу.
// ============================================================
export const updateUserWithEncryption = async (userId: number, data: {
  name?: string;     // ? означает что поле необязательное (может быть undefined)
  email?: string;
  birthday?: Date;
}) => {
  // Создаём пустой объект для накопления полей которые нужно обновить
  // any — отключаем строгую типизацию для динамического добавления полей
  const updateData: any = {};

  // Добавляем поля в updateData только если они переданы (не undefined)
  if (data.name) updateData.name = data.name;
  // Имя не шифруем — оно не является чувствительными персональными данными

  if (data.email) {
    updateData.email = data.email;                   // сохраняем открытый email для поиска
    updateData.encryptedEmail = encrypt(data.email); // и зашифрованный для защиты
  }

  if (data.birthday) {
    updateData.birthday = data.birthday;
    // toISOString() конвертирует Date в строку формата "2000-01-15T00:00:00.000Z"
    // Шифруем строку (не объект Date — RSA работает только со строками)
    updateData.encryptedBirthday = encrypt(data.birthday.toISOString());
  }

  // Обновляем только переданные поля (Prisma обновляет только то что в data)
  return await prisma.user.update({
    where: { id: userId },
    data: updateData
  });
};

// ============================================================
// ФУНКЦИЯ getOrdersWithDecryptedData
// Получает список заказов с расшифрованными данными
// ТОЛЬКО ДЛЯ АДМИНИСТРАТОРОВ — содержит личные данные всех покупателей
//
// Параметры:
//   limit — максимальное количество заказов (по умолчанию 50)
//
// Возвращает:
//   массив заказов с расшифрованными личными данными
// ============================================================
export const getOrdersWithDecryptedData = async (limit = 50) => {
  // Получаем последние N заказов отсортированных от новых к старым
  const orders = await prisma.order.findMany({
    take: limit,                      // LIMIT в SQL — ограничиваем количество записей
    orderBy: { createdAt: 'desc' },   // ORDER BY createdAt DESC — новые первыми
    include: { items: true }          // JOIN с таблицей OrderItem
  });

  // map() — трансформируем каждый заказ: расшифровываем личные данные
  // Возвращает новый массив, не изменяет исходный
  return orders.map(order => ({
    ...order, // копируем все поля заказа
    // Расшифровываем каждое поле (паттерн тот же что в getOrderWithDecryptedData)
    fullName: order.encryptedFullName ? decrypt(order.encryptedFullName) : order.fullName,
    email:    order.encryptedEmail    ? decrypt(order.encryptedEmail)    : order.email,
    phone:    order.encryptedPhone    ? decrypt(order.encryptedPhone)    : order.phone,
    address:  order.encryptedAddress  ? decrypt(order.encryptedAddress)  : order.address,
  }));
};
