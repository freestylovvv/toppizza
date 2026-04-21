export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#000', borderTop: '1px solid #1a1a1a', marginTop: '64px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', marginBottom: '32px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#fff' }}>Top Pizza</h3>
            <p style={{ fontSize: '14px', color: '#999', lineHeight: '1.6' }}>Доставка вкусной пиццы и закусок в вашем городе</p>
          </div>
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#fff' }}>О компании</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '8px' }}><a href="#" style={{ fontSize: '14px', color: '#999', textDecoration: 'none' }}>О нас</a></li>
              <li style={{ marginBottom: '8px' }}><a href="#" style={{ fontSize: '14px', color: '#999', textDecoration: 'none' }}>Вакансии</a></li>
              <li style={{ marginBottom: '8px' }}><a href="#" style={{ fontSize: '14px', color: '#999', textDecoration: 'none' }}>Контакты</a></li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#fff' }}>Помощь</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '8px' }}><a href="/dostavka" style={{ fontSize: '14px', color: '#999', textDecoration: 'none' }}>Доставка и оплата</a></li>
              <li style={{ marginBottom: '8px' }}><a href="/oferta" style={{ fontSize: '14px', color: '#999', textDecoration: 'none' }}>Оферта</a></li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#fff' }}>Контакты</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" fill="#999"/>
              </svg>
              <p style={{ fontSize: '14px', color: '#999', margin: 0 }}>+7 (922) 046-94-22</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="#999"/>
              </svg>
              <p style={{ fontSize: '14px', color: '#999', margin: 0 }}>usergeevic289@gmail.com</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="#999"/>
              </svg>
              <p style={{ fontSize: '14px', color: '#999', margin: 0 }}>Ежедневно 9:00 - 23:00</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8l-1.68 7.92c-.12.56-.46.7-.92.44l-2.56-1.88-1.24 1.2c-.14.14-.26.26-.52.26l.18-2.6 4.72-4.26c.2-.18-.04-.28-.32-.1L7.6 14.4l-2.52-.78c-.54-.18-.56-.54.12-.8l9.84-3.8c.46-.16.86.12.6.78z" fill="#999"/>
              </svg>
              <a href="https://t.me/na_g3ro1ne" target="_blank" rel="noopener noreferrer" style={{ fontSize: '14px', color: '#999', textDecoration: 'none' }}>Telegram</a>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: '#999' }}>© 2024 Top Pizza. Все права защищены.</p>
        </div>
      </div>
    </footer>
  )
}
