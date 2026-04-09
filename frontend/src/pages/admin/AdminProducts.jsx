import { useState } from 'react'
import { useFetch } from '../../hooks/useFetch'
import { productService } from '../../services'
import { useNotification } from '../../context/NotificationContext'
import { Modal } from '../../components/ui/Modal'
import { Spinner } from '../../components/ui/Spinner'
import { formatCurrency } from '../../utils'
import { Plus, Search, Edit2, Trash2 } from 'lucide-react'

const EMPTY = { name: '', category: '', price: '', stock: '', description: '', images: '' }

export function AdminProducts() {
  const { notify } = useNotification()
  const { data, loading } = useFetch(() => productService.getAll({ limit: 100 }), [])
  const [products, setProducts] = useState(null)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  const raw = products ?? data?.results ?? data?.products ?? data
  const list = (Array.isArray(raw) ? raw : []).filter(p =>
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
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock), images: form.images.split(',').map(s => s.trim()).filter(Boolean) }
      if (editing) {
        const { data: d } = await productService.update(editing._id, payload)
        setProducts(prev => (prev ?? data?.products ?? []).map(p => p._id === editing._id ? (d.product || d) : p))
        notify('Product updated', 'success')
      } else {
        const { data: d } = await productService.create(payload)
        setProducts(prev => [d.product || d, ...(prev ?? data?.products ?? [])])
        notify('Product created', 'success')
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
        <h1 className="text-2xl font-extrabold text-gray-900">Products</h1>
        <div className="flex gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="input pl-9 w-48" />
          </div>
          <button onClick={openAdd} className="btn-primary gap-2"><Plus size={16} /> Add Product</button>
        </div>
      </div>

      {loading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div> : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Product', 'Category', 'Price', 'Stock', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {list.map(p => (
                  <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img src={p.images?.[0] || 'https://placehold.co/40x40/f0f4ff/1A3263?text=P'} alt="" className="w-10 h-10 rounded-xl object-cover bg-gray-100 border border-gray-100" />
                        <span className="font-semibold text-gray-800 truncate max-w-[160px]">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500">{p.category}</td>
                    <td className="px-5 py-4 font-bold" style={{ color: '#1A3263' }}>{formatCurrency(p.price)}</td>
                    <td className="px-5 py-4">
                      <span className={`badge font-semibold ${p.stock > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>{p.stock}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(p)} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"><Edit2 size={14} /></button>
                        <button onClick={() => handleDelete(p._id)} className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!list.length && <p className="text-center text-gray-400 py-12">No products found</p>}
          </div>
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Product' : 'Add Product'}>
        <form onSubmit={handleSave} className="space-y-4">
          {[
            { k: 'name', label: 'Name', placeholder: 'Product name' },
            { k: 'category', label: 'Category', placeholder: 'Electronics' },
            { k: 'price', label: 'Price (₹)', placeholder: '999', type: 'number' },
            { k: 'stock', label: 'Stock', placeholder: '100', type: 'number' },
            { k: 'images', label: 'Image URLs (comma separated)', placeholder: 'https://...' },
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
              {saving ? <Spinner size="sm" /> : (editing ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
