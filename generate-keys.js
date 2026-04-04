const crypto = require('crypto');

console.log('Генерация RSA ключей для шифрования...\n');

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

console.log('Добавьте эти строки в ваш .env файл:\n');
console.log('PRIVATE_KEY="' + privateKey.replace(/\n/g, '\\n') + '"');
console.log('PUBLIC_KEY="' + publicKey.replace(/\n/g, '\\n') + '"');
console.log('\nКлючи сгенерированы успешно!');