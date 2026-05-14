import { NextResponse } from 'next/server'
import { join, basename } from 'path'
// join — объединяет части пути: join('/public', 'uploads', 'file.webp') → '/public/uploads/file.webp'
// basename — возвращает только имя файла без директории: basename('../../../etc/passwd') → 'passwd'
import sharp from 'sharp'
// sharp — высокопроизводительная библиотека для обработки изображений
// Конвертирует, изменяет размер, оптимизирует картинки

// ============================================================
// POST /api/upload — загружает изображение товара
//
// Принимает: multipart/form-data с полем "file"
// Возвращает: { success: true, url: "/uploads/filename.webp" }
//
// Что делает с изображением:
// 1. Принимает файл любого формата (jpg, png, webp и т.д.)
// 2. Изменяет размер до 640×480 пикселей
// 3. Конвертирует в WebP (меньше размер, лучше качество)
// 4. Сохраняет в public/uploads/
// ============================================================
export async function POST(request: Request) {
  try {
    // formData() — парсит multipart/form-data (формат для загрузки файлов)
    const formData = await request.formData()

    // get('file') — получаем файл из поля с именем "file"
    // as File — приводим тип (TypeScript не знает что это File)
    const file = formData.get('file') as File

    if (!file) {
      // Файл не передан — возвращаем 400 Bad Request
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    // Читаем содержимое файла как ArrayBuffer (бинарные данные)
    const bytes = await file.arrayBuffer()
    // Конвертируем ArrayBuffer в Node.js Buffer (нужен для sharp)
    const buffer = Buffer.from(bytes)

    // ============================================================
    // ЗАЩИТА ОТ PATH TRAVERSAL АТАКИ
    //
    // Атака: злоумышленник передаёт имя файла "../../etc/passwd"
    // Без защиты: join('/public/uploads', '../../etc/passwd') → '/etc/passwd'
    // Это позволило бы перезаписать системные файлы!
    //
    // basename('../../etc/passwd') → 'passwd' (только имя файла, без пути)
    // Теперь join('/public/uploads', 'passwd') → '/public/uploads/passwd' — безопасно
    // ============================================================
    const safeName = basename(file.name)
      .replace(/\s/g, '-')           // заменяем пробелы на дефисы (пробелы в URL проблема)
      .replace(/\.[^.]+$/, '.webp')  // заменяем расширение на .webp
      // /\.[^.]+$/ — регулярное выражение:
      // \. — буквальная точка
      // [^.]+ — один или более символов кроме точки (само расширение)
      // $ — конец строки
      // Пример: "photo.jpg" → "photo.webp", "image.PNG" → "image.webp"

    // Добавляем timestamp в начало имени для уникальности
    // Date.now() → число миллисекунд с 1970 года (например 1772273584499)
    // Это гарантирует что два файла с одинаковым именем не перезапишут друг друга
    const filename = `${Date.now()}-${safeName}`

    // process.cwd() — текущая рабочая директория (корень проекта)
    // join создаёт абсолютный путь: /home/user/toppizza/public/uploads
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    const filePath = join(uploadDir, filename)

    // Дополнительная проверка: убеждаемся что итоговый путь внутри папки uploads
    // startsWith — проверяет начало строки
    // Если basename не сработал как ожидалось — эта проверка поймает проблему
    if (!filePath.startsWith(uploadDir)) {
      return NextResponse.json({ success: false, error: 'Invalid filename' }, { status: 400 })
    }

    // Обрабатываем изображение через sharp:
    await sharp(buffer)
      .resize(640, 480, {
        fit: 'contain',
        // fit: 'contain' — вписываем изображение в 640×480 сохраняя пропорции
        // (не обрезаем, добавляем прозрачные поля если нужно)
        // Альтернативы: 'cover' (обрезает), 'fill' (растягивает), 'inside', 'outside'
        background: { r: 255, g: 255, b: 255, alpha: 0 }
        // Прозрачный фон для полей (alpha: 0 = полностью прозрачный)
      })
      .webp({ quality: 95, effort: 6 })
      // quality: 95 — высокое качество (0-100, 100 = без потерь)
      // effort: 6 — уровень сжатия (0-6, 6 = максимальное сжатие, медленнее)
      .toFile(filePath) // сохраняем файл на диск

    // Возвращаем URL для доступа к файлу через браузер
    // /uploads/ — Next.js автоматически отдаёт файлы из папки public/
    return NextResponse.json({ success: true, url: `/uploads/${filename}` })
  } catch {
    return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 })
  }
}
