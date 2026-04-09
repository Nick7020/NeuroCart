import { useState, useEffect } from 'react'
import { useFetch } from '../../hooks/useFetch'
import { productService, vendorService, categoryService } from '../../services'
import { useNotification } from '../../context/NotificationContext'
import { Modal } from '../../components/ui/Modal'
import { Spinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/ui/EmptyState'
import { formatCurrency } from '../../utils'
import { Plus, Edit2, Trash2, Search, ImagePlus, X } from 'lucide-react'

const EMPTY = {
  name: '',
  category: '',
  price: '',
  original_price: '',
  discount: '0',
  stock: '',
  description: '',
  image_urls: [''],   // array of URL strings
}

export function VendorProducts() {
  const { notify } = useNotification()

  const { data, loading } = useFetch(() => vendorService.getProducts(), [])
  const [products, setProducts] = useState(null)

  const { data: catData } = useFetch(() => categoryService.getAll(), [])
  const categories = catData?.results ?? (Array.isArray(catData) ? catData : [])

  const [modal, setModal]     = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm]       = useState(EMPTY)
  const [saving, setSaving]   = useState(false)
  const [search, setSearch]   = useState('')

  useEffect(() => {
    if (data) setProducts(data.results ?? data)
  }, [data])

  const list = (products ?? []).filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  )

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true) }

  const openEdit = (p) => {
    setEditing(p)
    setForm({
      name:           p.name || '',
      category:       p.category || '',
      price:          String(p.price || ''),
      original_price: String(p.original_price || ''),
      discount:       String(p.discount || '0'),
      stock:          String(p.stock || ''),
      description:    p.description || '',
      image_urls:     p.images?.length ? p.images : [''],
    })
    setModal(true)
  }

  // ── Image URL helpers ──────────────────────────────────────────────────────
  const setImageUrl = (idx, val) => {
    const urls = [...form.image_urls]
    urls[idx] = val
    setForm({ ...form, image_urls: urls })
  }
  const addImageRow    = () => setForm({ ...form, image_urls: [...form.image_urls, ''] })
  const removeImageRow = (idx) => {
    const urls = form.image_urls.filter((_, i) => i !== idx)
    setForm({ ...form, image_urls: urls.length ? urls : [''] })
  }

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const images = form.image_urls.map(u => u.trim()).filter(Boolean)
      const payload = {
        name:           form.name,
        description:    form.description,
        price:          Number(form.price),
        original_price: form.original_price ? Number(form.original_price) : null,
        discount:       Number(form.discount) || 0,
        stock:          Number(form.stock),
        category:       form.category || null,
        is_active:      true,
        images,
      }

      if (editing) {
        const { data: d } = await productService.update(editing.id, payload)
        setProducts(prev => (prev ?? []).map(p => p.id === editing.id ? { ...p, ...d } : p))
        notify('Product updated', 'success')
      } else {
        const { data: d } = await productService.create(payload)
        setProducts(prev => [d, ...(prev ?? [])])
        notify('Product added!', 'success')
      }
      setModal(false)
    } catch (err) {
      const detail = err?.response?.data
      const msg = typeof detail === 'string' ? detail
        : detail?.detail || Object.values(detail || {}).flat().join(' ') || 'Save failed'
      notify(msg, 'error')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    try {
      await productService.delete(id)
      setProducts(prev => (prev ?? []).filter(p => p.id !== id))
      notify('Product deleted', 'success')
    } catch { notify('Delete failed', 'error') }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">My Products</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your store inventory</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search..." className="input pl-9 w-44" />
          </div>
          <button onClick={openAdd} className="btn-primary gap-2">
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {/* Product grid */}
      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : !list.length ? (
        <EmptyState icon="📦" title="No products yet" description="Add your first product to start selling"
          action={<button onClick={openAdd} className="btn-primary">Add Product</button>} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {list.map(p => (
            <div key={p.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="aspect-square bg-gray-50 overflow-hidden relative">
                <img
                  src={p.primary_image || `https://placehold.co/300x300/f0f4ff/1A3263?text=${encodeURIComponent(p.name)}`}
                  alt={p.name} className="w-full h-full object-cover"
                />
                {p.discount > 0 && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    -{p.discount}%
                  </span>
                )}
              </div>
              <div className="p-4">
                <p className="text-xs text-blue-500 font-semibold mb-1">{p.category_name || '—'}</p>
                <p className="font-bold text-gray-800 truncate text-sm">{p.name}</p>
                <div className="flex items-center justify-between mt-2">
                  <div>
                    <span className="font-extrabold text-sm" style={{ color: '#1A3263' }}>{formatCurrency(p.price)}</span>
                    {p.original_price && Number(p.original_price) > Number(p.price) && (
                      <span className="text-xs text-gray-400 line-through ml-1">{formatCurrency(p.original_price)}</span>
                    )}
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.stock > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                    {p.stock > 0 ? `Stock: ${p.stock}` : 'Out of stock'}
                  </span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => openEdit(p)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-semibold transition-colors">
                    <Edit2 size={13} /> Edit
                  </button>
                  <button onClick={() => handleDelete(p.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 text-xs font-semibold transition-colors">
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Product' : 'Add New Product'}>
        <form onSubmit={handleSave} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-gray-700">Product Name *</label>
            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. iPhone 15 Pro" className="input" />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-gray-700">Category</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input">
              <option value="">— Select category —</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Price + Stock */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-gray-700">Selling Price (₹) *</label>
              <input required type="number" min="0.01" step="0.01" value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })} placeholder="999" className="input" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-gray-700">Stock Qty *</label>
              <input required type="number" min="0" value={form.stock}
                onChange={e => setForm({ ...form, stock: e.target.value })} placeholder="100" className="input" />
            </div>
          </div>

          {/* Original Price + Discount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-gray-700">Original Price (₹)</label>
              <input type="number" min="0" step="0.01" value={form.original_price}
                onChange={e => setForm({ ...form, original_price: e.target.value })}
                placeholder="1299 (optional)" className="input" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-gray-700">Discount %</label>
              <input type="number" min="0" max="100" value={form.discount}
                onChange={e => setForm({ ...form, discount: e.target.value })}
                placeholder="0" className="input" />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-gray-700">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              rows={3} className="input resize-none" placeholder="Describe your product..." />
          </div>

          {/* Image URLs */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold text-gray-700">Product Images (URLs)</label>
              <button type="button" onClick={addImageRow}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold">
                <ImagePlus size={13} /> Add image
              </button>
            </div>
            <div className="space-y-2">
              {form.image_urls.map((url, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={url}
                    onChange={e => setImageUrl(idx, e.target.value)}
                    placeholder={`https://example.com/image${idx + 1}.jpg`}
                    className="input flex-1 text-sm"
                  />
                  {/* Preview thumbnail */}
                  {url && (
                    <img src={url} alt="" className="w-9 h-9 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                      onError={e => { e.target.style.display = 'none' }} />
                  )}
                  {form.image_urls.length > 1 && (
                    <button type="button" onClick={() => removeImageRow(idx)}
                      className="text-gray-400 hover:text-red-500 flex-shrink-0">
                      <X size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">First image will be the primary/cover image</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 sticky bottom-0 bg-white pb-1">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? <Spinner size="sm" /> : (editing ? 'Update Product' : 'Add Product')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
