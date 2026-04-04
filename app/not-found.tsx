import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9f9f9' }}>
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <h1 style={{ fontSize: '80px', fontWeight: '700', color: '#ff6900', margin: 0 }}>404</h1>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '12px' }}>Страница не найдена</h2>
        <p style={{ fontSize: '16px', color: '#6b6b6b', marginBottom: '24px' }}>Такой страницы не существует</p>
        <Link href="/" style={{ padding: '12px 24px', backgroundColor: '#ff6900', color: '#fff', borderRadius: '10px', fontSize: '15px', fontWeight: '600', textDecoration: 'none' }}>
          На главную
        </Link>
      </div>
    </div>
  )
}
