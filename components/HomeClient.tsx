'use client'

import Header from '@/components/Header'
import ProductCard from '@/components/ProductCard'
import ComboCard from '@/components/ComboCard'
import Cart from '@/components/Cart'
import Footer from '@/components/Footer'
import BannerCarousel from '@/components/BannerCarousel'

type Ingredient = {
  id: number
  name: string
  price: number
  imageUrl: string
  categories: string
}

type SauceProduct = {
  id: number
  name: string
  imageUrl: string
  price: number
}

type Category = {
  id: number
  name: string
  products: any[]
}

type HomeClientProps = {
  categories: Category[]
  banners: any[]
  allIngredients: Ingredient[]
  sauces: SauceProduct[]
  combos: any[]
  allProducts: any[]
}

export default function HomeClient({ categories, banners, allIngredients, sauces, combos, allProducts }: HomeClientProps) {
  return (
    <div style={{ backgroundColor: '#f9f9f9', minHeight: '100vh', paddingTop: '104px', position: 'relative' }}>
      <Header categories={[
        ...(combos.length > 0 ? [{ id: -1, name: 'Комбо', anchor: 'combos' }] : []),
        ...categories,
      ]} />

      {/* Левый декор — большая пицца */}
      <div className="side-deco side-deco-left pizza-deco" aria-hidden>
        <svg width="160" viewBox="0 0 160 1200" fill="none" preserveAspectRatio="xMidYMin meet" style={{width:'160px',height:'100%'}}>
          {/* Большая пицца сверху */}
          <circle cx="80" cy="180" r="65" fill="#f5deb3" stroke="#d2691e" strokeWidth="8" opacity="0.9"/>
          <circle cx="80" cy="180" r="52" fill="#deb887" stroke="#cd853f" strokeWidth="6"/>
          <circle cx="80" cy="180" r="38" fill="#daa520" stroke="#b8860b" strokeWidth="4"/>
          
          {/* Пепперони */}
          <circle cx="50" cy="155" r="9" fill="#c41e3a"/>
          <circle cx="105" cy="155" r="10" fill="#a6172e"/>
          <circle cx="42" cy="195" r="8" fill="#d32f2f"/>
          <circle cx="115" cy="205" r="9" fill="#b71c1c"/>
          <circle cx="65" cy="220" r="11" fill="#c62828"/>
          <circle cx="95" cy="165" r="8" fill="#ad1717"/>
          
          {/* Оливки */}
          <ellipse cx="35" cy="170" rx="5" ry="8" fill="#2e7d32"/>
          <ellipse cx="125" cy="190" rx="6" ry="9" fill="#1b5e20"/>
          <ellipse cx="55" cy="210" rx="4" ry="7" fill="#388e3c"/>
          
          {/* Сырные нити */}
          <path d="M55 145 Q65 130 75 145" stroke="#f4a261" strokeWidth="3" strokeLinecap="round" opacity="0.8"/>
          <path d="M85 150 Q95 135 105 150" stroke="#e76f51" strokeWidth="2.5" strokeLinecap="round" opacity="0.7"/>
          
          {/* Пар от пиццы */}
          <circle cx="80" cy="120" r="12" fill="#fff" opacity="0.6" className="steam"/>
          <circle cx="65" cy="115" r="8" fill="#fff" opacity="0.5" className="steam"/>
          <circle cx="95" cy="125" r="10" fill="#fff" opacity="0.55" className="steam"/>
          
          {/* Открытая коробка пиццы снизу */}
          <rect x="25" y="320" width="110" height="80" rx="12" fill="#8b4513" opacity="0.85"/>
          <rect x="28" y="323" width="104" height="50" rx="8" fill="#d2691e" opacity="0.9"/>
          <rect x="35" y="340" width="90" height="25" rx="6" fill="#a0522d"/>
          
          {/* Клапаны коробки */}
          <path d="M25 320 Q20 340 25 360" fill="#654321" opacity="0.7"/>
          <path d="M135 320 Q140 340 135 360" fill="#654321" opacity="0.7"/>
          
          {/* Ингредиенты на коробке */}
          <circle cx="45" cy="355" r="4" fill="#2e7d32" opacity="0.9"/>
          <circle cx="115" cy="350" r="5" fill="#c41e3a" opacity="0.9"/>
          <ellipse cx="75" cy="345" rx="6" ry="3" fill="#f4a261" opacity="0.8"/>
          
          {/* Логотип TopPizza на коробке */}
          <text x="80" y="368" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#fff" opacity="0.95" className="toppizza-logo">TopPizza</text>
          
          {/* Дополнительные маленькие пиццы */}
          <circle cx="30" cy="450" r="18" fill="#f5deb3" opacity="0.7"/>
          <circle cx="30" cy="450" r="14" fill="#daa520"/>
          <circle cx="130" cy="500" r="22" fill="#deb887" opacity="0.75"/>
          <circle cx="130" cy="500" r="16" fill="#daa520"/>
          
          {/* Оливки и пепперони */}
          <circle cx="25" cy="445" r="3" fill="#2e7d32"/>
          <circle cx="125" cy="495" r="4" fill="#c41e3a"/>
          
          {/* Ещё сырные нити */}
          <path d="M35 430 Q40 415 45 430" stroke="#f4a261" strokeWidth="2" opacity="0.7"/>
          
          {/* Пар от маленьких */}
          <circle cx="30" cy="430" r="6" fill="#fff" opacity="0.4" className="steam"/>
          <circle cx="130" cy="480" r="8" fill="#fff" opacity="0.35" className="steam"/>
          
          {/* Ингредиенты внизу */}
          <circle cx="60" cy="650" r="12" fill="#f5deb3" className="ingredient"/>
          <circle cx="100" cy="680" r="10" fill="#c41e3a" className="ingredient"/>
          <circle cx="40" cy="720" r="8" fill="#2e7d32" className="ingredient"/>
          
          {/* Тени */}
          <ellipse cx="80" cy="250" rx="60" ry="8" fill="#000" opacity="0.1"/>
          <ellipse cx="30" cy="470" rx="16" ry="3" fill="#000" opacity="0.08"/>
          <ellipse cx="130" cy="520" rx="20" ry="4" fill="#000" opacity="0.08"/>
        </svg>
      </div>

      {/* Правый декор — коробка с пиццей и логотипом */}
      <div className="side-deco side-deco-right box-deco" aria-hidden>
        <svg width="160" viewBox="0 0 160 1200" fill="none" preserveAspectRatio="xMidYMin meet" style={{width:'160px',height:'100%'}}>
          {/* Закрытая коробка пиццы с наклейкой TopPizza */}
          <rect x="20" y="150" width="120" height="90" rx="10" fill="#8b4513" stroke="#654321" strokeWidth="4" opacity="0.88"/>
          <rect x="24" y="158" width="112" height="68" rx="8" fill="#d2691e" opacity="0.92"/>
          
          {/* Верхняя наклейка TopPizza */}
          <rect x="55" y="130" width="50" height="25" rx="6" fill="#ff6900" stroke="#e65100" strokeWidth="2"/>
          <text x="80" y="147" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#fff">TOPPIZZA</text>
          <text x="80" y="160" textAnchor="middle" fontSize="10" fill="#fff4e6" opacity="0.9">Горячая!</text>
          
          {/* Наклонённые клапаны */}
          <path d="M20 150 L15 170 Q18 175 25 168" fill="#654321" opacity="0.8"/>
          <path d="M140 150 L145 170 Q142 175 135 168" fill="#654321" opacity="0.8"/>
          
          {/* Пряжка/скотч */}
          <rect x="45" y="192" width="70" height="6" rx="3" fill="#ffd54f" opacity="0.9"/>
          
          {/* Целая пицца внутри (вид сверху) */}
          <circle cx="80" cy="195" r="35" fill="#f4e4bc" stroke="#d4af37" strokeWidth="3" opacity="0.85"/>
          <circle cx="80" cy="195" r="28" fill="#e6c15a" stroke="#b8941f" strokeWidth="2"/>
          <circle cx="80" cy="195" r="20" fill="#f4a261" stroke="#e67a1f" strokeWidth="2"/>
          
          {/* Ингредиенты на пицце */}
          <circle cx="60" cy="180" r="6" fill="#ad1717"/>
          <circle cx="100" cy="185" r="7" fill="#c62828"/>
          <circle cx="70" cy="210" r="5" fill="#2e7d32"/>
          <circle cx="90" cy="215" r="6" fill="#388e3c"/>
          <ellipse cx="75" cy="190" rx="8" ry="4" fill="#f4a261" opacity="0.9"/>
          
          {/* Пар из коробки */}
          <ellipse cx="80" cy="135" rx="15" ry="20" fill="#fff" opacity="0.65" className="steam"/>
          <ellipse cx="65" cy="125" rx="10" ry="15" fill="#fff" opacity="0.55" className="steam"/>
          <ellipse cx="95" cy="140" rx="12" ry="18" fill="#fff" opacity="0.6" className="steam"/>
          
          {/* Дымок доставки */}
          <ellipse cx="140" cy="100" rx="18" ry="25" fill="#f8f9fa" opacity="0.5" className="smoke"/>
          <ellipse cx="155" cy="85" rx="14" ry="20" fill="#f1f3f4" opacity="0.45" className="smoke"/>
          
          {/* Боковая коробка ниже */}
          <rect x="35" y="400" width="90" height="70" rx="12" fill="#8b4513" opacity="0.8" transform="rotate(-5 80 435)"/>
          <rect x="38" y="408" width="84" height="48" rx="8" fill="#a0522d" opacity="0.9" transform="rotate(-5 80 435)"/>
          
          {/* Логотип на боковой */}
          <rect x="60" y="380" width="40" height="18" rx="4" fill="#ff6900" stroke="#e65100" strokeWidth="1.5" transform="rotate(-5 80 435)"/>
          <text x="80" y="393" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#fff" transform="rotate(-5 80 435)">TOP</text>
          <text x="80" y="404" textAnchor="middle" fontSize="9" fill="#fff4e6" opacity="0.95" transform="rotate(-5 80 435)">Pizza</text>
          
          {/* Маленькая пицца */}
          <circle cx="80" cy="435" r="22" fill="#f5deb3" opacity="0.75" transform="rotate(-5 80 435)"/>
          <circle cx="80" cy="435" r="18" fill="#daa520" transform="rotate(-5 80 435)"/>
          
          {/* Падающие ингредиенты */}
          <circle cx="50" cy="300" r="5" fill="#c41e3a" className="falling"/>
          <circle cx="110" cy="320" r="6" fill="#2e7d32" className="falling"/>
          <ellipse cx="75" cy="280" rx="7" ry="4" fill="#f4a261" className="falling"/>
          
          {/* Нижняя коробка */}
          <rect x="25" y="700" width="110" height="85" rx="12" fill="#8b4513" opacity="0.85"/>
          <rect x="28" y="708" width="104" height="60" rx="10" fill="#cd853f" opacity="0.9"/>
          
          {/* Открытая пицца кусок */}
          <path d="M45 780 Q80 760 115 780 Q120 795 105 810 Q80 800 55 810 Z" fill="#f5deb3" stroke="#d2691e" strokeWidth="3"/>
          <path d="M50 785 Q80 775 110 785" fill="#deb887" stroke="#cd853f" strokeWidth="2"/>
          
          {/* Кусочки ингредиентов */}
          <circle cx="60" cy="775" r="4" fill="#ad1717"/>
          <circle cx="100" cy="780" r="5" fill="#388e3c"/>
          
          {/* Логотип снизу */}
          <rect x="50" y="830" width="60" height="20" rx="6" fill="#ff6900"/>
          <text x="80" y="845" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#fff">TopPizza</text>
          
          {/* Тени */}
          <ellipse cx="80" cy="250" rx="55" ry="6" fill="#000" opacity="0.12"/>
          <ellipse cx="80" cy="475" rx="40" ry="5" fill="#000" opacity="0.1"/>
          <ellipse cx="80" cy="790" rx="45" ry="7" fill="#000" opacity="0.1"/>
        </svg>
      </div>

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>

          <BannerCarousel banners={banners} />

          <nav style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '24px',
            overflowX: 'auto',
            padding: '8px 0',
          }}>
            {combos.length > 0 && (
              <a href="#combos" className="summer-nav-link">Комбо</a>
            )}
            {categories.map((category) => (
              <a key={category.id} href={`#${category.name}`} className="summer-nav-link">
                {category.name}
              </a>
            ))}
          </nav>

          {combos.length > 0 && (
            <section id="combos" style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '20px', color: '#000' }}>Комбо</h2>
              <div className="products-grid">
                {combos.map((combo) => (
                  <ComboCard key={combo.id} combo={combo} products={allProducts} allIngredients={allIngredients} />
                ))}
              </div>
            </section>
          )}

          {categories.map((category) => (
            <section key={category.id} id={category.name} style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '20px', color: '#000' }}>{category.name}</h2>
              <div className="products-grid">
                {category.products.map((product) => (
                  <ProductCard key={product.id} product={product} allIngredients={allIngredients} sauces={['pizza','snack','combo'].includes(product.category?.type) ? sauces : []} />
                ))}
              </div>
            </section>
          ))}
        </div>
        <Cart />
      </main>
      <Footer />
    </div>
  )
}