// src/pages/billing/components/InvoiceModal.jsx

import { formatDate, formatCurrency, formatBillNumber } from '../utils/Billinghelpers';

function InvoiceModal({ bill, onClose }) {
  if (!bill) return null;

  function handlePrint() {
    window.print();
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
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
        {/* Header with Actions */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          background: 'white',
          zIndex: 1
        }} className="no-print">
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#1e293b' }}>
            📄 Invoice Preview
          </h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handlePrint}
              style={{
                padding: '10px 20px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
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
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              Close
            </button>
          </div>
        </div>

        {/* Invoice Content (Printable) */}
        <div id="invoice-content" style={{ padding: '40px', background: 'white' }}>
          {/* Hospital Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px', borderBottom: '3px solid #3b82f6', paddingBottom: '20px' }}>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', color: '#1e293b' }}>🏥 City Hospital</h1>
            <p style={{ margin: '0 0 4px 0', color: '#64748b' }}>123 Health Street, Medical District, Mumbai - 400001</p>
            <p style={{ margin: 0, color: '#64748b' }}>Phone: +91-22-12345678 | Email: billing@cityhospital.com</p>
          </div>

          {/* Invoice Title */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', color: '#3b82f6', fontWeight: '700' }}>HOSPITAL INVOICE</h2>
            <p style={{ margin: 0, fontSize: '18px', color: '#64748b', fontWeight: '600' }}>{formatBillNumber(bill.bill_id)}</p>
          </div>

          {/* Bill Info Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
            {/* Patient Info */}
            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>
                Bill To
              </h3>
              <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>{bill.patient_name}</p>
                <p style={{ margin: '0 0 4px 0', color: '#64748b' }}>Patient ID: {bill.patient_id}</p>
                <p style={{ margin: '0 0 4px 0', color: '#64748b' }}>Age: {bill.age}y • {bill.gender}</p>
                <p style={{ margin: 0, color: '#64748b' }}>Contact: {bill.contact}</p>
              </div>
            </div>

            {/* Bill Details */}
            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>
                Bill Details
              </h3>
              <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
                <p style={{ margin: '0 0 8px 0', color: '#64748b' }}>Bill Date: <strong style={{ color: '#1e293b' }}>{formatDate(bill.bill_date)}</strong></p>
                <p style={{ margin: '0 0 8px 0', color: '#64748b' }}>Admission: <strong style={{ color: '#1e293b' }}>{formatDate(bill.admission_date)}</strong></p>
                <p style={{ margin: '0 0 8px 0', color: '#64748b' }}>Discharge: <strong style={{ color: '#1e293b' }}>{formatDate(bill.discharge_date)}</strong></p>
                <p style={{ margin: 0, color: '#64748b' }}>Total Days: <strong style={{ color: '#1e293b' }}>{bill.total_days} days</strong></p>
              </div>
            </div>
          </div>

          {/* Admission Details */}
          <div style={{ marginBottom: '32px', padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>Ward</p>
                <p style={{ margin: 0, fontWeight: '600', color: '#1e293b' }}>{bill.ward_name}</p>
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>Bed Number</p>
                <p style={{ margin: 0, fontWeight: '600', color: '#1e293b' }}>Bed {bill.bed_number}</p>
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>Attending Doctor</p>
                <p style={{ margin: 0, fontWeight: '600', color: '#1e293b' }}>Dr. {bill.doctor_name}</p>
              </div>
            </div>
          </div>

          {/* Bill Items Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontWeight: '700' }}>Description</th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontWeight: '700' }}>Quantity</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontWeight: '700' }}>Rate</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontWeight: '700' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {bill.items && bill.items.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px', color: '#1e293b' }}>{item.item_name}</td>
                  <td style={{ padding: '12px', textAlign: 'center', color: '#64748b' }}>{item.quantity}</td>
                  <td style={{ padding: '12px', textAlign: 'right', color: '#64748b' }}>{formatCurrency(item.unit_price)}</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#1e293b' }}>{formatCurrency(item.total_price)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div style={{ marginLeft: 'auto', maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
              <p style={{ margin: 0, color: '#64748b' }}>Subtotal</p>
              <p style={{ margin: 0, fontWeight: '600', color: '#1e293b' }}>{formatCurrency(bill.subtotal)}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
              <p style={{ margin: 0, color: '#64748b' }}>Tax (18% GST)</p>
              <p style={{ margin: 0, fontWeight: '600', color: '#1e293b' }}>{formatCurrency(bill.tax_amount)}</p>
            </div>
            {bill.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
                <p style={{ margin: 0, color: '#16a34a' }}>Discount</p>
                <p style={{ margin: 0, fontWeight: '600', color: '#16a34a' }}>- {formatCurrency(bill.discount)}</p>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: '#dbeafe', borderRadius: '8px', marginTop: '12px' }}>
              <p style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e40af' }}>TOTAL AMOUNT</p>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1e40af' }}>{formatCurrency(bill.total_amount)}</p>
            </div>
          </div>

          {/* Payment Status */}
          {bill.payment_status === 'paid' && (
            <div style={{ marginTop: '32px', padding: '20px', background: '#dcfce7', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '700', color: '#166534' }}>✅ PAID IN FULL</p>
              <p style={{ margin: 0, color: '#166534' }}>Payment Method: {bill.payment_method} | Date: {formatDate(bill.payment_date)}</p>
            </div>
          )}

          {/* Footer */}
          <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '2px solid #e2e8f0', textAlign: 'center' }}>
            <p style={{ margin: '0 0 8px 0', color: '#1e293b', fontWeight: '600' }}>Thank you for choosing City Hospital!</p>
            <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>This is a computer-generated invoice. No signature required.</p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body * {
            visibility: hidden;
          }
          #invoice-content, #invoice-content * {
            visibility: visible;
          }
          #invoice-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default InvoiceModal;
