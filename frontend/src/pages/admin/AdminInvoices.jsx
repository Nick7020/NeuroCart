import { useState } from 'react'
import { useFetch } from '../../hooks/useFetch'
import { invoiceService } from '../../services'
import { Spinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/ui/EmptyState'
import { InvoicePreview } from '../../components/order/InvoicePreview'
import { formatCurrency, formatDate } from '../../utils'
import { FileText, Eye } from 'lucide-react'

export function AdminInvoices() {
  const { data, loading } = useFetch(() => invoiceService.getAll(), [])
  const [selected, setSelected] = useState(null)
  // Backend returns paginated { results: [...] } or { invoices: [...] }
  const invoices = data?.results ?? data?.invoices ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Invoices</h1>
        <p className="text-gray-400 text-sm mt-1">All generated invoices from accepted orders</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : !invoices.length ? (
        <EmptyState icon="🧾" title="No invoices yet" description="Invoices appear here when vendor accepts orders" />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Invoice / Order ID', 'Customer', 'Date', 'Items', 'Total', 'Action'].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {invoices.map(inv => {
                  const order = inv.order || {}
                  const customerName = order.shipping_address?.name || 'N/A'
                  const itemCount = order.items?.length ?? '—'
                  return (
                    <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                            <FileText size={14} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 text-xs">{inv.invoice_number}</p>
                            <p className="text-[10px] text-gray-400">#{order.id?.slice(-8).toUpperCase() || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-medium text-gray-700">{customerName}</td>
                      <td className="px-5 py-4 text-gray-500">{formatDate(inv.issued_at)}</td>
                      <td className="px-5 py-4 text-gray-500">{itemCount}</td>
                      <td className="px-5 py-4 font-bold" style={{ color: '#1A3263' }}>{formatCurrency(inv.total_amount)}</td>
                      <td className="px-5 py-4">
                        <button onClick={() => setSelected(inv)}
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                          <Eye size={13} /> View
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && <InvoicePreview invoice={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
