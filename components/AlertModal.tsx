'use client'

type AlertModalProps = {
  message: string
  onClose: () => void
}

export default function AlertModal({ message, onClose }: AlertModalProps) {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={onClose}>
      <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', maxWidth: '400px', width: '100%', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
        <p style={{ fontSize: '16px', color: '#000', marginBottom: '24px', lineHeight: '1.5' }}>{message}</p>
        <button onClick={onClose} style={{ padding: '12px 32px', backgroundColor: '#ff6900', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '600' }}>OK</button>
      </div>
    </div>
  )
}
