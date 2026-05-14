import { useState, useEffect } from 'react'
import { useContracts } from '../hooks/useContracts'
import { useIcvTracker } from '../hooks/useIcvTracker'
import MilestoneTable from '../components/MilestoneTable'

const FIELD_STYLE = {
  width: '100%', fontSize: 13, padding: '7px 10px',
  border: '1px solid #e5e7eb', borderRadius: 6, outline: 'none',
  boxSizing: 'border-box', background: '#fff',
}

// ─── Add IPD Modal ────────────────────────────────────────────────────────────
function AddIpdModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    code: '', description: '', beneficiary: '',
    project_category: '', category_type: '',
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  function field(key) {
    return {
      value: form[key],
      onChange: e => setForm(prev => ({ ...prev, [key]: e.target.value })),
      onFocus: e => e.target.style.borderColor = '#1F4E79',
      onBlur: e => e.target.style.borderColor = '#e5e7eb',
      style: FIELD_STYLE,
    }
  }

  async function handleSave() {
    if (!form.code.trim() || !form.description.trim()) {
      setErr('Code and Description are required.')
      return
    }
    setSaving(true)
    try {
      await onSave(form)
      onClose()
    } catch (e) {
      setErr(e.message || 'Failed to save.')
    }
    setSaving(false)
  }

  function Label({ children }) {
    return (
      <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 500, display: 'block', marginBottom: 4 }}>
        {children}
      </label>
    )
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}>
      <div style={{
        background: '#fff', borderRadius: 12, padding: 28,
        width: 440, boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
      }}>
        <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600, color: '#111827' }}>
          Add IPD
        </h3>

        <div style={{ marginBottom: 14 }}>
          <Label>Code *</Label>
          <input {...field('code')} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <Label>Description *</Label>
          <input {...field('description')} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <Label>Beneficiary</Label>
          <input {...field('beneficiary')} />
        </div>

        {/* Two-column row */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <Label>Project Category</Label>
            <select
              value={form.project_category}
              onChange={e => setForm(prev => ({ ...prev, project_category: e.target.value }))}
              style={{ ...FIELD_STYLE, color: form.project_category ? '#111827' : '#9ca3af' }}
            >
              <option value="">— Select —</option>
              <option value="Essential">Essential</option>
              <option value="Strategic">Strategic</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <Label>Submission Number</Label>
            <input {...field('category_type')} placeholder="e.g. SUB-001" />
          </div>
        </div>

        {err && <p style={{ fontSize: 12, color: '#ef4444', margin: '0 0 12px' }}>{err}</p>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
          <button
            onClick={onClose}
            style={{
              fontSize: 13, padding: '7px 16px', borderRadius: 6,
              background: '#f3f4f6', color: '#374151', border: 'none', cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              fontSize: 13, padding: '7px 16px', borderRadius: 6,
              background: '#1F4E79', color: '#fff', border: 'none',
              cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 500,
            }}
          >
            {saving ? 'Saving…' : 'Save IPD'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Edit IPD Modal ───────────────────────────────────────────────────────────
function EditIpdModal({ ipd, onClose, onSave }) {
  const [form, setForm] = useState({
    code: ipd.code ?? '',
    description: ipd.description ?? '',
    beneficiary: ipd.beneficiary ?? '',
    project_category: ipd.project_category ?? '',
    category_type: ipd.category_type ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  function field(key) {
    return {
      value: form[key],
      onChange: e => setForm(prev => ({ ...prev, [key]: e.target.value })),
      onFocus: e => e.target.style.borderColor = '#1F4E79',
      onBlur: e => e.target.style.borderColor = '#e5e7eb',
      style: FIELD_STYLE,
    }
  }

  async function handleSave() {
    if (!form.code.trim() || !form.description.trim()) {
      setErr('Code and Description are required.')
      return
    }
    setSaving(true)
    try {
      await onSave(ipd.id, form)
      onClose()
    } catch (e) {
      setErr(e.message || 'Failed to save.')
    }
    setSaving(false)
  }

  function Label({ children }) {
    return (
      <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 500, display: 'block', marginBottom: 4 }}>
        {children}
      </label>
    )
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}>
      <div style={{
        background: '#fff', borderRadius: 12, padding: 28,
        width: 440, boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
      }}>
        <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600, color: '#111827' }}>
          Edit IPD
        </h3>
        <p style={{ margin: '0 0 20px', fontSize: 12, color: '#9ca3af' }}>
          {ipd.code} — {ipd.description}
        </p>

        <div style={{ marginBottom: 14 }}>
          <Label>Code *</Label>
          <input {...field('code')} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <Label>Description *</Label>
          <input {...field('description')} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <Label>Beneficiary</Label>
          <input {...field('beneficiary')} />
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <Label>Project Category</Label>
            <select
              value={form.project_category}
              onChange={e => setForm(prev => ({ ...prev, project_category: e.target.value }))}
              style={{ ...FIELD_STYLE, color: form.project_category ? '#111827' : '#9ca3af' }}
            >
              <option value="">— Select —</option>
              <option value="Essential">Essential</option>
              <option value="Strategic">Strategic</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <Label>Submission Number</Label>
            <input {...field('category_type')} placeholder="e.g. SUB-001" />
          </div>
        </div>

        {err && <p style={{ fontSize: 12, color: '#ef4444', margin: '0 0 12px' }}>{err}</p>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
          <button
            onClick={onClose}
            style={{
              fontSize: 13, padding: '7px 16px', borderRadius: 6,
              background: '#f3f4f6', color: '#374151', border: 'none', cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              fontSize: 13, padding: '7px 16px', borderRadius: 6,
              background: '#1F4E79', color: '#fff', border: 'none',
              cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 500,
            }}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Export helper ────────────────────────────────────────────────────────────
function exportToExcel(ipd, milestones) {
  const headers = [
    'Description', 'Est. Nominal Value', 'Actual Nominal Value', 'Multiplier',
    'Est. Plan ICV', 'Actual ICV', 'Submit Date', 'Approved Date',
    'Claim Notes', 'Total ICV Approved', 'Balance ICV', 'Payment Planning', 'Status',
  ]

  function calcRow(m) {
    const est = parseFloat(m.est_nominal_value) || 0
    const actual = parseFloat(m.actual_nominal_value) || 0
    const mult = parseFloat(m.multiplier) || 0
    const approved = parseFloat(m.total_icv_approved) || 0
    return {
      est_plan_icv: est * mult,
      actual_icv: actual * mult,
      balance_icv: est * mult - approved,
    }
  }

  const rows = milestones.map(m => {
    const c = calcRow(m)
    return [
      m.milestone_desc, m.est_nominal_value, m.actual_nominal_value, m.multiplier,
      c.est_plan_icv.toFixed(2), c.actual_icv.toFixed(2),
      m.submit_date, m.approved_date, m.submit_notes,
      m.total_icv_approved, c.balance_icv.toFixed(2),
      m.payment_planning, m.status_project,
    ]
  })

  const csvRows = [
    [`IPD: ${ipd.code} — ${ipd.description}`],
    headers,
    ...rows,
  ]
  const csv = csvRows.map(r => r.map(v => `"${v ?? ''}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ICV_${ipd.code}_milestones.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function IcvTracker() {
  const { contracts, loading: contractsLoading } = useContracts()
  const [selectedContractId, setSelectedContractId] = useState(null)
  const [selectedIpdId, setSelectedIpdId] = useState(null)
  const [showAddIpd, setShowAddIpd] = useState(false)
  const [ipdToEdit, setIpdToEdit] = useState(null)

  const {
    ipds, milestones, loading: ipdsLoading, milestonesLoading,
    fetchMilestones, addIpd, updateIpd, deleteIpd, addMilestone, updateMilestone, deleteMilestone,
  } = useIcvTracker(selectedContractId)

  async function handleDeleteIpd(ipdId) {
    if (!window.confirm('Delete this IPD and all its milestones? This cannot be undone.')) return
    try {
      await deleteIpd(ipdId)
      // selectedIpdId will be cleared by the useEffect that watches ipds
    } catch (e) {
      console.error(e)
    }
  }

  // Auto-select first contract once loaded
  useEffect(() => {
    if (!contractsLoading && contracts.length > 0 && !selectedContractId) {
      setSelectedContractId(contracts[0].id)
    }
  }, [contracts, contractsLoading, selectedContractId])

  // Auto-select first IPD when contract or IPD list changes
  useEffect(() => {
    if (ipds.length > 0) {
      const first = ipds[0]
      setSelectedIpdId(first.id)
      if (!milestones[first.id]) fetchMilestones(first.id)
    } else {
      setSelectedIpdId(null)
    }
  }, [ipds])

  function selectIpd(ipd) {
    setSelectedIpdId(ipd.id)
    if (!milestones[ipd.id]) fetchMilestones(ipd.id)
  }

  const selectedIpd = ipds.find(i => i.id === selectedIpdId)
  const currentMilestones = selectedIpd ? (milestones[selectedIpd.id] || []) : []

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>

      {/* ── Left: Contract list sidebar ── */}
      <div style={{
        width: 220, minWidth: 220, background: '#fff',
        borderRight: '0.5px solid #e5e7eb', display: 'flex', flexDirection: 'column',
        paddingTop: 0,
      }}>
        <div style={{
          padding: '16px 16px 10px',
          borderBottom: '0.5px solid #e5e7eb',
        }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Contracts
          </span>
        </div>

        {contractsLoading ? (
          <div style={{ padding: 16, fontSize: 12, color: '#9ca3af' }}>Loading…</div>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {contracts.map(c => {
              const active = c.id === selectedContractId
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedContractId(c.id)
                    setSelectedIpdId(null)
                  }}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '11px 16px', border: 'none', cursor: 'pointer',
                    background: active ? '#EBF3FB' : 'transparent',
                    borderLeft: active ? '3px solid #1F4E79' : '3px solid transparent',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f8fafc' }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
                >
                  <div style={{
                    fontSize: 12, fontWeight: active ? 600 : 500,
                    color: active ? '#1F4E79' : '#374151',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {c.name}
                  </div>
                  {c.contract_number && (
                    <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>
                      {c.contract_number}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Right: IPD tabs + milestone table ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top bar */}
        <div style={{
          background: '#fff', borderBottom: '0.5px solid #e5e7eb',
          padding: '0 24px', display: 'flex', alignItems: 'center', gap: 0,
          minHeight: 48, flexWrap: 'nowrap', overflowX: 'auto',
        }}>
          {ipdsLoading ? (
            <span style={{ fontSize: 12, color: '#9ca3af', padding: '14px 0' }}>Loading IPDs…</span>
          ) : ipds.length === 0 ? (
            <span style={{ fontSize: 12, color: '#9ca3af', padding: '14px 0' }}>
              No IPDs — click "+ Add IPD" to create one.
            </span>
          ) : (
            ipds.map(ipd => {
              const active = ipd.id === selectedIpdId
              return (
                <button
                  key={ipd.id}
                  onClick={() => selectIpd(ipd)}
                  style={{
                    padding: '0 18px', height: 48, border: 'none',
                    background: 'none', cursor: 'pointer', fontSize: 13,
                    fontWeight: active ? 600 : 400,
                    color: active ? '#1F4E79' : '#6b7280',
                    borderBottom: active ? '2px solid #1F4E79' : '2px solid transparent',
                    whiteSpace: 'nowrap', transition: 'color 0.12s',
                  }}
                >
                  {ipd.code}
                </button>
              )
            })
          )}

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, padding: '8px 0' }}>
            {selectedIpd && (
              <button
                onClick={() => exportToExcel(selectedIpd, currentMilestones)}
                style={{
                  fontSize: 12, padding: '5px 12px', borderRadius: 6,
                  background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0',
                  cursor: 'pointer', fontWeight: 500, whiteSpace: 'nowrap',
                }}
              >
                ↓ Export CSV
              </button>
            )}
            <button
              onClick={() => setShowAddIpd(true)}
              style={{
                fontSize: 12, padding: '5px 12px', borderRadius: 6,
                background: '#1F4E79', color: '#fff', border: 'none',
                cursor: 'pointer', fontWeight: 500, whiteSpace: 'nowrap',
              }}
            >
              + Add IPD
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {!selectedContractId ? (
            <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13, paddingTop: 60 }}>
              Select a contract to view ICV milestones.
            </div>
          ) : !selectedIpd ? (
            <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13, paddingTop: 60 }}>
              {ipdsLoading ? 'Loading…' : 'No IPD selected.'}
            </div>
          ) : milestonesLoading ? (
            <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13, paddingTop: 60 }}>
              Loading milestones…
            </div>
          ) : (
            <MilestoneTable
              ipd={selectedIpd}
              milestones={currentMilestones}
              onAdd={fields => addMilestone(selectedIpd.id, fields)}
              onUpdate={(milestoneId, fields) => updateMilestone(selectedIpd.id, milestoneId, fields)}
              onDelete={milestoneId => deleteMilestone(selectedIpd.id, milestoneId)}
              onUpdateIpd={updateIpd}
              onDeleteIpd={handleDeleteIpd}
              onEditIpd={setIpdToEdit}
            />
          )}
        </div>
      </div>

      {showAddIpd && (
        <AddIpdModal
          onClose={() => setShowAddIpd(false)}
          onSave={addIpd}
        />
      )}

      {ipdToEdit && (
        <EditIpdModal
          ipd={ipdToEdit}
          onClose={() => setIpdToEdit(null)}
          onSave={updateIpd}
        />
      )}
    </div>
  )
}
