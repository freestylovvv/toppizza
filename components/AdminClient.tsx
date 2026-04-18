'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AlertModal from '@/components/AlertModal'
import ConfirmModal from '@/components/ConfirmModal'

type AdminClientProps = {
  initialUsers: any[]
  initialCodes: any[]
  initialProducts: any[]
  initialCategories: any[]
  initialOrders: any[]
  initialIngredients: any[]
  initialBanners: any[]
}

export default function AdminClient({ initialUsers, initialCodes, initialProducts, initialCategories, initialOrders, initialIngredients, initialBanners }: AdminClientProps) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [tab, setTab] = useState('users')
  const [users, setUsers] = useState<any[]>(initialUsers)
  const [codes, setCodes] = useState<any[]>(initialCodes)
  const [products, setProducts] = useState<any[]>(initialProducts)
  const [categories, setCategories] = useState<any[]>(initialCategories)
  const [orders, setOrders] = useState<any[]>(initialOrders)
  const [ingredients, setIngredients] = useState<any[]>(initialIngredients)
  const [banners, setBanners] = useState<any[]>(initialBanners)
  const [showProductForm, setShowProductForm] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [showIngredientForm, setShowIngredientForm] = useState(false)
  const [showBannerForm, setShowBannerForm] = useState(false)
  const [showComboForm, setShowComboForm] = useState(false)
  const [combos, setCombos] = useState<any[]>([])
  const [editingCombo, setEditingCombo] = useState<any>(null)
  const [comboItems, setComboItems] = useState<{ productId: number; variantId: number; productName: string; variantSize: string; price: number }[]>([])
  const [selectedCategoryType, setSelectedCategoryType] = useState<string>('')
  const [basePrice, setBasePrice] = useState<number>(0)
  const SIZE_SURCHARGES: Record<number, number> = { 0: 0, 1: 100, 2: 200 }
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [editingIngredient, setEditingIngredient] = useState<any>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const [confirmData, setConfirmData] = useState<{ message: string; onConfirm: () => void } | null>(null)
  const [navigating, setNavigating] = useState(false)

  useEffect(() => {
    fetch('/api/admin/combos').then(r => r.text()).then(t => { try { const d = JSON.parse(t); if (d.success) setCombos(d.combos) } catch {} })
  }, [])

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (!savedUser) {
      router.push('/')
      return
    }
    const userData = JSON.parse(savedUser)
    if (!userData.isAdmin) {
      router.push('/')
      return
    }
    setUser(userData)
  }, [router])

  const loadData = async () => {
    const [usersRes, codesRes, productsRes, categoriesRes, ordersRes, ingredientsRes, bannersRes] = await Promise.all([
      fetch('/api/admin/users'),
      fetch('/api/admin/codes'),
      fetch('/api/admin/products'),
      fetch('/api/admin/categories'),
      fetch('/api/admin/orders'),
      fetch('/api/admin/ingredients'),
      fetch('/api/admin/banners'),
    ])
    
    const usersData = await usersRes.json()
    const codesData = await codesRes.json()
    const productsData = await productsRes.json()
    const categoriesData = await categoriesRes.json()
    const ordersData = await ordersRes.json()
    const ingredientsData = await ingredientsRes.json()
    const bannersData = await bannersRes.json()
    
    if (usersData.success) setUsers(usersData.users)
    if (codesData.success) setCodes(codesData.codes)
    if (productsData.success) setProducts(productsData.products)
    if (categoriesData.success) setCategories(categoriesData.categories)
    if (ordersData.success) setOrders(ordersData.orders)
    if (ingredientsData.success) setIngredients(ingredientsData.ingredients)
    if (bannersData.success) setBanners(bannersData.banners)
    const combosRes = await fetch('/api/admin/combos')
    const combosData = await combosRes.json()
    if (combosData.success) setCombos(combosData.combos)
  }

  const toggleAdmin = async (userId: number, isAdmin: boolean) => {
    const res = await fetch('/api/admin/make-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, isAdmin: !isAdmin }),
    })
    if (res.ok) loadData()
  }

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted')
    setUploading(true)
    
    try {
      const formData = new FormData(e.target as HTMLFormElement)
      
      let imageUrl = editingProduct?.imageUrl
      
      console.log('Image file:', imageFile, 'Size:', imageFile?.size)
      
      if (imageFile && imageFile.size > 0) {
        console.log('Uploading image...')
        const uploadFormData = new FormData()
        uploadFormData.append('file', imageFile)
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        })
        
        console.log('Upload response status:', uploadRes.status)
        const uploadData = await uploadRes.json()
        console.log('Upload data:', uploadData)
        
        if (!uploadData.success) {
          setAlertMessage('Ошибка загрузки изображения: ' + (uploadData.error || 'Неизвестная ошибка'))
          setUploading(false)
          return
        }
        imageUrl = uploadData.url
      } else if (!editingProduct) {
        setAlertMessage('Пожалуйста, выберите изображение')
        setUploading(false)
        return
      }
      
      const bp = parseInt(formData.get('basePrice') as string) || 0
      const variants = [
        { size: formData.get('size1'), price: bp + SIZE_SURCHARGES[0] },
        { size: formData.get('size2'), price: bp + SIZE_SURCHARGES[1] },
        { size: formData.get('size3'), price: bp + SIZE_SURCHARGES[2] },
      ].filter(v => v.size)

      const data = {
        id: editingProduct?.id,
        name: formData.get('name'),
        imageUrl,
        categoryId: formData.get('categoryId'),
        ingredients: formData.get('ingredients'),
        requiredIngredients: formData.get('requiredIngredients'),
        removableIngredients: formData.get('removableIngredients'),
        variants,
      }
      
      console.log('Saving product:', data)

      const res = await fetch('/api/admin/products', {
        method: editingProduct ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      console.log('Save response status:', res.status)

      if (res.ok) {
        console.log('Product saved successfully')
        await loadData()
        setShowProductForm(false)
        setEditingProduct(null)
        setImagePreview(null)
        setImageFile(null)
      } else {
        const errorData = await res.json()
        console.error('Save error:', errorData)
        setAlertMessage('Ошибка сохранения товара')
      }
    } catch (error) {
      console.error('Error:', error)
      setAlertMessage('Ошибка: ' + String(error))
    } finally {
      setUploading(false)
    }
  }

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)

    const res = await fetch('/api/admin/categories', {
      method: editingCategory ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: editingCategory?.id,
        name: formData.get('name'),
        type: formData.get('type'),
      }),
    })

    if (res.ok) {
      loadData()
      setShowCategoryForm(false)
      setEditingCategory(null)
      setSelectedCategoryType('')
    }
  }

  const handleProductAsComboSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (comboItems.length === 0) { setAlertMessage('Добавьте хотя бы один товар'); return }
    setUploading(true)
    try {
      const formData = new FormData(e.target as HTMLFormElement)
      let imageUrl = editingProduct?.imageUrl || ''
      if (imageFile && imageFile.size > 0) {
        const fd = new FormData(); fd.append('file', imageFile)
        const r = await fetch('/api/upload', { method: 'POST', body: fd })
        const d = await r.json()
        if (!d.success) { setAlertMessage('Ошибка загрузки изображения'); setUploading(false); return }
        imageUrl = d.url
      } else if (!editingProduct) {
        setAlertMessage('Выберите изображение'); setUploading(false); return
      }
      const res = await fetch('/api/admin/combos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          imageUrl,
          discount: parseInt(formData.get('discount') as string) || 0,
          items: comboItems.map(i => ({ productId: i.productId, variantId: i.variantId })),
        }),
      })
      if (res.ok) {
        await loadData()
        setShowProductForm(false)
        setEditingProduct(null)
        setImagePreview(null)
        setImageFile(null)
        setComboItems([])
        setSelectedCategoryType('')
      }
    } catch (error) {
      setAlertMessage('Ошибка: ' + String(error))
    } finally { setUploading(false) }
  }

  const deleteProduct = async (id: number) => {
    setConfirmData({
      message: 'Удалить товар?',
      onConfirm: async () => {
        const res = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' })
        if (res.ok) loadData()
        setConfirmData(null)
      }
    })
  }

  const deleteCategory = async (id: number) => {
    setConfirmData({
      message: 'Удалить категорию?',
      onConfirm: async () => {
        const res = await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' })
        if (res.ok) loadData()
        setConfirmData(null)
      }
    })
  }

  const updateOrderStatus = async (orderId: number, status: string) => {
    const res = await fetch('/api/admin/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _method: 'PUT', orderId, status }),
    })
    if (res.ok) loadData()
  }

  const handleIngredientSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)
    
    try {
      const formData = new FormData(e.target as HTMLFormElement)
      let imageUrl = editingIngredient?.imageUrl
      
      if (imageFile && imageFile.size > 0) {
        const uploadFormData = new FormData()
        uploadFormData.append('file', imageFile)
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: uploadFormData })
        const uploadData = await uploadRes.json()
        if (!uploadData.success) {
          setAlertMessage('Ошибка загрузки изображения')
          setUploading(false)
          return
        }
        imageUrl = uploadData.url
      } else if (!editingIngredient) {
        setAlertMessage('Пожалуйста, выберите изображение')
        setUploading(false)
        return
      }

      const selectedCategories = Array.from(formData.getAll('categories')).join(',')

      const res = await fetch('/api/admin/ingredients', {
        method: editingIngredient ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingIngredient?.id,
          name: formData.get('name'),
          price: parseInt(formData.get('price') as string),
          imageUrl,
          categories: selectedCategories,
        }),
      })

      if (res.ok) {
        await loadData()
        setShowIngredientForm(false)
        setEditingIngredient(null)
        setImagePreview(null)
        setImageFile(null)
      }
    } catch (error) {
      setAlertMessage('Ошибка: ' + String(error))
    } finally {
      setUploading(false)
    }
  }

  const deleteIngredient = async (id: number) => {
    setConfirmData({
      message: 'Удалить ингредиент?',
      onConfirm: async () => {
        const res = await fetch(`/api/admin/ingredients?id=${id}`, { method: 'DELETE' })
        if (res.ok) loadData()
        setConfirmData(null)
      }
    })
  }

  const deleteBanner = async (id: number) => {
    setConfirmData({
      message: 'Удалить баннер?',
      onConfirm: async () => {
        const res = await fetch(`/api/admin/banners?id=${id}`, { method: 'DELETE' })
        if (res.ok) loadData()
        setConfirmData(null)
      }
    })
  }

  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (banners.length >= 10) {
      setAlertMessage('Максимум 10 баннеров')
      return
    }
    setUploading(true)
    try {
      if (!imageFile) {
        setAlertMessage('Пожалуйста, выберите изображение')
        setUploading(false)
        return
      }
      const uploadFormData = new FormData()
      uploadFormData.append('file', imageFile)
      const uploadRes = await fetch('/api/upload-banner', { method: 'POST', body: uploadFormData })
      const uploadData = await uploadRes.json()
      if (!uploadData.success) {
        setAlertMessage('Ошибка загрузки изображения')
        setUploading(false)
        return
      }
      const res = await fetch('/api/admin/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: uploadData.url, title: '', subtitle: '' }),
      })
      if (res.ok) {
        await loadData()
        setShowBannerForm(false)
        setImagePreview(null)
        setImageFile(null)
      }
    } catch (error) {
      setAlertMessage('Ошибка: ' + String(error))
    } finally {
      setUploading(false)
    }
  }

  if (!user) return null

  return (
    <div className="admin-root" style={{ backgroundColor: '#f9f9f9', minHeight: '100vh', padding: '32px' }}>
      {navigating && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(255,255,255,0.9)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', border: '4px solid #f0f0f0', borderTop: '4px solid #ff6900', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: '#6b6b6b', fontSize: '16px' }}>Загрузка...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      )}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: '700', color: '#000' }}>Админ панель</h1>
          <button onClick={() => { setNavigating(true); router.push('/') }} style={{ padding: '12px 24px', backgroundColor: '#ff6900', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '500' }}>На сайт</button>
        </div>

        <div className="admin-tabs" style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {['users', 'codes', 'products', 'categories', 'orders', 'ingredients', 'banners', 'combos'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '12px 24px', backgroundColor: tab === t ? '#ff6900' : '#fff', color: tab === t ? '#fff' : '#000', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '500' }}>
              {t === 'users' ? 'Пользователи' : t === 'codes' ? 'Коды' : t === 'products' ? 'Товары' : t === 'categories' ? 'Категории' : t === 'orders' ? 'Заказы' : t === 'ingredients' ? 'Ингредиенты' : t === 'banners' ? 'Баннеры' : 'Комбо'}
            </button>
          ))}
        </div>

        {tab === 'users' && (
          <div className="admin-section" style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: '#000' }}>Пользователи</h2>
            <div className="admin-table-wrap"><table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#6b6b6b' }}>ID</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#6b6b6b' }}>Имя</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#6b6b6b' }}>Email</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#6b6b6b' }}>Телефон</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#6b6b6b' }}>Заказов</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#6b6b6b' }}>Админ</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '12px', fontSize: '14px' }}>{u.id}</td>
                    <td style={{ padding: '12px', fontSize: '14px' }}>{u.name}</td>
                    <td style={{ padding: '12px', fontSize: '14px' }}>{u.email}</td>
                    <td style={{ padding: '12px', fontSize: '14px' }}>{u.phone || '-'}</td>
                    <td style={{ padding: '12px', fontSize: '14px' }}>{u.orders.length}</td>
                    <td style={{ padding: '12px' }}>
                      <button onClick={() => toggleAdmin(u.id, u.isAdmin)} style={{ padding: '6px 12px', backgroundColor: u.isAdmin ? '#ff6900' : '#f0f0f0', color: u.isAdmin ? '#fff' : '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
                        {u.isAdmin ? 'Админ' : 'Сделать админом'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          </div>
        )}

        {tab === 'codes' && (
          <div className="admin-section" style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: '#000' }}>Коды подтверждения</h2>
            <div className="admin-table-wrap"><table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#6b6b6b' }}>Телефон</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#6b6b6b' }}>Код</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#6b6b6b' }}>Истекает</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#6b6b6b' }}>Создан</th>
                </tr>
              </thead>
              <tbody>
                {codes.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '12px', fontSize: '14px' }}>{c.phone}</td>
                    <td style={{ padding: '12px', fontSize: '18px', fontWeight: '700', color: '#ff6900' }}>{c.code}</td>
                    <td style={{ padding: '12px', fontSize: '14px' }}>{new Date(c.expiresAt).toLocaleString('ru-RU')}</td>
                    <td style={{ padding: '12px', fontSize: '14px' }}>{new Date(c.createdAt).toLocaleString('ru-RU')}</td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          </div>
        )}

        {tab === 'products' && (
          <div className="admin-section" style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px' }}>
            <div className="admin-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#000' }}>Товары</h2>
              <button onClick={() => { setShowProductForm(true); setEditingProduct(null); setImagePreview(null); setImageFile(null); setComboItems([]); setSelectedCategoryType(''); }} style={{ padding: '12px 24px', backgroundColor: '#ff6900', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '500' }}>Добавить товар</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
              {products.map(p => (
                <div key={p.id} style={{ border: '1px solid #f0f0f0', borderRadius: '12px', padding: '16px' }}>
                  <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px' }} />
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>{p.name}</h3>
                  <p style={{ fontSize: '14px', color: '#6b6b6b', marginBottom: '8px' }}>{p.category.name}</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => { setEditingProduct(p); setShowProductForm(true); setImagePreview(p.imageUrl); setImageFile(null); setComboItems([]); setSelectedCategoryType(p.category?.type || ''); }} style={{ flex: 1, padding: '8px', backgroundColor: '#f0f0f0', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Изменить</button>
                    <button onClick={() => deleteProduct(p.id)} style={{ flex: 1, padding: '8px', backgroundColor: '#ff6900', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Удалить</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'categories' && (
          <div className="admin-section" style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px' }}>
            <div className="admin-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#000' }}>Категории</h2>
              <button onClick={() => { setShowCategoryForm(true); setEditingCategory(null); }} style={{ padding: '12px 24px', backgroundColor: '#ff6900', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '500' }}>Добавить категорию</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {categories.map(c => (
                <div key={c.id} style={{ border: '1px solid #f0f0f0', borderRadius: '12px', padding: '16px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>{c.name}</h3>
                  <p style={{ fontSize: '14px', color: '#6b6b6b', marginBottom: '12px' }}>Товаров: {c.products.length}</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => { setEditingCategory(c); setShowCategoryForm(true); }} style={{ flex: 1, padding: '8px', backgroundColor: '#f0f0f0', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Изменить</button>
                    <button onClick={() => deleteCategory(c.id)} style={{ flex: 1, padding: '8px', backgroundColor: '#ff6900', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Удалить</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'orders' && (
          <div className="admin-section" style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: '#000' }}>Заказы</h2>
            <div className="admin-table-wrap"><table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#6b6b6b' }}>ID</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#6b6b6b' }}>Имя</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#6b6b6b' }}>Телефон</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#6b6b6b' }}>Адрес</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#6b6b6b' }}>Комментарий</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#6b6b6b' }}>Сумма</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#6b6b6b' }}>Дата</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#6b6b6b' }}>Статус</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '12px', fontSize: '14px' }}>{o.id}</td>
                    <td style={{ padding: '12px', fontSize: '14px' }}>{o.fullName}</td>
                    <td style={{ padding: '12px', fontSize: '14px' }}>{o.phone}</td>
                    <td style={{ padding: '12px', fontSize: '14px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.address}</td>
                    <td style={{ padding: '12px', fontSize: '14px', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.comment || '-'}</td>
                    <td style={{ padding: '12px', fontSize: '14px', fontWeight: '600' }}>{o.totalPrice} ₽</td>
                    <td style={{ padding: '12px', fontSize: '14px' }}>{new Date(o.createdAt).toLocaleString('ru-RU')}</td>
                    <td style={{ padding: '12px' }}>
                      <select
                        value={o.status}
                        onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                        style={{
                          padding: '6px 12px',
                          border: '1px solid #e0e0e0',
                          borderRadius: '6px',
                          fontSize: '13px',
                          backgroundColor: o.status === 'pending' ? '#fff3cd' : o.status === 'confirmed' ? '#cfe2ff' : o.status === 'cooking' ? '#fff8e1' : o.status === 'delivering' ? '#d1e7dd' : o.status === 'delivered' ? '#d4edda' : '#f8d7da',
                          cursor: 'pointer',
                          outline: 'none',
                        }}
                      >
                        <option value="pending">Ожидает подтверждения</option>
                        <option value="confirmed">Подтверждён</option>
                        <option value="cooking">Готовится</option>
                        <option value="delivering">В пути</option>
                        <option value="delivered">Доставлен</option>
                        <option value="cancelled">Отменён</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          </div>
        )}

        {tab === 'ingredients' && (
          <div className="admin-section" style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px' }}>
            <div className="admin-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#000' }}>Ингредиенты</h2>
              <button onClick={() => { setShowIngredientForm(true); setEditingIngredient(null); setImagePreview(null); setImageFile(null); }} style={{ padding: '12px 24px', backgroundColor: '#ff6900', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '500' }}>Добавить ингредиент</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {ingredients.map(ing => (
                <div key={ing.id} style={{ border: '1px solid #f0f0f0', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                  <img src={ing.imageUrl} alt={ing.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px' }} />
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>{ing.name}</h3>
                  <p style={{ fontSize: '14px', color: '#ff6900', fontWeight: '600', marginBottom: '12px' }}>{ing.price} ₽</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => { setEditingIngredient(ing); setShowIngredientForm(true); setImagePreview(ing.imageUrl); setImageFile(null); }} style={{ flex: 1, padding: '8px', backgroundColor: '#f0f0f0', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Изменить</button>
                    <button onClick={() => deleteIngredient(ing.id)} style={{ flex: 1, padding: '8px', backgroundColor: '#ff6900', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Удалить</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'combos' && (
          <div className="admin-section" style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px' }}>
            <div className="admin-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#000' }}>Комбо-наборы</h2>
              <button onClick={() => { setShowComboForm(true); setEditingCombo(null); setComboItems([]); setImagePreview(null); setImageFile(null); }} style={{ padding: '12px 24px', backgroundColor: '#ff6900', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '500' }}>Добавить комбо</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {combos.map(combo => {
                const totalPrice = combo.items.reduce((sum: number, item: any) => {
                  const product = products.find((p: any) => p.id === item.productId)
                  const variant = product?.variants.find((v: any) => v.id === item.variantId)
                  return sum + (variant?.price || 0)
                }, 0)
                const finalPrice = totalPrice - combo.discount
                return (
                  <div key={combo.id} style={{ border: '1px solid #f0f0f0', borderRadius: '12px', padding: '16px' }}>
                    <img src={combo.imageUrl} alt={combo.name} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px' }} />
                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>{combo.name}</h3>
                    <p style={{ fontSize: '14px', color: '#6b6b6b', marginBottom: '4px' }}>{combo.items.length} товаров</p>
                    {combo.discount > 0 && <p style={{ fontSize: '14px', color: '#ff6900', fontWeight: '600', marginBottom: '4px' }}>Скидка: {combo.discount} ₽</p>}
                    <p style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>{finalPrice} ₽</p>
                    <div style={{ fontSize: '13px', color: '#6b6b6b', marginBottom: '12px' }}>
                      {combo.items.map((item: any) => {
                        const product = products.find((p: any) => p.id === item.productId)
                        const variant = product?.variants.find((v: any) => v.id === item.variantId)
                        return <div key={item.id}>• {product?.name} ({variant?.size})</div>
                      })}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => {
                        const items = combo.items.map((item: any) => {
                          const product = products.find((p: any) => p.id === item.productId)
                          const variant = product?.variants.find((v: any) => v.id === item.variantId)
                          return { productId: item.productId, variantId: item.variantId, productName: product?.name || '', variantSize: variant?.size || '', price: variant?.price || 0 }
                        })
                        setEditingCombo(combo)
                        setComboItems(items)
                        setImagePreview(combo.imageUrl)
                        setImageFile(null)
                        setShowComboForm(true)
                      }} style={{ flex: 1, padding: '8px', backgroundColor: '#f0f0f0', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Изменить</button>
                      <button onClick={() => setConfirmData({ message: 'Удалить комбо?', onConfirm: async () => { await fetch(`/api/admin/combos?id=${combo.id}`, { method: 'DELETE' }); loadData(); setConfirmData(null); } })} style={{ flex: 1, padding: '8px', backgroundColor: '#ff6900', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Удалить</button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {tab === 'banners' && (
          <div className="admin-section" style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px' }}>
            <div className="admin-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#000' }}>Баннеры ({banners.length}/10)</h2>
              <button onClick={() => { if (banners.length < 10) { setShowBannerForm(true); setImagePreview(null); setImageFile(null); } else { setAlertMessage('Максимум 10 баннеров'); } }} style={{ padding: '12px 24px', backgroundColor: banners.length < 10 ? '#ff6900' : '#ccc', color: '#fff', border: 'none', borderRadius: '8px', cursor: banners.length < 10 ? 'pointer' : 'not-allowed', fontSize: '15px', fontWeight: '500' }}>Добавить баннер</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {banners.map(b => (
                <div key={b.id} style={{ border: '1px solid #f0f0f0', borderRadius: '12px', padding: '16px' }}>
                  <img src={b.imageUrl} alt="Banner" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px' }} />
                  <button onClick={() => deleteBanner(b.id)} style={{ width: '100%', padding: '8px', backgroundColor: '#ff6900', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Удалить</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {showComboForm && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '32px', maxWidth: '560px', width: '90%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
              <button onClick={() => { setShowComboForm(false); setEditingCombo(null); setComboItems([]); setImagePreview(null); setImageFile(null); }} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6b6b6b' }}>×</button>
              <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>{editingCombo ? 'Изменить комбо' : 'Добавить комбо'}</h2>
              <form onSubmit={async (e) => {
                e.preventDefault()
                if (comboItems.length === 0) { setAlertMessage('Добавьте хотя бы один товар'); return }
                setUploading(true)
                try {
                  const formData = new FormData(e.target as HTMLFormElement)
                  let imageUrl = editingCombo?.imageUrl || ''
                  if (imageFile && imageFile.size > 0) {
                    const fd = new FormData(); fd.append('file', imageFile)
                    const r = await fetch('/api/upload', { method: 'POST', body: fd })
                    const d = await r.json()
                    if (!d.success) { setAlertMessage('Ошибка загрузки изображения'); setUploading(false); return }
                    imageUrl = d.url
                  } else if (!editingCombo) { setAlertMessage('Выберите изображение'); setUploading(false); return }
                  const res = await fetch('/api/admin/combos', {
                    method: editingCombo ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: editingCombo?.id, name: formData.get('name'), imageUrl, discount: parseInt(formData.get('discount') as string) || 0, items: comboItems.map(i => ({ productId: i.productId, variantId: i.variantId })) }),
                  })
                  if (res.ok) { await loadData(); setShowComboForm(false); setEditingCombo(null); setComboItems([]); setImagePreview(null); setImageFile(null); }
                } finally { setUploading(false) }
              }}>
                <input name="name" placeholder="Название комбо" defaultValue={editingCombo?.name || ''} required style={{ width: '100%', padding: '12px', marginBottom: '12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '15px', outline: 'none' }} />
                <input name="discount" type="number" placeholder="Скидка (₽)" defaultValue={editingCombo?.discount ?? 0} style={{ width: '100%', padding: '12px', marginBottom: '12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '15px', outline: 'none' }} />
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', color: '#6b6b6b', marginBottom: '8px' }}>Изображение</label>
                  {imagePreview ? (
                    <div style={{ position: 'relative' }}>
                      <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e0e0e0' }} />
                      <button type="button" onClick={() => { setImagePreview(null); setImageFile(null); }} style={{ position: 'absolute', top: '8px', right: '8px', padding: '6px 12px', backgroundColor: '#ff6900', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Удалить</button>
                    </div>
                  ) : (
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '24px', border: '2px dashed #e0e0e0', borderRadius: '8px', cursor: 'pointer', backgroundColor: '#f9f9f9' }}>
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) { setImageFile(f); const r = new FileReader(); r.onloadend = () => setImagePreview(r.result as string); r.readAsDataURL(f); } }} />
                      <span style={{ fontSize: '15px', color: '#6b6b6b' }}>Нажмите для выбора файла</span>
                    </label>
                  )}
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', color: '#6b6b6b', marginBottom: '8px' }}>Товары в комбо</label>
                  {comboItems.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#f9f9f9', borderRadius: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '14px' }}>{item.productName}</span>
                      <button type="button" onClick={() => setComboItems(prev => prev.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', color: '#ff6900', cursor: 'pointer', fontSize: '18px', lineHeight: 1 }}>×</button>
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <select id="combo-product-select" style={{ flex: 1, padding: '10px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', outline: 'none' }}>
                      <option value="">Выберите товар</option>
                      {products.filter((p: any) => p.category?.type !== 'combo').map((p: any) => <option key={p.id} value={p.id}>{p.name} ({p.category.name})</option>)}
                    </select>
                    <button type="button" onClick={() => {
                      const ps = document.getElementById('combo-product-select') as HTMLSelectElement
                      if (!ps.value) return
                      const product = products.find((p: any) => p.id === parseInt(ps.value))
                      if (product) {
                        const defaultVariant = product.variants.length > 1 ? product.variants[1] : product.variants[0]
                        setComboItems(prev => [...prev, { productId: product.id, variantId: defaultVariant?.id, productName: product.name, variantSize: defaultVariant?.size || '', price: defaultVariant?.price || 0 }])
                        ps.value = ''
                      }
                    }} style={{ padding: '10px 16px', backgroundColor: '#ff6900', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', whiteSpace: 'nowrap' }}>+ Добавить</button>
                  </div>
                </div>
                <button type="submit" disabled={uploading} style={{ width: '100%', padding: '16px', backgroundColor: uploading ? '#ccc' : '#ff6900', color: '#fff', border: 'none', borderRadius: '8px', cursor: uploading ? 'not-allowed' : 'pointer', fontSize: '16px', fontWeight: '600' }}>{uploading ? 'Сохранение...' : 'Сохранить комбо'}</button>
              </form>
            </div>
          </div>
        )}

        {showProductForm && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '32px', maxWidth: '500px', width: '90%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
              <button onClick={() => { setShowProductForm(false); setImagePreview(null); setImageFile(null); setComboItems([]); setSelectedCategoryType(''); }} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6b6b6b' }}>×</button>
              <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>{editingProduct ? 'Изменить' : 'Добавить товар'}</h2>
              <form onSubmit={selectedCategoryType === 'combo' ? handleProductAsComboSubmit : handleProductSubmit}>
                <input name="name" placeholder="Название" defaultValue={editingProduct?.name} required style={{ width: '100%', padding: '12px', marginBottom: '12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '15px', outline: 'none' }} />
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '14px', color: '#6b6b6b', marginBottom: '8px' }}>Изображение</label>
                  {imagePreview ? (
                    <div style={{ position: 'relative', width: '100%', marginBottom: '12px' }}>
                      <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '200px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #e0e0e0' }} />
                      <button type="button" onClick={() => { setImagePreview(null); setImageFile(null); }} style={{ position: 'absolute', top: '8px', right: '8px', padding: '8px 12px', backgroundColor: '#ff6900', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>Удалить</button>
                    </div>
                  ) : (
                    <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '24px', border: '2px dashed #e0e0e0', borderRadius: '8px', cursor: 'pointer', backgroundColor: '#f9f9f9', transition: 'all 0.2s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#ff6900'; e.currentTarget.style.backgroundColor = '#fff5e1' }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e0e0e0'; e.currentTarget.style.backgroundColor = '#f9f9f9' }}
                    >
                      <input name="imageFile" type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) { setImageFile(file); const reader = new FileReader(); reader.onloadend = () => setImagePreview(reader.result as string); reader.readAsDataURL(file) }
                      }} />
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ marginBottom: '8px' }}><path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="#6b6b6b"/></svg>
                      <span style={{ fontSize: '15px', color: '#6b6b6b' }}>Нажмите для выбора файла</span>
                    </label>
                  )}
                </div>
                <select name="categoryId" defaultValue={editingProduct?.categoryId || ''} required
                  onChange={(e) => {
                    const cat = categories.find(c => c.id === parseInt(e.target.value))
                    setSelectedCategoryType(cat?.type || '')
                    setComboItems([])
                  }}
                  style={{ width: '100%', padding: '12px', marginBottom: '12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '15px', outline: 'none' }}>
                  <option value="">Выберите категорию</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>

                {selectedCategoryType !== 'combo' && (
                  <>
                    <textarea name="requiredIngredients" placeholder="Обязательные ингредиенты (через запятую)" defaultValue={editingProduct?.requiredIngredients} style={{ width: '100%', padding: '12px', marginBottom: '12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '15px', outline: 'none', height: '60px', resize: 'none', fontFamily: 'inherit' }} />
                    <textarea name="removableIngredients" placeholder="Удаляемые ингредиенты (через запятую)" defaultValue={editingProduct?.removableIngredients} style={{ width: '100%', padding: '12px', marginBottom: '12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '15px', outline: 'none', height: '60px', resize: 'none', fontFamily: 'inherit' }} />
                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Варианты</h3>
                    <div style={{ marginBottom: '12px' }}>
                      <input name="basePrice" type="number" placeholder="Базовая цена (₽)" defaultValue={editingProduct ? editingProduct.variants[0]?.price : ''} required
                        onChange={e => setBasePrice(parseInt(e.target.value) || 0)}
                        style={{ width: '100%', padding: '12px', marginBottom: '8px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '15px', outline: 'none' }} />
                      {basePrice > 0 && (
                        <div style={{ display: 'flex', gap: '8px', padding: '10px 12px', backgroundColor: '#f9f9f9', borderRadius: '8px', fontSize: '13px', color: '#6b6b6b' }}>
                          {[0,1,2].map(i => (
                            <span key={i} style={{ flex: 1, textAlign: 'center' }}>
                              {['Маленькая','Средняя','Большая'][i]}: <strong style={{ color: '#ff6900' }}>{basePrice + SIZE_SURCHARGES[i]} ₽</strong>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {(editingProduct ? editingProduct.variants : [{id:1},{id:2},{id:3}]).map((v: any, i: number) => (
                      <div key={v.id} style={{ marginBottom: '8px' }}>
                        <input name={`size${i+1}`} placeholder={`Размер ${i+1} (напр.: Маленькая 25 см)`} defaultValue={v.size}
                          style={{ width: '100%', padding: '12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '15px', outline: 'none' }} />
                      </div>
                    ))}
                  </>
                )}

                {selectedCategoryType === 'combo' && (
                  <>
                    <input name="discount" type="number" placeholder="Скидка (₽)" defaultValue={0} style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '15px', outline: 'none' }} />
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '14px', color: '#6b6b6b', marginBottom: '8px' }}>Товары в комбо</label>
                      {comboItems.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#f9f9f9', borderRadius: '8px', marginBottom: '8px' }}>
                          <span style={{ fontSize: '14px' }}>{item.productName}</span>
                          <button type="button" onClick={() => setComboItems(prev => prev.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', color: '#ff6900', cursor: 'pointer', fontSize: '18px' }}>×</button>
                        </div>
                      ))}
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <select id="prod-combo-product-select" style={{ flex: 1, padding: '10px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', outline: 'none' }}>
                          <option value="">Выберите товар</option>
                          {products.filter((p: any) => p.category?.type !== 'combo').map((p: any) => <option key={p.id} value={p.id}>{p.name} ({p.category.name})</option>)}
                        </select>
                        <button type="button" onClick={() => {
                          const ps = document.getElementById('prod-combo-product-select') as HTMLSelectElement
                          if (!ps.value) return
                          const product = products.find((p: any) => p.id === parseInt(ps.value))
                          if (product) {
                            const defaultVariant = product.variants.length > 1 ? product.variants[1] : product.variants[0]
                            setComboItems(prev => [...prev, { productId: product.id, variantId: defaultVariant?.id, productName: product.name, variantSize: defaultVariant?.size || '', price: defaultVariant?.price || 0 }])
                            ps.value = ''
                          }
                        }} style={{ padding: '10px 16px', backgroundColor: '#ff6900', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', whiteSpace: 'nowrap' }}>+ Добавить</button>
                      </div>
                    </div>
                  </>
                )}

                <button type="submit" disabled={uploading} style={{ width: '100%', padding: '16px', backgroundColor: uploading ? '#ccc' : '#ff6900', color: '#fff', border: 'none', borderRadius: '8px', cursor: uploading ? 'not-allowed' : 'pointer', fontSize: '16px', fontWeight: '600' }}>{uploading ? 'Сохранение...' : 'Сохранить'}</button>
              </form>
            </div>
          </div>
        )}

        {showCategoryForm && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '32px', maxWidth: '400px', width: '90%', position: 'relative' }}>
              <button onClick={() => setShowCategoryForm(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6b6b6b' }}>×</button>
              <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>{editingCategory ? 'Изменить категорию' : 'Добавить категорию'}</h2>
              <form onSubmit={handleCategorySubmit}>
                <input name="name" placeholder="Название категории" defaultValue={editingCategory?.name} required style={{ width: '100%', padding: '12px', marginBottom: '12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '15px', outline: 'none' }} />
                <select name="type" defaultValue={editingCategory?.type || 'pizza'} required style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '15px', outline: 'none' }}>
                  <option value="pizza">Пицца</option>
                  <option value="dessert">Десерт</option>
                  <option value="drink">Напиток</option>
                  <option value="snack">Закуска</option>
                  <option value="combo">Комбо</option>
                </select>
                <button type="submit" style={{ width: '100%', padding: '16px', backgroundColor: '#ff6900', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: '600' }}>Сохранить</button>
              </form>
            </div>
          </div>
        )}

        {showBannerForm && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '32px', maxWidth: '400px', width: '90%', position: 'relative' }}>
              <button onClick={() => { setShowBannerForm(false); setImagePreview(null); setImageFile(null); }} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6b6b6b' }}>×</button>
              <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>Добавить баннер</h2>
              <form onSubmit={handleBannerSubmit}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '14px', color: '#6b6b6b', marginBottom: '8px' }}>Изображение (1280x440px)</label>
                  {imagePreview ? (
                    <div style={{ position: 'relative', width: '100%', marginBottom: '12px' }}>
                      <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e0e0e0' }} />
                      <button type="button" onClick={() => { setImagePreview(null); setImageFile(null); }} style={{ position: 'absolute', top: '8px', right: '8px', padding: '8px 12px', backgroundColor: '#ff6900', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>Удалить</button>
                    </div>
                  ) : (
                    <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '24px', border: '2px dashed #e0e0e0', borderRadius: '8px', cursor: 'pointer', backgroundColor: '#f9f9f9' }}>
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setImageFile(file)
                          const reader = new FileReader()
                          reader.onloadend = () => setImagePreview(reader.result as string)
                          reader.readAsDataURL(file)
                        }
                      }} />
                      <span style={{ fontSize: '15px', color: '#6b6b6b' }}>Нажмите для выбора файла</span>
                    </label>
                  )}
                </div>
                <button type="submit" disabled={uploading} style={{ width: '100%', padding: '16px', backgroundColor: uploading ? '#ccc' : '#ff6900', color: '#fff', border: 'none', borderRadius: '8px', cursor: uploading ? 'not-allowed' : 'pointer', fontSize: '16px', fontWeight: '600' }}>{uploading ? 'Сохранение...' : 'Сохранить'}</button>
              </form>
            </div>
          </div>
        )}

        {showIngredientForm && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '32px', maxWidth: '400px', width: '90%', position: 'relative' }}>
              <button onClick={() => { setShowIngredientForm(false); setImagePreview(null); setImageFile(null); }} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6b6b6b' }}>×</button>
              <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>{editingIngredient ? 'Изменить ингредиент' : 'Добавить ингредиент'}</h2>
              <form onSubmit={handleIngredientSubmit}>
                <input name="name" placeholder="Название" defaultValue={editingIngredient?.name} required style={{ width: '100%', padding: '12px', marginBottom: '12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '15px', outline: 'none' }} />
                <input name="price" type="number" placeholder="Цена" defaultValue={editingIngredient?.price} required style={{ width: '100%', padding: '12px', marginBottom: '12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '15px', outline: 'none' }} />
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '14px', color: '#6b6b6b', marginBottom: '8px' }}>Категории</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '12px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                    {categories.map(c => (
                      <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>
                        <input
                          type="checkbox"
                          name="categories"
                          value={c.id}
                          defaultChecked={editingIngredient?.categories?.split(',').includes(String(c.id))}
                          style={{ cursor: 'pointer' }}
                        />
                        {c.name}
                      </label>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '14px', color: '#6b6b6b', marginBottom: '8px' }}>Изображение</label>
                  {imagePreview ? (
                    <div style={{ position: 'relative', width: '100%', marginBottom: '12px' }}>
                      <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '150px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #e0e0e0' }} />
                      <button type="button" onClick={() => { setImagePreview(null); setImageFile(null); }} style={{ position: 'absolute', top: '8px', right: '8px', padding: '8px 12px', backgroundColor: '#ff6900', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>Удалить</button>
                    </div>
                  ) : (
                    <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '24px', border: '2px dashed #e0e0e0', borderRadius: '8px', cursor: 'pointer', backgroundColor: '#f9f9f9' }}>
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setImageFile(file)
                          const reader = new FileReader()
                          reader.onloadend = () => setImagePreview(reader.result as string)
                          reader.readAsDataURL(file)
                        }
                      }} />
                      <span style={{ fontSize: '15px', color: '#6b6b6b' }}>Нажмите для выбора файла</span>
                    </label>
                  )}
                </div>
                <button type="submit" disabled={uploading} style={{ width: '100%', padding: '16px', backgroundColor: uploading ? '#ccc' : '#ff6900', color: '#fff', border: 'none', borderRadius: '8px', cursor: uploading ? 'not-allowed' : 'pointer', fontSize: '16px', fontWeight: '600' }}>{uploading ? 'Сохранение...' : 'Сохранить'}</button>
              </form>
            </div>
          </div>
        )}
      </div>

      {alertMessage && <AlertModal message={alertMessage} onClose={() => setAlertMessage(null)} />}
      {confirmData && <ConfirmModal message={confirmData.message} onConfirm={confirmData.onConfirm} onCancel={() => setConfirmData(null)} />}
    </div>
  )
}
