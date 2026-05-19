import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useContracts } from '../hooks/useContracts'
import { useIpds } from '../hooks/useIpds'
import ContractTabs from '../components/ContractTabs'
import ContractKpiCards from '../components/ContractKpiCards'
import IpdTable from '../components/IpdTable'
import ContractFormModal from '../components/ContractFormModal'
import IpdFormModal from '../components/IpdFormModal'

export default function ContractDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const contractId = parseInt(id)

  const { contracts, loading: contractsLoading, addContract, updateContract, deleteContract } = useContracts()
  const { ipds, loading: ipdsLoading, totals, addIpd, updateIpd, deleteIpd } = useIpds(contractId)

  const contract = contracts.find(c => c.id === contractId)

  // Modal state
  const [contractModal, setContractModal] = useState(null)  // null | 'add' | contract object (edit)
  const [ipdModal, setIpdModal]           = useState(null)  // null | 'add' | ipd object (edit)
  const [confirmDelete, setConfirmDelete] = useState(null)  // null | { type, id, label }
  const [deleting, setDeleting]           = useState(false)

  if (contractsLoading) return (
    <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading...</div>
  )

  // ── Contract handlers ─────────────────────────────────────────────────────
  async function handleSaveContract(fields) {
    if (contractModal === 'add') {
      const created = await addContract(fields)
      setContractModal(null)
      navigate(`/contracts/${created.id}`)
    } else {
      await updateContract(contractModal.id, fields)
      setContractModal(null)
    }
  }

  async function handleDeleteContract() {
    setDeleting(true)
    try {
      await deleteContract(contractId)
      setConfirmDelete(null)
      const remaining = contracts.filter(c => c.id !== contractId)
      navigate(remaining.length > 0 ? `/contracts/${remaining[0].id}` : '/')
    } finally {
      setDeleting(false)
    }
  }

  // ── IPD handlers ──────────────────────────────────────────────────────────
  async function handleSaveIpd(fields) {
    if (ipdModal === 'add') {
      await addIpd(fields)
    } else {
      await updateIpd(ipdModal.id, fields)
    }
    setIpdModal(null)
  }

  async function handleDeleteIpd() {
    setDeleting(true)
    try {
      await deleteIpd(confirmDelete.id)
      setConfirmDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f9fafb' }}>

      {/* Sticky tabs + Add Contract button */}
      <ContractTabs
        contracts={contracts}
        onAddContract={() => setContractModal('add')}
      />

      {/* Content */}
      <div style={{ padding: '24px 28px', flex: 1 }}>

        {/* Contract header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: '#111827', margin: 0 }}>
              {contract?.name}
            </h1>
            <p style={{ fontSize: 13, color: '#9ca3af', margin: '4px 0 0' }}>
              Contract details & Industrial Projects (IPD)
            </p>
          </div>

          {contract && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setContractModal(contract)}
                style={{
                  fontSize: 12, padding: '7px 14px', borderRadius: 7,
                  background: '#fff', color: '#1F4E79',
                  border: '0.5px solid #bfdbfe', cursor: 'pointer', fontWeight: 500,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#EBF3FB' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}
              >
                Edit Contract
              </button>
              <button
                onClick={() => setConfirmDelete({ type: 'contract', id: contractId, label: contract.name })}
                style={{
                  fontSize: 12, padding: '7px 14px', borderRadius: 7,
                  background: '#fff', color: '#ef4444',
                  border: '0.5px solid #fca5a5', cursor: 'pointer', fontWeight: 500,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}
              >
                Delete Contract
              </button>
            </div>
          )}
        </div>

        {/* KPI cards */}
        <ContractKpiCards
          contract={contract}
          ipdTotals={totals}
          ipdCount={ipds.length}
        />

        {/* IPD table */}
        <IpdTable
          ipds={ipds}
          loading={ipdsLoading}
          onAddIpd={() => setIpdModal('add')}
          onEditIpd={(ipd) => setIpdModal(ipd)}
          onDeleteIpd={(ipdId) => {
            const ipd = ipds.find(i => i.id === ipdId)
            setConfirmDelete({ type: 'ipd', id: ipdId, label: `${ipd?.code} — ${ipd?.description}` })
          }}
        />
      </div>

      {/* ── Contract form modal ── */}
      {contractModal && (
        <ContractFormModal
          contract={contractModal === 'add' ? null : contractModal}
          onSave={handleSaveContract}
          onClose={() => setContractModal(null)}
        />
      )}

      {/* ── IPD form modal ── */}
      {ipdModal && (
        <IpdFormModal
          ipd={ipdModal === 'add' ? null : ipdModal}
          onSave={handleSaveIpd}
          onClose={() => setIpdModal(null)}
        />
      )}

      {/* ── Delete confirm modal ── */}
      {confirmDelete && (
        <div
          onClick={() => !deleting && setConfirmDelete(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 12, padding: 24, width: 380 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>
              Delete {confirmDelete.type === 'contract' ? 'Contract' : 'IPD'}?
            </h3>
            <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 6px' }}>
              <strong style={{ color: '#374151' }}>{confirmDelete.label}</strong>
            </p>
            {confirmDelete.type === 'contract' && (
              <p style={{ fontSize: 12, color: '#ef4444', margin: '0 0 20px', background: '#fef2f2', padding: '8px 10px', borderRadius: 6 }}>
                Semua IPD dalam contract ini juga akan dipadam. Tindakan tidak boleh dibatalkan.
              </p>
            )}
            {confirmDelete.type === 'ipd' && (
              <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 20px' }}>
                Tindakan ini tidak boleh dibatalkan.
              </p>
            )}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={deleting}
                style={{ fontSize: 13, padding: '7px 14px', borderRadius: 8, border: '0.5px solid #e5e7eb', background: '#fff', color: '#6b7280', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete.type === 'contract' ? handleDeleteContract : handleDeleteIpd}
                disabled={deleting}
                style={{ fontSize: 13, padding: '7px 16px', borderRadius: 8, background: deleting ? '#e5e7eb' : '#ef4444', color: '#fff', border: 'none', cursor: deleting ? 'not-allowed' : 'pointer', fontWeight: 500 }}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
