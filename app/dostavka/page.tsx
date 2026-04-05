export default function DostavkaPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '60px auto', padding: '0 20px', fontFamily: 'sans-serif', lineHeight: '1.7' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '24px' }}>Доставка и оплата</h1>

      <h2 style={{ fontSize: '20px', fontWeight: '600', margin: '24px 0 12px' }}>Доставка</h2>
      <ul style={{ paddingLeft: '20px' }}>
        <li>Доставка осуществляется по городу</li>
        <li>Время доставки: от 30 до 90 минут</li>
        <li>Доставка бесплатная</li>
        <li>Режим работы: ежедневно с 10:00 до 23:00</li>
      </ul>

      <h2 style={{ fontSize: '20px', fontWeight: '600', margin: '24px 0 12px' }}>Оплата</h2>
      <ul style={{ paddingLeft: '20px' }}>
        <li>Наличными при получении</li>
        <li>Банковской картой онлайн при оформлении заказа</li>
      </ul>

      <h2 style={{ fontSize: '20px', fontWeight: '600', margin: '24px 0 12px' }}>Контакты</h2>
      <p>Email: rodionovvv72@gmail.com<br />Телефон: +7 (922) 478-77-86</p>
    </div>
  )
}
