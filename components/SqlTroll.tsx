'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'

export const SQL_PATTERNS = [
  'select ', 'union ', 'insert ', 'update ', 'delete ', 'drop ',
  'truncate ', 'alter ', 'exec(', 'execute(', 'xp_', 'sp_',
  '--', '/*', '*/', '; ', "' or", "' and", '1=1', '1 =1', '1= 1',
  "' --", "';", 'char(', 'nchar(', 'varchar(', 'cast(', 'convert(',
]

export function hasSql(value: string): boolean {
  const v = value.toLowerCase()
  return SQL_PATTERNS.some(p => v.includes(p))
}

export default function SqlTroll({ visible }: { visible: boolean }) {
  useEffect(() => {
    if (!visible) return
    // Блокируем все попытки закрыть
    const block = (e: Event) => { e.stopImmediatePropagation(); e.preventDefault() }
    const blockKey = (e: KeyboardEvent) => {
      // Блокируем F4, Escape, F5, Ctrl+W, Ctrl+R, Ctrl+F4, Alt+F4, Alt+Tab и т.д.
      e.stopImmediatePropagation()
      e.preventDefault()
    }
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

  if (!visible) return null

  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 999999,
        backgroundColor: '#000',
        cursor: 'default',
        userSelect: 'none',
      }}
      onContextMenu={e => e.preventDefault()}
      onClick={e => e.stopPropagation()}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/mvd.jpg"
        alt=""
        draggable={false}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none' }}
      />
    </div>,
    document.body
  )
}
