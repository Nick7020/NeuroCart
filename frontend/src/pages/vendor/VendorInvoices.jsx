import { useState } from 'react'
import { useFetch } from '../../hooks/useFetch'
import { invoiceService } from '../../services'
import { InvoiceCard } from '../../components/invoice/InvoiceCard'
import { InvoiceModal } from '../../components/invoice/InvoiceModal'
import { Spinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/ui/EmptyState'

export function VendorInvoices() {
  const { data, loading } = useFetch(() => invoiceService.vendorGetAll(), [])
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const raw = data?.results ?? data ?? []
  const invoices = Array.isArray(raw) ? raw : []

  const handleView = (invoice) => {
    setSelectedInvoice(invoice)
    setModalOpen(true)
  }

  const handleDownload = (invoice) => {
    // TODO: Implement PDF download
    console.log('Download invoice:', invoice.invoice_number)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedInvoice(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">My Invoices</h1>
        <p className="text-gray-400 text-sm mt-1">View invoices generated from your accepted orders</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : !invoices.length ? (
        <EmptyState icon="📄" title="No invoices yet" description="Invoices will appear here when you accept customer orders" />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {invoices.map(invoice => (
            <InvoiceCard
              key={invoice.id}
              invoice={invoice}
              onView={handleView}
              onDownload={handleDownload}
            />
          ))}
        </div>
      )}

      <InvoiceModal
        invoice={selectedInvoice}
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onDownload={handleDownload}
      />
    </div>
  )
}