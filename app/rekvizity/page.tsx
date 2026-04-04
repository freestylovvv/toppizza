export default function RekvizityPage() {
  return (
    <div style={{ maxWidth: '600px', margin: '60px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '32px' }}>Реквизиты</h1>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '16px' }}>
        <tbody>
          <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
            <td style={{ padding: '14px 0', color: '#6b6b6b', width: '50%' }}>Наименование</td>
            <td style={{ padding: '14px 0', fontWeight: '500' }}>TopPizza</td>
          </tr>
          <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
            <td style={{ padding: '14px 0', color: '#6b6b6b' }}>Статус</td>
            <td style={{ padding: '14px 0', fontWeight: '500' }}>Самозанятый</td>
          </tr>
          <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
            <td style={{ padding: '14px 0', color: '#6b6b6b' }}>ИНН</td>
            <td style={{ padding: '14px 0', fontWeight: '500' }}>722409246217</td>
          </tr>
          <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
            <td style={{ padding: '14px 0', color: '#6b6b6b' }}>Вид деятельности</td>
            <td style={{ padding: '14px 0', fontWeight: '500' }}>Доставка еды</td>
          </tr>
          <tr>
            <td style={{ padding: '14px 0', color: '#6b6b6b' }}>Email</td>
            <td style={{ padding: '14px 0', fontWeight: '500' }}>rodionovvv72@gmail.com</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
