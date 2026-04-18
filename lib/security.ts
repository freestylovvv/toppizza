import crypto from 'crypto';

// Генерация ключей при первом запуске
const generateKeyPair = () => {
  return crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });
};

// Получение ключей из переменных окружения или генерация новых
const getKeys = () => {
  if (process.env.PRIVATE_KEY && process.env.PUBLIC_KEY) {
    return {
      privateKey: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
      publicKey: process.env.PUBLIC_KEY.replace(/\\n/g, '\n')
    };
  }
  
  const keys = generateKeyPair();
  console.warn('Генерируются новые ключи. Добавьте их в .env:');
  console.warn('PRIVATE_KEY="' + keys.privateKey.replace(/\n/g, '\\n') + '"');
  console.warn('PUBLIC_KEY="' + keys.publicKey.replace(/\n/g, '\\n') + '"');
  
  return keys;
};

const { privateKey, publicKey } = getKeys();

// Шифрование данных (AES для поддержки длинных строк)
export const encrypt = (text: string): string => {
  const key = crypto.createHash('sha256').update(process.env.ADMIN_SECRET_KEY || 'default').digest()
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  return iv.toString('hex') + ':' + encrypted.toString('base64')
};

// Расшифровка данных
export const decrypt = (encryptedText: string): string => {
  const [ivHex, data] = encryptedText.split(':')
  if (!ivHex || !data) return encryptedText
  const key = crypto.createHash('sha256').update(process.env.ADMIN_SECRET_KEY || 'default').digest()
  const iv = Buffer.from(ivHex, 'hex')
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
  const decrypted = Buffer.concat([decipher.update(Buffer.from(data, 'base64')), decipher.final()])
  return decrypted.toString('utf8')
};

// Хеширование паролей
export const hashPassword = (password: string): string => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

// Проверка пароля
export const verifyPassword = (password: string, hashedPassword: string): boolean => {
  const [salt, hash] = hashedPassword.split(':');
  const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
};

// Валидация входных данных для защиты от SQL-инъекций
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/['"\\;]/g, '') // Удаляем опасные символы
    .trim()
    .substring(0, 255); // Ограничиваем длину
};

// Валидация телефона
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+7\d{10}$/;
  return phoneRegex.test(phone);
};

// Валидация email
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};