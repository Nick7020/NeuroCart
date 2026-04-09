import { useState } from 'react'
import { motion } from 'framer-motion'

const ISSUE_TYPES = ['Order Issue', 'Payment Issue', 'Return/Refund', 'Login Problem', 'Product Issue', 'Other']

export function TicketForm({ onSubmit }) {
  const [form, setForm] = useState({ type: '', description: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.type || !form.description.trim()) return
    const ticketId = 'TKT' + Date.now().toString().slice(-6)
    setSubmitted(true)
    onSubmit?.({ ...form, ticketId })
  }

  if (submitted) return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="mx-2 mb-3 p-4 rounded-2xl text-center"
      style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
      <p className="text-2xl mb-1">✅</p>
      <p className="font-bold text-green-700 text-sm">Ticket Raised!</p>
      <p className="text-xs text-green-600 mt-1">Our team will respond within 24 hours.</p>
    </motion.div>
  )

  return (
    <motion.form initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="mx-2 mb-3 p-4 rounded-2xl border bg-white"
      style={{ borderColor: '#e9d5ff' }}>
      <p className="text-sm font-bold mb-3" style={{ color: '#7C3AED' }}>🎫 Raise a Support Ticket</p>
      <div className="mb-3">
        <label className="block text-xs font-semibold text-gray-600 mb-1">Issue Type</label>
        <select required value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
          className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-400 bg-gray-50">
          <option value="">Select issue type</option>
          {ISSUE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div className="mb-3">
        <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
        <textarea required rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
          placeholder="Describe your issue..."
          className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-400 bg-gray-50 resize-none" />
      </div>
      <button type="submit"
        className="w-full py-2 rounded-xl text-sm font-bold text-white transition-all"
        style={{ background: 'linear-gradient(135deg,#7C3AED,#5b21b6)' }}>
        Submit Ticket
      </button>
    </motion.form>
  )
}
