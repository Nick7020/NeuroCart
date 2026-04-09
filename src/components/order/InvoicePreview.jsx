import { useRef } from 'react'
import Barcode from 'react-barcode'
import { QRCodeSVG } from 'qrcode.react'
import { Printer, Download } from 'lucide-react'

export function InvoicePreview({ invoice, onClose }) {
  const ref = useRef()

  const handlePrint = () => {
    const content = ref.current.innerHTML
    const win = window.open('', '_blank')
    win.document.write(`
      <html><head><title>Invoice ${invoice.orderId}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; font-size: 11px; color: #000; }
        table { width: 100%; border-collapse: collapse; }
        td, th { border: 1px solid #000; padding: 4px 6px; }
        th { background: #f0f0f0; font-weight: bold; }
        .no-border td { border: none; }
      </style></head>
      <body>${content}</body></html>
    `)
    win.document.close()
    win.print()
  }

  const handlePDF = async () => {
    const html2pdf = (await import('html2pdf.js')).default
    html2pdf().set({
      margin: 5,
      filename: `Invoice-${invoice.orderId}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).from(ref.current).save()
  }

  const order = invoice.order || {}
  const items = order.items || []
  const address = order.address || {}
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const tax = subtotal * 0.18
  const total = subtotal + tax

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto py-6 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl">
        {/* Action Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="font-bold text-gray-800">Invoice Preview</h2>
          <div className="flex gap-3">
            <button onClick={handlePrint} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-xl text-sm transition-colors">
              <Printer size={15} /> Print
            </button>
            <button onClick={handlePDF} className="flex items-center gap-2 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors" style={{ background: '#1A3263' }}>
              <Download size={15} /> PDF
            </button>
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm bg-red-50 text-red-500 hover:bg-red-100 font-semibold transition-colors">Close</button>
          </div>
        </div>

        {/* Invoice Content */}
        <div ref={ref} className="p-6" style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#000' }}>

          {/* Top Black Strip */}
          <div style={{ background: '#000', color: '#fff', textAlign: 'center', padding: '6px', fontWeight: 'bold', fontSize: '13px', marginBottom: '4px' }}>
            CASH ON DELIVERY — PLEASE COLLECT ₹{total.toFixed(2)} AT THE TIME OF DELIVERY
          </div>

          {/* Header Row */}
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', marginBottom: '0' }}>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #000', padding: '8px', width: '40%' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '18px' }}>NeuroCart</div>
                  <div style={{ fontSize: '10px', color: '#555' }}>AI-Powered E-Commerce</div>
                  <div style={{ marginTop: '6px', fontSize: '10px' }}>
                    <div>📍 123 Tech Park, Bangalore - 560001</div>
                    <div>📞 +91 98765 43210</div>
                    <div>✉ support@neurocart.com</div>
                    <div>GSTIN: 29AABCU9603R1ZX</div>
                  </div>
                </td>
                <td style={{ border: '1px solid #000', padding: '8px', width: '35%', verticalAlign: 'top' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}>SHIP TO:</div>
                  <div style={{ fontWeight: 'bold' }}>{address.name || 'Customer Name'}</div>
                  <div>{address.street}</div>
                  <div>{address.city}, {address.state}</div>
                  <div>PIN: {address.pincode}</div>
                  <div>📞 {address.phone}</div>
                </td>
                <td style={{ border: '1px solid #000', padding: '8px', width: '25%', textAlign: 'center', verticalAlign: 'middle' }}>
                  <QRCodeSVG value={invoice.orderId} size={80} />
                  <div style={{ fontSize: '9px', marginTop: '4px' }}>{invoice.orderId}</div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Order Info + Barcode */}
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', borderTop: 'none' }}>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #000', padding: '8px', width: '50%', verticalAlign: 'top' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      {[
                        ['Order ID', invoice.orderId],
                        ['Order Date', new Date(invoice.createdAt).toLocaleDateString('en-IN')],
                        ['Invoice No', `INV-${invoice.orderId}`],
                        ['Payment', order.paymentMethod?.toUpperCase() || 'COD'],
                        ['Status', order.status || 'CONFIRMED'],
                      ].map(([k, v]) => (
                        <tr key={k}>
                          <td style={{ padding: '3px 6px', fontWeight: 'bold', border: '1px solid #ddd', width: '45%' }}>{k}</td>
                          <td style={{ padding: '3px 6px', border: '1px solid #ddd' }}>{v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </td>
                <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', verticalAlign: 'middle' }}>
                  <Barcode value={invoice.orderId} width={1.5} height={60} fontSize={11} />
                </td>
              </tr>
            </tbody>
          </table>

          {/* Product Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', borderTop: 'none' }}>
            <thead>
              <tr style={{ background: '#f0f0f0' }}>
                {['#', 'Product / SKU', 'Qty', 'Unit Price', 'Discount', 'Taxable', 'GST 18%', 'Total'].map(h => (
                  <th key={h} style={{ border: '1px solid #000', padding: '5px 6px', textAlign: 'center', fontSize: '10px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => {
                const taxable = item.price * item.quantity
                const gst = taxable * 0.18
                return (
                  <tr key={i}>
                    <td style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'center' }}>{i + 1}</td>
                    <td style={{ border: '1px solid #000', padding: '4px 6px' }}>
                      <div style={{ fontWeight: 'bold' }}>{item.product?.name || 'Product'}</div>
                      <div style={{ fontSize: '9px', color: '#555' }}>SKU: NC-{item.product?._id?.slice(-6).toUpperCase()}</div>
                    </td>
                    <td style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'right' }}>₹{item.price.toFixed(2)}</td>
                    <td style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'center' }}>—</td>
                    <td style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'right' }}>₹{taxable.toFixed(2)}</td>
                    <td style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'right' }}>₹{gst.toFixed(2)}</td>
                    <td style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'right', fontWeight: 'bold' }}>₹{(taxable + gst).toFixed(2)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Totals */}
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', borderTop: 'none' }}>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px', width: '60%', verticalAlign: 'top' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Notes:</div>
                  <div style={{ fontSize: '10px' }}>1. This is a computer generated invoice.</div>
                  <div style={{ fontSize: '10px' }}>2. Goods once sold will not be taken back.</div>
                  <div style={{ fontSize: '10px' }}>3. Subject to Bangalore jurisdiction.</div>
                </td>
                <td style={{ border: '1px solid #000', padding: '6px', width: '40%' }}>
                  <table style={{ width: '100%' }}>
                    <tbody>
                      {[
                        ['Subtotal', `₹${subtotal.toFixed(2)}`],
                        ['CGST (9%)', `₹${(subtotal * 0.09).toFixed(2)}`],
                        ['SGST (9%)', `₹${(subtotal * 0.09).toFixed(2)}`],
                        ['Shipping', 'FREE'],
                      ].map(([k, v]) => (
                        <tr key={k}>
                          <td style={{ padding: '3px 0', fontSize: '10px' }}>{k}</td>
                          <td style={{ padding: '3px 0', textAlign: 'right', fontSize: '10px' }}>{v}</td>
                        </tr>
                      ))}
                      <tr style={{ borderTop: '2px solid #000' }}>
                        <td style={{ padding: '4px 0', fontWeight: 'bold', fontSize: '13px' }}>TOTAL</td>
                        <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 'bold', fontSize: '13px' }}>₹{total.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Footer */}
          <div style={{ border: '1px solid #000', borderTop: 'none', padding: '6px', textAlign: 'center', fontSize: '10px', background: '#f9f9f9' }}>
            Thank you for shopping with <strong>NeuroCart</strong>! For support: support@neurocart.com | +91 98765 43210
          </div>
        </div>
      </div>
    </div>
  )
}
