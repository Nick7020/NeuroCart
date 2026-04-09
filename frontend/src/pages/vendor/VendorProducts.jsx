import { useState } from 'react'
import { useFetch } from '../../hooks/useFetch'
import { productService } from '../../services'
import { useNotification } from '../../context/NotificationContext'
import { useAuth } from '../../context/AuthContext'
import { Modal } from '../../components/ui/Modal'
import { Spinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/ui/EmptyState'
import { formatCurrency } from '../../utils'
import { Plus, Edit2, Trash2, Search } from 'lucide-react'

const EMPTY = { name: '', category: '', price: '', stock: '', description: '', images: '' }

export function VendorProducts() {
  const { user } = useAuth()
  const { notify } = useNotification()
  const { data, loading } = useFetch(() => productService.getAll({ limit: 100 }), [])
  const [products, setProducts] = useState(null)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  const list = (products ?? data?.products ?? []).filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  )

  const openAdd  = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = (p) => {
    setEditing(p)
    setForm({ ...p, images: p.images?.join(', ') || '', price: String(p.price), stock: String(p.stock) })
    setModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        images: form.images.split(',').map(s => s.trim()).filter(Boolean),
        vendorId: user._id,
      }
      if (editing) {
        const { data: d } = await productService.update(editing._id, payload)
        setProducts(prev => (prev ?? data?.products ?? []).map(p => p._id === editing._id ? (d.product || d) : p))
        notify('Product updated', 'success')
      } else {
        const { data: d } = await productService.create(payload)
        setProducts(prev => [d.product || d, ...(prev ?? data?.products ?? [])])
        notify('Product added!', 'success')
      }
      setModal(false)
    } catch { notify('Save failed', 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    try {
      await productService.delete(id)
      setProducts(prev => (prev ?? data?.products ?? []).filter(p => p._id !== id))
      notify('Product deleted', 'success')
    } catch { notify('Delete failed', 'error') }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">My Products</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your store inventory</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="input pl-9 w-44" />
          </div>
          <button onClick={openAdd} className="btn-primary gap-2"><Plus size={16} /> Add Product</button>
        </div>
      </div>

      {loading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div> :
       !list.length ? <EmptyState icon="📦" title="No products yet" description="Add your first product" action={<button onClick={openAdd} className="btn-primary">Add Product</button>} /> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {list.map(p => (
            <div key={p._id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="aspect-square bg-gray-50 overflow-hidden">
                <img src={p.images?.[0] || `https://placehold.co/300x300/f0f4ff/1A3263?text=${encodeURIComponent(p.name)}`}
                  alt={p.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <p className="text-xs text-blue-500 font-semibold mb-1">{p.category}</p>
                <p className="font-bold text-gray-800 truncate text-sm">{p.name}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="font-extrabold" style={{ color: '#1A3263' }}>{formatCurrency(p.price)}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.stock > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                    Stock: {p.stock}
                  </span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => openEdit(p)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-semibold transition-colors">
                    <Edit2 size={13} /> Edit
                  </button>
                  <button onClick={() => handleDelete(p._id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 text-xs font-semibold transition-colors">
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Product' : 'Add New Product'}>
        <form onSubmit={handleSave} className="space-y-4">
          {[
            { k: 'name',     label: 'Product Name', placeholder: 'e.g. iPhone 15 Pro' },
            { k: 'category', label: 'Category',     placeholder: 'Electronics' },
            { k: 'price',    label: 'Price (₹)',    placeholder: '999', type: 'number' },
            { k: 'stock',    label: 'Stock Qty',    placeholder: '100', type: 'number' },
            { k: 'images',   label: 'Image URL',    placeholder: 'https://...' },
          ].map(({ k, label, placeholder, type = 'text' }) => (
            <div key={k}>
              <label className="block text-sm font-semibold mb-1.5 text-gray-700">{label}</label>
              <input type={type} required value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} placeholder={placeholder} className="input" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-gray-700">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="input resize-none" placeholder="Product description..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? <Spinner size="sm" /> : (editing ? 'Update' : 'Add Product')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
