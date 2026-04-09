import { useState } from 'react'
import { useFetch } from '../../hooks/useFetch'
import { productService } from '../../services'
import { useNotification } from '../../context/NotificationContext'
import { Modal } from '../../components/ui/Modal'
import { Spinner } from '../../components/ui/Spinner'
import { formatCurrency } from '../../utils'

const EMPTY = { name: '', category: '', price: '', stock: '', description: '', images: '' }

export function AdminProducts() {
  const { notify } = useNotification()
  const { data, loading, error } = useFetch(() => productService.getAll({ limit: 100 }), [])
  const [products, setProducts] = useState(null)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  const list = (products ?? data?.products ?? data ?? []).filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  )

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true) }
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
    } catch (err) {
      notify(err.response?.data?.message || 'Save failed', 'error')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    try {
      await productService.delete(id)
      setProducts(prev => (prev ?? data?.products ?? []).filter(p => p._id !== id))
      notify('Product deleted', 'success')
    } catch { notify('Delete failed', 'error') }
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="flex gap-3">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="input w-48" />
          <button onClick={openAdd} className="btn-primary">+ Add Product</button>
        </div>
      </div>

      {loading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-800">
                <tr className="text-gray-400">
                  {['Product', 'Category', 'Price', 'Stock', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-4 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {list.map(p => (
                  <tr key={p._id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img src={p.images?.[0] || 'https://placehold.co/40x40/1f2937/6366f1?text=P'} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-800" />
                        <span className="font-medium truncate max-w-[180px]">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-400">{p.category}</td>
                    <td className="px-5 py-4 font-semibold text-indigo-400">{formatCurrency(p.price)}</td>
                    <td className="px-5 py-4">
                      <span className={`badge ${p.stock > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(p)} className="btn-secondary text-xs py-1.5 px-3">Edit</button>
                        <button onClick={() => handleDelete(p._id)} className="btn-danger text-xs py-1.5 px-3">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!list.length && <p className="text-center text-gray-500 py-12">No products found</p>}
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
              <label className="block text-sm font-medium mb-1.5">{label}</label>
              <input type={type} required value={form[k]} onChange={set(k)} placeholder={placeholder} className="input" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium mb-1.5">Description</label>
            <textarea value={form.description} onChange={set('description')} rows={3} className="input resize-none" placeholder="Product description..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {saving ? <Spinner size="sm" /> : (editing ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
