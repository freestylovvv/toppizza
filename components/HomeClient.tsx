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

      {/* Левый декор — пальма */}
      <div className="side-deco side-deco-left" aria-hidden>
        <svg width="160" viewBox="0 0 160 1200" fill="none" preserveAspectRatio="xMidYMin meet" style={{width:'160px',height:'100%'}}>
          {/* Солнце вверху */}
          <circle cx="120" cy="80" r="28" fill="#FFD600" opacity="0.22"/>
          <circle cx="120" cy="80" r="18" fill="#FFD600" opacity="0.42"/>
          {[0,45,90,135,180,225,270,315].map((deg, i) => (
            <line key={i}
              x1={120 + 21 * Math.cos(deg * Math.PI / 180)}
              y1={80 + 21 * Math.sin(deg * Math.PI / 180)}
              x2={120 + 32 * Math.cos(deg * Math.PI / 180)}
              y2={80 + 32 * Math.sin(deg * Math.PI / 180)}
              stroke="#FFD600" strokeWidth="2.5" strokeLinecap="round" opacity="0.5"
            />
          ))}
          {/* Пальма */}
          <path d="M80 520 C78 450 74 380 72 310 C70 260 75 220 80 195" stroke="#d4a96a" strokeWidth="10" strokeLinecap="round" fill="none"/>
          <path d="M80 195 C60 160 20 140 10 105 C30 112 55 140 80 195" fill="#5cb85c" opacity="0.7"/>
          <path d="M80 195 C100 150 140 135 155 98 C135 108 105 140 80 195" fill="#4cae4c" opacity="0.7"/>
          <path d="M80 195 C65 155 50 115 55 78 C68 100 75 150 80 195" fill="#5cb85c" opacity="0.6"/>
          <path d="M80 195 C95 158 115 120 108 82 C96 105 85 155 80 195" fill="#4cae4c" opacity="0.6"/>
          <path d="M80 195 C75 155 70 112 80 75 C85 100 83 152 80 195" fill="#6abf69" opacity="0.55"/>
          <circle cx="68" cy="204" r="7" fill="#a0522d" opacity="0.8"/>
          <circle cx="82" cy="212" r="6" fill="#8b4513" opacity="0.8"/>
          {/* Цветок 1 */}
          {[0,72,144,216,288].map((deg, i) => (
            <ellipse key={i}
              cx={50 + 8 * Math.cos(deg * Math.PI / 180)}
              cy={420 + 8 * Math.sin(deg * Math.PI / 180)}
              rx="6" ry="3.5"
              transform={`rotate(${deg}, ${50 + 8 * Math.cos(deg * Math.PI / 180)}, ${420 + 8 * Math.sin(deg * Math.PI / 180)})`}
              fill="#ff9a3c" opacity="0.55"
            />
          ))}
          <circle cx="50" cy="420" r="5" fill="#FFD600" opacity="0.7"/>
          <path d="M50 428 C48 455 52 480 50 510" stroke="#6abf69" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.45"/>
          {/* Трава середина */}
          <path d="M25 530 C28 505 34 485 30 465" stroke="#6abf69" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.5"/>
          <path d="M45 530 C47 508 55 490 50 472" stroke="#5cb85c" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.45"/>
          <path d="M12 530 C10 512 14 494 10 478" stroke="#4cae4c" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.4"/>
          {/* Цветок 2 */}
          {[0,72,144,216,288].map((deg, i) => (
            <ellipse key={i}
              cx={30 + 7 * Math.cos(deg * Math.PI / 180)}
              cy={650 + 7 * Math.sin(deg * Math.PI / 180)}
              rx="5" ry="3"
              transform={`rotate(${deg}, ${30 + 7 * Math.cos(deg * Math.PI / 180)}, ${650 + 7 * Math.sin(deg * Math.PI / 180)})`}
              fill="#ff6900" opacity="0.5"
            />
          ))}
          <circle cx="30" cy="650" r="4" fill="#FFD600" opacity="0.65"/>
          <path d="M30 658 C28 685 32 710 30 740" stroke="#6abf69" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.4"/>
          {/* Пузырьки */}
          <circle cx="120" cy="600" r="6" fill="#ff9a3c" opacity="0.18"/>
          <circle cx="140" cy="750" r="9" fill="#FFD600" opacity="0.15"/>
          <circle cx="110" cy="900" r="7" fill="#ff6900" opacity="0.14"/>
          {/* Цветок 3 */}
          {[0,72,144,216,288].map((deg, i) => (
            <ellipse key={i}
              cx={70 + 9 * Math.cos(deg * Math.PI / 180)}
              cy={850 + 9 * Math.sin(deg * Math.PI / 180)}
              rx="7" ry="4"
              transform={`rotate(${deg}, ${70 + 9 * Math.cos(deg * Math.PI / 180)}, ${850 + 9 * Math.sin(deg * Math.PI / 180)})`}
              fill="#ff9a3c" opacity="0.5"
            />
          ))}
          <circle cx="70" cy="850" r="5" fill="#FFD600" opacity="0.7"/>
          <path d="M70 858 C68 885 72 910 70 940" stroke="#6abf69" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.4"/>
          {/* Трава низ */}
          <path d="M20 1000 C24 975 30 955 26 935" stroke="#6abf69" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.5"/>
          <path d="M42 1000 C44 978 52 960 47 942" stroke="#5cb85c" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.45"/>
          <path d="M8 1000 C6 982 10 964 6 948" stroke="#4cae4c" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.4"/>
          {/* Цветок 4 */}
          {[0,72,144,216,288].map((deg, i) => (
            <ellipse key={i}
              cx={100 + 7 * Math.cos(deg * Math.PI / 180)}
              cy={1080 + 7 * Math.sin(deg * Math.PI / 180)}
              rx="5" ry="3"
              transform={`rotate(${deg}, ${100 + 7 * Math.cos(deg * Math.PI / 180)}, ${1080 + 7 * Math.sin(deg * Math.PI / 180)})`}
              fill="#ff9a3c" opacity="0.5"
            />
          ))}
          <circle cx="100" cy="1080" r="4" fill="#FFD600" opacity="0.65"/>
          {/* Звёздочки */}
          {[[40,780,6],[130,480,5],[60,1150,5]].map(([cx,cy,r],i) => (
            <g key={i} transform={`translate(${cx},${cy})`}>
              {[0,72,144,216,288].map((deg,j) => (
                <line key={j} x1="0" y1="0"
                  x2={r * Math.cos((deg-90) * Math.PI/180)}
                  y2={r * Math.sin((deg-90) * Math.PI/180)}
                  stroke="#FFD600" strokeWidth="1.5" strokeLinecap="round" opacity="0.45"
                />
              ))}
            </g>
          ))}
        </svg>
      </div>

      {/* Правый декор — волны и цветы */}
      <div className="side-deco side-deco-right" aria-hidden>
        <svg width="160" viewBox="0 0 160 1200" fill="none" preserveAspectRatio="xMidYMin meet" style={{width:'160px',height:'100%'}}>
          {/* Волны вверху */}
          <path d="M0 90 C30 72 50 108 80 90 C110 72 130 108 160 90" stroke="#ff9a3c" strokeWidth="3" fill="none" opacity="0.35" strokeLinecap="round"/>
          <path d="M0 112 C30 95 50 130 80 112 C110 95 130 130 160 112" stroke="#FFD600" strokeWidth="2" fill="none" opacity="0.3" strokeLinecap="round"/>
          <path d="M0 132 C30 115 50 150 80 132 C110 115 130 150 160 132" stroke="#ff6900" strokeWidth="2" fill="none" opacity="0.25" strokeLinecap="round"/>
          {/* Большой цветок 1 */}
          {[0,72,144,216,288].map((deg, i) => (
            <ellipse key={i}
              cx={110 + 13 * Math.cos(deg * Math.PI / 180)}
              cy={260 + 13 * Math.sin(deg * Math.PI / 180)}
              rx="11" ry="6.5"
              transform={`rotate(${deg}, ${110 + 13 * Math.cos(deg * Math.PI / 180)}, ${260 + 13 * Math.sin(deg * Math.PI / 180)})`}
              fill="#ff9a3c" opacity="0.5"
            />
          ))}
          <circle cx="110" cy="260" r="9" fill="#FFD600" opacity="0.75"/>
          <path d="M110 270 C108 300 112 335 110 370" stroke="#6abf69" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.5"/>
          <path d="M110 305 C92 292 80 278 74 265" stroke="#6abf69" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.45"/>
          <path d="M110 335 C128 320 140 305 146 290" stroke="#5cb85c" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.45"/>
          {/* Волны середина */}
          <path d="M0 480 C30 462 50 498 80 480 C110 462 130 498 160 480" stroke="#ff9a3c" strokeWidth="2.5" fill="none" opacity="0.28" strokeLinecap="round"/>
          <path d="M0 500 C30 483 50 518 80 500 C110 483 130 518 160 500" stroke="#FFD600" strokeWidth="2" fill="none" opacity="0.22" strokeLinecap="round"/>
          {/* Цветок 2 */}
          {[0,72,144,216,288].map((deg, i) => (
            <ellipse key={i}
              cx={50 + 10 * Math.cos(deg * Math.PI / 180)}
              cy={600 + 10 * Math.sin(deg * Math.PI / 180)}
              rx="8" ry="5"
              transform={`rotate(${deg}, ${50 + 10 * Math.cos(deg * Math.PI / 180)}, ${600 + 10 * Math.sin(deg * Math.PI / 180)})`}
              fill="#ff6900" opacity="0.45"
            />
          ))}
          <circle cx="50" cy="600" r="6" fill="#FFD600" opacity="0.7"/>
          <path d="M50 610 C48 640 52 670 50 700" stroke="#6abf69" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.45"/>
          <path d="M50 645 C35 632 25 618 20 605" stroke="#6abf69" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4"/>
          <path d="M50 670 C65 658 75 645 80 632" stroke="#5cb85c" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4"/>
          {/* Пузырьки */}
          <circle cx="30" cy="420" r="6" fill="#ff9a3c" opacity="0.18"/>
          <circle cx="145" cy="550" r="9" fill="#FFD600" opacity="0.16"/>
          <circle cx="20" cy="750" r="7" fill="#ff6900" opacity="0.14"/>
          <circle cx="140" cy="900" r="11" fill="#ff9a3c" opacity="0.14"/>
          {/* Волны нижние */}
          <path d="M0 820 C30 803 50 838 80 820 C110 803 130 838 160 820" stroke="#ff9a3c" strokeWidth="2.5" fill="none" opacity="0.25" strokeLinecap="round"/>
          <path d="M0 840 C30 823 50 858 80 840 C110 823 130 858 160 840" stroke="#FFD600" strokeWidth="2" fill="none" opacity="0.2" strokeLinecap="round"/>
          {/* Цветок 3 */}
          {[0,72,144,216,288].map((deg, i) => (
            <ellipse key={i}
              cx={110 + 11 * Math.cos(deg * Math.PI / 180)}
              cy={960 + 11 * Math.sin(deg * Math.PI / 180)}
              rx="9" ry="5.5"
              transform={`rotate(${deg}, ${110 + 11 * Math.cos(deg * Math.PI / 180)}, ${960 + 11 * Math.sin(deg * Math.PI / 180)})`}
              fill="#ff9a3c" opacity="0.48"
            />
          ))}
          <circle cx="110" cy="960" r="7" fill="#FFD600" opacity="0.72"/>
          <path d="M110 970 C108 1000 112 1030 110 1060" stroke="#6abf69" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.45"/>
          <path d="M110 1005 C94 992 82 978 76 965" stroke="#6abf69" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4"/>
          <path d="M110 1030 C126 1018 138 1005 144 992" stroke="#5cb85c" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4"/>
          {/* Цветок 4 маленький */}
          {[0,72,144,216,288].map((deg, i) => (
            <ellipse key={i}
              cx={40 + 8 * Math.cos(deg * Math.PI / 180)}
              cy={1120 + 8 * Math.sin(deg * Math.PI / 180)}
              rx="6" ry="3.5"
              transform={`rotate(${deg}, ${40 + 8 * Math.cos(deg * Math.PI / 180)}, ${1120 + 8 * Math.sin(deg * Math.PI / 180)})`}
              fill="#ff6900" opacity="0.45"
            />
          ))}
          <circle cx="40" cy="1120" r="5" fill="#FFD600" opacity="0.68"/>
          {/* Звёздочки */}
          {[[35,380,6],[145,700,5],[75,1050,5],[130,1170,4]].map(([cx,cy,r],i) => (
            <g key={i} transform={`translate(${cx},${cy})`}>
              {[0,72,144,216,288].map((deg,j) => (
                <line key={j} x1="0" y1="0"
                  x2={r * Math.cos((deg-90) * Math.PI/180)}
                  y2={r * Math.sin((deg-90) * Math.PI/180)}
                  stroke="#FFD600" strokeWidth="1.5" strokeLinecap="round" opacity="0.45"
                />
              ))}
            </g>
          ))}
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