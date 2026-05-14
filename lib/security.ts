// Встроенный модуль Node.js для криптографических операций
// Не нужно устанавливать через npm — входит в Node.js
import crypto from 'crypto';

// ============================================================
// RSA ШИФРОВАНИЕ
//
// RSA — асимметричный алгоритм шифрования.
// Используются два ключа:
//   - Публичный ключ (PUBLIC_KEY) — шифрует данные. Можно хранить открыто.
//   - Приватный ключ (PRIVATE_KEY) — расшифровывает данные. Хранится в секрете.
//
// Зачем это нужно: личные данные пользователей (телефон, адрес, email)
// хранятся в БД в зашифрованном виде. Даже если БД взломают —
// без приватного ключа данные не прочитать.
// ============================================================

// Генерирует новую пару RSA ключей (публичный + приватный)
// Вызывается только если ключи не найдены в переменных окружения
const generateKeyPair = () => {
  return crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    // 2048 бит — стандартная длина ключа RSA.
    // Меньше (1024) — небезопасно, больше (4096) — медленнее.
    // 2048 бит = хороший баланс безопасности и скорости.

    publicKeyEncoding: { type: 'spki', format: 'pem' },
    // spki — SubjectPublicKeyInfo, стандартный формат публичного ключа X.509
    // pem — текстовый формат (Base64 с заголовками -----BEGIN PUBLIC KEY-----)

    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    // pkcs8 — стандартный формат приватного ключа
    // pem — текстовый формат (-----BEGIN PRIVATE KEY-----)
  });
};

// Получает ключи из переменных окружения или генерирует новые
// Вызывается один раз при старте приложения
const getKeys = () => {
  if (process.env.PRIVATE_KEY && process.env.PUBLIC_KEY) {
    // Ключи найдены в .env — используем их
    return {
      // В .env переносы строк хранятся как \n (два символа: обратный слеш + n)
      // replace(/\\n/g, '\n') заменяет их на реальные переносы строк
      // Это нужно потому что PEM формат требует реальных переносов строк
      privateKey: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
      publicKey: process.env.PUBLIC_KEY.replace(/\\n/g, '\n')
    };
  }

  // Ключей нет в .env — генерируем новые (только для первого запуска)
  // В продакшене всегда должны быть ключи в .env!
  const keys = generateKeyPair();
  console.warn('Генерируются новые ключи. Добавьте их в .env');
  return keys;
};

// Инициализируем ключи один раз при загрузке модуля
// Деструктуризация: получаем оба ключа из объекта
const { privateKey, publicKey } = getKeys();

// ============================================================
// ФУНКЦИЯ encrypt — шифрует строку публичным ключом RSA
//
// Как работает:
// 1. Конвертируем строку в Buffer (бинарные данные)
// 2. Шифруем публичным ключом через RSA-OAEP
// 3. Возвращаем результат в формате Base64 (текстовое представление бинарных данных)
//
// Пример: encrypt("test@mail.ru") → "aGVsbG8gd29ybGQ..."
// ============================================================
export const encrypt = (text: string): string => {
  const buffer = Buffer.from(text, 'utf8');
  const encrypted = crypto.publicEncrypt(publicKey, buffer);
  return encrypted.toString('base64');
};

export const decrypt = (encryptedText: string): string => {
  const buffer = Buffer.from(encryptedText, 'base64');
  const decrypted = crypto.privateDecrypt(privateKey, buffer);
  return decrypted.toString('utf8');
};

// ============================================================
// Гибридное шифрование AES-256-GCM + RSA для длинных строк
//
// RSA ограничен ~245 байт — не подходит для адресов и комментариев.
// Решение: шифруем данные быстрым AES, а сам AES-ключ — RSA.
// Формат результата: base64(encryptedAesKey):iv:authTag:encryptedData
// ============================================================
export const encryptLong = (text: string): string => {
  const aesKey = crypto.randomBytes(32);          // случайный 256-битный AES ключ
  const iv = crypto.randomBytes(12);              // 96-битный IV для GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', aesKey, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();            // тег аутентификации GCM
  const encryptedKey = crypto.publicEncrypt(publicKey, aesKey); // шифруем AES ключ RSA
  return [
    encryptedKey.toString('base64'),
    iv.toString('base64'),
    authTag.toString('base64'),
    encrypted.toString('base64'),
  ].join(':');
};

export const decryptLong = (encryptedText: string): string => {
  // Обратная совместимость: старые записи зашифрованы чистым RSA (нет двоеточий)
  if (!encryptedText.includes(':')) return decrypt(encryptedText);
  const [encryptedKey, iv, authTag, data] = encryptedText.split(':');
  const aesKey = crypto.privateDecrypt(privateKey, Buffer.from(encryptedKey, 'base64'));
  const decipher = crypto.createDecipheriv('aes-256-gcm', aesKey, Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(authTag, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(data, 'base64')), decipher.final()]).toString('utf8');
};

// ============================================================
// ФУНКЦИЯ hashPassword — хеширует пароль с солью
//
// Используется алгоритм PBKDF2 (Password-Based Key Derivation Function 2)
// Это стандартный безопасный способ хранения паролей.
//
// Зачем соль: если два пользователя имеют одинаковый пароль,
// их хеши будут разными из-за разных солей.
// Это защищает от rainbow table атак.
//
// Возвращает строку формата "соль:хеш"
// ============================================================
export const hashPassword = (password: string): string => {
  const salt = crypto.randomBytes(16).toString('hex');
  // randomBytes(16) — генерирует 16 случайных байт (128 бит)
  // toString('hex') — конвертирует в hex строку (32 символа)

  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  // pbkdf2Sync(пароль, соль, итерации, длина_ключа, алгоритм)
  // 10000 итераций — делает перебор паролей медленным (защита от brute force)
  // 64 байта = 512 бит — длина результирующего хеша
  // sha512 — алгоритм хеширования

  return `${salt}:${hash}`; // сохраняем соль вместе с хешем через двоеточие
};

// ============================================================
// ФУНКЦИЯ verifyPassword — проверяет пароль против сохранённого хеша
//
// ВАЖНО: используем crypto.timingSafeEqual вместо ===
//
// Почему нельзя использовать ===:
// Оператор === прекращает сравнение при первом несовпадении символа.
// Атакующий может измерять время ответа и по нему угадывать символы пароля.
// Это называется "timing attack" (атака по времени).
//
// crypto.timingSafeEqual всегда сравнивает все байты за одинаковое время,
// независимо от того где находится первое несовпадение.
// ============================================================
export const verifyPassword = (password: string, hashedPassword: string): boolean => {
  const [salt, hash] = hashedPassword.split(':'); // разбиваем "соль:хеш" на части
  // Хешируем введённый пароль с той же солью что использовалась при сохранении
  const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  // Сравниваем хеши безопасным способом (защита от timing attack)
  // Buffer.from(hex, 'hex') — конвертируем hex строку в бинарный Buffer для сравнения
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(verifyHash, 'hex'));
};

// ============================================================
// ФУНКЦИЯ sanitizeInput — очищает входные данные от опасных символов
//
// Защищает от SQL-инъекций на уровне приложения (дополнительный слой защиты,
// основная защита — параметризованные запросы Prisma).
//
// Удаляет: одинарные кавычки, двойные кавычки, обратный слеш, точку с запятой
// Эти символы используются в SQL-инъекциях: ' OR '1'='1
// ============================================================
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/['"\\;]/g, '') // регулярное выражение: удаляем ' " \ ;
    .trim()                  // убираем пробелы в начале и конце строки
    .substring(0, 255);      // ограничиваем длину 255 символами (защита от переполнения)
};

// ============================================================
// ФУНКЦИЯ validatePhone — проверяет формат российского телефона
//
// Ожидаемый формат: +7XXXXXXXXXX (12 символов)
// Примеры корректных: +79161234567, +74951234567
// Примеры некорректных: 89161234567, +7916123456 (10 цифр вместо 10)
// ============================================================
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+7\d{10}$/;
  // ^ — начало строки
  // \+ — буквальный символ +
  // 7 — цифра 7
  // \d{10} — ровно 10 цифр
  // $ — конец строки
  return phoneRegex.test(phone);
};

// ============================================================
// ФУНКЦИЯ validateEmail — проверяет формат email адреса
//
// Простая проверка: есть символ @, есть точка после @, нет пробелов
// Не проверяет существование домена — только формат
// ============================================================
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // ^[^\s@]+ — один или более символов кроме пробела и @
  // @ — символ @
  // [^\s@]+ — один или более символов кроме пробела и @
  // \. — буквальная точка
  // [^\s@]+$ — один или более символов кроме пробела и @ до конца строки
  return emailRegex.test(email);
};
