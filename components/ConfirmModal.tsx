'use client'

type ConfirmModalProps = {
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({ message, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={onCancel}>
      <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', maxWidth: '400px', width: '100%', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
        <p style={{ fontSize: '16px', color: '#000', marginBottom: '24px', lineHeight: '1.5' }}>{message}</p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '12px', backgroundColor: '#f0f0f0', color: '#000', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '600' }}>Отмена</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: '12px', backgroundColor: '#ff6900', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '600' }}>Удалить</button>
        </div>
      </div>
    </div>
  )
}
