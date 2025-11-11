// src/pages/billing/BillingDashboard.jsx

import Navbar from '../../components/shared/Navbar';
import { useBillingDashboard } from './hooks/useBillingDashBoard';

// Sections
import StatsSection from './sections/StatsSection';
import ActiveAdmissionsSection from './sections/ActiveAdmissionsSection';
import PendingBillsSection from './sections/PendingBillsSection';
import RecentBillsSection from './sections/RecentBillsSection';

// Modals
import GenerateBillModal from './components/GenerateBillModal';
import BillDetailsModal from './components/BillDetailsModal';
import PaymentModal from './components/PaymentModal';
import InvoiceModal from './components/InvoiceModal';

function BillingDashboard({ user, setUser }) {
  const {
    stats,
    activeAdmissions,
    pendingBills,
    recentBills,
    loading,
    activeView,
    showGenerateBillModal,
    showBillDetailsModal,
    showPaymentModal,
    showInvoiceModal,
    selectedAdmission,
    selectedBill,
    setActiveView,
    setShowGenerateBillModal,
    setShowBillDetailsModal,
    setShowPaymentModal,
    setShowInvoiceModal,
    openGenerateBillModal,
    openBillDetailsModal,
    openPaymentModal,
    openInvoiceModal,
    handleGenerateBill,
    handleProcessPayment,
    handleStatClick
  } = useBillingDashboard();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <Navbar user={user} setUser={setUser} />
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: 'calc(100vh - 80px)',
          fontSize: '18px',
          color: '#64748b'
        }}>
          Loading billing dashboard...
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar user={user} setUser={setUser} />
      
      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        padding: '32px 24px'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ 
            margin: '0 0 8px 0', 
            fontSize: '32px', 
            fontWeight: '700', 
            color: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            💰 Billing & Payments
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '16px' }}>
            Manage patient bills, process payments, and generate invoices
          </p>
        </div>

        {/* Stats Section */}
        <StatsSection 
          stats={stats} 
          activeView={activeView}
          onStatClick={handleStatClick}
        />

        {/* Navigation Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          marginBottom: '32px',
          borderBottom: '2px solid #e2e8f0',
          paddingBottom: '0'
        }}>
          {[
            { id: 'overview', label: '📊 Overview', icon: '📊' },
            { id: 'admissions', label: '🏥 Ready to Discharge', icon: '🏥', count: activeAdmissions.length },
            { id: 'pending', label: '⏳ Pending Payments', icon: '⏳', count: pendingBills.length },
            { id: 'history', label: '📋 Bill History', icon: '📋' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              style={{
                padding: '12px 24px',
                background: activeView === tab.id ? 'white' : 'transparent',
                color: activeView === tab.id ? '#3b82f6' : '#64748b',
                border: 'none',
                borderBottom: activeView === tab.id ? '3px solid #3b82f6' : '3px solid transparent',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s',
                position: 'relative',
                marginBottom: '-2px'
              }}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span style={{
                  marginLeft: '8px',
                  padding: '2px 8px',
                  background: activeView === tab.id ? '#3b82f6' : '#e2e8f0',
                  color: activeView === tab.id ? 'white' : '#64748b',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '700'
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content Based on Active View */}
        {activeView === 'overview' && (
          <>
            {/* Active Admissions */}
            {activeAdmissions.length > 0 && (
              <ActiveAdmissionsSection 
                activeAdmissions={activeAdmissions.slice(0, 5)}
                onGenerateBill={openGenerateBillModal}
              />
            )}

            {/* Pending Bills */}
            {pendingBills.length > 0 && (
              <PendingBillsSection 
                pendingBills={pendingBills.slice(0, 3)}
                onViewBill={openBillDetailsModal}
                onProcessPayment={openPaymentModal}
              />
            )}

            {/* Recent Bills */}
            <RecentBillsSection 
              recentBills={recentBills.slice(0, 10)}
              onViewBill={openBillDetailsModal}
              onPrintInvoice={openInvoiceModal}
            />
          </>
        )}

        {activeView === 'admissions' && (
          <ActiveAdmissionsSection 
            activeAdmissions={activeAdmissions}
            onGenerateBill={openGenerateBillModal}
          />
        )}

        {activeView === 'pending' && (
          <PendingBillsSection 
            pendingBills={pendingBills}
            onViewBill={openBillDetailsModal}
            onProcessPayment={openPaymentModal}
          />
        )}

        {activeView === 'history' && (
          <RecentBillsSection 
            recentBills={recentBills}
            onViewBill={openBillDetailsModal}
            onPrintInvoice={openInvoiceModal}
          />
        )}
      </div>

      {/* Modals */}
      {showGenerateBillModal && (
        <GenerateBillModal 
          admission={selectedAdmission}
          onClose={() => {
            setShowGenerateBillModal(false);
            setSelectedAdmission(null);
          }}
          onGenerate={handleGenerateBill}
        />
      )}

      {showBillDetailsModal && (
        <BillDetailsModal 
          bill={selectedBill}
          onClose={() => {
            setShowBillDetailsModal(false);
            setSelectedBill(null);
          }}
        />
      )}

      {showPaymentModal && (
        <PaymentModal 
          bill={selectedBill}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedBill(null);
          }}
          onProcessPayment={handleProcessPayment}
        />
      )}

      {showInvoiceModal && (
        <InvoiceModal 
          bill={selectedBill}
          onClose={() => {
            setShowInvoiceModal(false);
            setSelectedBill(null);
          }}
        />
      )}
    </div>
  );
}

export default BillingDashboard;
