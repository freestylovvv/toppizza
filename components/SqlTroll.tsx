'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'

// Список SQL-инъекций которые блокируем на фронтенде
export const SQL_PATTERNS = [
  'union select',
  'union all select',
  'insert into',
  'drop table',
  'drop database',
  'delete from',
  'truncate table',
  'exec(',
  'execute(',
  'xp_cmdshell',
  'sp_executesql',
  "' or '1'='1",
  "' or 1=1",
  "' and 1=1",
  "'; drop",
  "'; select",
  "'; insert",
  "'; delete",
  "'; update",
  'char(0x',
  'cast(0x',
]

// Проверяет содержит ли строка SQL-инъекцию
export function hasSql(value: string): boolean {
  const v = value.toLowerCase() // приводим к нижнему регистру для сравнения
  return SQL_PATTERNS.some(p => v.includes(p)) // true если найден хотя бы один паттерн
}

// Компонент-"троллинг" для тех кто пытается ввести SQL-инъекцию
// visible — показывать ли экран блокировки
export default function SqlTroll({ visible }: { visible: boolean }) {
  useEffect(() => {
    if (!visible) return
    const block = (e: Event) => { e.stopImmediatePropagation(); e.preventDefault() }
    const blockKey = (e: KeyboardEvent) => { e.stopImmediatePropagation(); e.preventDefault() }
    window.addEventListener('keydown', blockKey, true)
    window.addEventListener('keyup', blockKey, true)
    window.addEventListener('keypress', blockKey, true)
    document.addEventListener('contextmenu', block, true)
    return () => {
      window.removeEventListener('keydown', blockKey, true)
      window.removeEventListener('keyup', blockKey, true)
      window.removeEventListener('keypress', blockKey, true)
      document.removeEventListener('contextmenu', block, true)
    }
  }, [visible])

  if (!visible) return null // если не активен — ничего не рендерим

  // Рендерим поверх всего через портал (zIndex: 999999)
  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 999999,
        backgroundColor: '#000',
        cursor: 'default',
        userSelect: 'none', // запрещаем выделение текста
      }}
      onContextMenu={e => e.preventDefault()} // блокируем правый клик
      onClick={e => e.stopPropagation()}       // блокируем клики
    >
      {/* Картинка МВД на весь экран */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/troll.jpg"
        alt=""
        draggable={false}          // запрещаем перетаскивание
        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block', pointerEvents: 'none', margin: 'auto', position: 'absolute', inset: 0 }}
      />
    </div>,
    document.body // монтируем прямо в body
  )
}
