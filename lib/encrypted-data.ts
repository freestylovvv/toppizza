import { prisma } from './prisma';
import { encrypt, decrypt } from './security';

// Утилиты для работы с зашифрованными данными пользователей
export const getUserWithDecryptedData = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  
  if (!user) return null;
  
  return {
    ...user,
    email: user.encryptedEmail ? decrypt(user.encryptedEmail) : user.email,
    birthday: user.encryptedBirthday ? new Date(decrypt(user.encryptedBirthday)) : user.birthday,
  };
};

// Утилиты для работы с зашифрованными данными заказов
export const getOrderWithDecryptedData = async (orderId: number) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true }
  });
  
  if (!order) return null;
  
  return {
    ...order,
    fullName: order.encryptedFullName ? decrypt(order.encryptedFullName) : order.fullName,
    email: order.encryptedEmail ? decrypt(order.encryptedEmail) : order.email,
    phone: order.encryptedPhone ? decrypt(order.encryptedPhone) : order.phone,
    address: order.encryptedAddress ? decrypt(order.encryptedAddress) : order.address,
  };
};

// Обновление пользователя с шифрованием
export const updateUserWithEncryption = async (userId: number, data: {
  name?: string;
  email?: string;
  birthday?: Date;
}) => {
  const updateData: any = {};
  
  if (data.name) updateData.name = data.name;
  if (data.email) {
    updateData.email = data.email;
    updateData.encryptedEmail = encrypt(data.email);
  }
  if (data.birthday) {
    updateData.birthday = data.birthday;
    updateData.encryptedBirthday = encrypt(data.birthday.toISOString());
  }
  
  return await prisma.user.update({
    where: { id: userId },
    data: updateData
  });
};

// Поиск заказов с расшифровкой (только для админов)
export const getOrdersWithDecryptedData = async (limit = 50) => {
  const orders = await prisma.order.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: { items: true }
  });
  
  return orders.map(order => ({
    ...order,
    fullName: order.encryptedFullName ? decrypt(order.encryptedFullName) : order.fullName,
    email: order.encryptedEmail ? decrypt(order.encryptedEmail) : order.email,
    phone: order.encryptedPhone ? decrypt(order.encryptedPhone) : order.phone,
    address: order.encryptedAddress ? decrypt(order.encryptedAddress) : order.address,
  }));
};