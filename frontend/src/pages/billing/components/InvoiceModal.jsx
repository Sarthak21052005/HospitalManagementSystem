// src/pages/billing/components/InvoiceModal.jsx

import { formatDate, formatCurrency, formatBillNumber } from '../utils/Billinghelpers';

function safe(value, fallback = "N/A") {
  return (value === undefined || value === null || value === "") ? fallback : value;
}

export default function InvoiceModal({ bill, onClose }) {
  if (!bill) return null;

  // Safe fields
  const items = Array.isArray(bill.items) ? bill.items : [];
  const subtotal = parseFloat(bill.subtotal) || 0;
  const tax = parseFloat(bill.tax_amount) || 0;
  const total = parseFloat(bill.total_amount) || 0;

  function handlePrint() {
    window.print();
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>

        {/* Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'white'
        }} className="no-print">
          <h2 style={{ margin: 0 }}>📄 Invoice Preview</h2>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handlePrint}
              style={{
                padding: '10px 20px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              🖨️ Print Invoice
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '10px 20px',
                background: 'white',
                color: '#64748b',
                border: '2px solid #e2e8f0',
                borderRadius: '8px'
              }}
            >
              Close
            </button>
          </div>
        </div>

        {/* Content */}
        <div id="invoice-content" style={{ padding: '40px', background: 'white' }}>

          {/* Hospital Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: '32px',
            borderBottom: '3px solid #3b82f6',
            paddingBottom: '20px'
          }}>
            <h1 style={{ margin: 0 }}>🏥 City Hospital</h1>
            <p style={{ margin: 0 }}>123 Health Street, Mumbai</p>
          </div>

          {/* Invoice Title */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ margin: 0, color: '#3b82f6' }}>HOSPITAL INVOICE</h2>
            <p style={{ margin: 0 }}>
              {safe(formatBillNumber(bill.bill_id))}
            </p>
          </div>

          {/* INFO GRID - STRUCTURE UNCHANGED */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '32px',
            marginBottom: '32px'
          }}>

            {/* Patient Info */}
            <div>
              <h3 style={{ margin: 0, marginBottom: 12 }}>Bill To</h3>
              <div style={{ padding: 16, background: '#f8fafc', borderRadius: 8 }}>
                <p style={{ margin: 0, fontWeight: 700 }}>{safe(bill.patient_name)}</p>
                <p style={{ margin: 0 }}>Patient ID: {safe(bill.patient_id)}</p>
                <p style={{ margin: 0 }}>
                  Age: {safe(bill.age)}y • {safe(bill.gender)}
                </p>
                <p style={{ margin: 0 }}>Contact: {safe(bill.contact)}</p>
              </div>
            </div>

            {/* Bill Details */}
            <div>
              <h3 style={{ margin: 0, marginBottom: 12 }}>Bill Details</h3>
              <div style={{ padding: 16, background: '#f8fafc', borderRadius: 8 }}>
                <p style={{ margin: 0 }}>Bill Date: {safe(formatDate(bill.bill_date))}</p>
                <p style={{ margin: 0 }}>Admission: {safe(formatDate(bill.admission_date))}</p>
                <p style={{ margin: 0 }}>Discharge: {safe(formatDate(bill.discharge_date))}</p>
                <p style={{ margin: 0 }}>Total Days: {safe(bill.total_days)}</p>
              </div>
            </div>
          </div>

          {/* ITEMS TABLE - STRUCTURE UNCHANGED */}
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginBottom: '24px',
            border: '1px solid #e2e8f0'
          }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: 12 }}>Description</th>
                <th style={{ padding: 12 }}>Qty</th>
                <th style={{ padding: 12 }}>Rate</th>
                <th style={{ padding: 12 }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: 12 }}>{safe(item.item_name)}</td>
                    <td style={{ padding: 12, textAlign: 'center' }}>
                      {safe(item.quantity)}
                    </td>
                    <td style={{ padding: 12, textAlign: 'right' }}>
                      {formatCurrency(item.unit_price)}
                    </td>
                    <td style={{ padding: 12, textAlign: 'right' }}>
                      {formatCurrency(item.total_price)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ padding: 12, textAlign: 'center' }}>
                    No billing items
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* TOTALS - STRUCTURE UNCHANGED */}
          <div style={{ marginLeft: 'auto', maxWidth: 400 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
              <p>Subtotal</p>
              <p>{formatCurrency(subtotal)}</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
              <p>Tax (18% GST)</p>
              <p>{formatCurrency(tax)}</p>
            </div>

            {bill.discount > 0 && (
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '12px 0', color: '#16a34a'
              }}>
                <p>Discount</p>
                <p>- {formatCurrency(bill.discount)}</p>
              </div>
            )}

            <div style={{
              display: 'flex', justifyContent: 'space-between',
              padding: 16, background: '#dbeafe', borderRadius: 8
            }}>
              <p style={{ margin: 0, fontWeight: 700 }}>TOTAL AMOUNT</p>
              <p style={{ margin: 0, fontWeight: 700 }}>{formatCurrency(total)}</p>
            </div>
          </div>
        </div>

        {/* PRINT CSS */}
        <style>{`
          @media print {
            .no-print { display: none !important; }
            body * { visibility: hidden; }
            #invoice-content, #invoice-content * { visibility: visible; }
            #invoice-content { position: absolute; top: 0; left: 0; width: 100%; }
          }
        `}</style>
      </div>
    </div>
  );
}
