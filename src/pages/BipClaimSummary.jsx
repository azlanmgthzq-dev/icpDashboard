import { useState, useEffect, Fragment } from 'react'
import * as XLSX from 'xlsx'
import { supabase } from '../lib/supabase'
import { useContracts } from '../hooks/useContracts'
import { useIcvTracker } from '../hooks/useIcvTracker'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n) {
  if (n === null || n === undefined || n === '') return '—'
  const num = Number(n)
  if (isNaN(num)) return '—'
  if (Math.abs(num) >= 1e6) return `RM ${(num / 1e6).toFixed(2)}M`
  return `RM ${num.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const STATUS_BADGE = {
  Approved: { bg: '#dcfce7', color: '#166534' },
  Pending:  { bg: '#fef3c7', color: '#92400e' },
  Rejected: { bg: '#fee2e2', color: '#991b1b' },
}

function StatusBadge({ status }) {
  const s = STATUS_BADGE[status] || { bg: '#f3f4f6', color: '#6b7280' }
  return (
    <span style={{
      fontSize: 10, padding: '2px 8px', borderRadius: 10,
      background: s.bg, color: s.color, fontWeight: 600, whiteSpace: 'nowrap',
    }}>
      {status || 'Pending'}
    </span>
  )
}

const STATUS_OPTS = ['Pending', 'Approved', 'Rejected']

const FIELD_STYLE = {
  width: '100%', fontSize: 12, padding: '6px 9px',
  border: '1px solid #e5e7eb', borderRadius: 5, outline: 'none',
  boxSizing: 'border-box', background: '#fff',
}

// ─── Claim Submission Manager ─────────────────────────────────────────────────

function ClaimSubmissionManager({ submissions, contractId, ipdId, onAdd, onUpdate, onDelete }) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    submission_no: '', submission_date: '', status: 'Pending', claim_form_link: '', title: '',
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  function resetForm() {
    setForm({ submission_no: '', submission_date: '', status: 'Pending', claim_form_link: '', title: '' })
    setErr('')
  }

  function startEdit(sub) {
    setEditingId(sub.id)
    setForm({
      submission_no: sub.submission_no || '',
      submission_date: sub.submission_date || '',
      status: sub.status || 'Pending',
      claim_form_link: sub.claim_form_link || '',
      title: sub.title || '',
    })
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.submission_no.trim()) { setErr('Submission No. is required.'); return }
    setSaving(true)
    try {
      if (editingId) {
        await onUpdate(editingId, form)
      } else {
        await onAdd({ ...form, contract_id: contractId, ipd_id: ipdId })
      }
      setShowForm(false)
      setEditingId(null)
      resetForm()
    } catch (e) {
      setErr(e.message || 'Failed to save.')
    }
    setSaving(false)
  }

  function handleCancel() {
    setShowForm(false)
    setEditingId(null)
    resetForm()
  }

  async function handleDelete(sub) {
    if (!window.confirm(`Delete submission ${sub.submission_no}?`)) return
    try { await onDelete(sub.id, contractId, ipdId) } catch (e) { console.error(e) }
  }

  return (
    <div style={{
      background: '#fff', border: '0.5px solid #e5e7eb', borderRadius: 10,
      marginBottom: 20, overflow: 'hidden',
    }}>
      <div style={{
        padding: '12px 18px', background: '#f8fafc', borderBottom: '0.5px solid #e5e7eb',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#1F4E79' }}>Claim Submissions</span>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); resetForm() }}
          style={{
            fontSize: 11, padding: '4px 10px', borderRadius: 5,
            background: '#1F4E79', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 500,
          }}
        >
          + New Submission
        </button>
      </div>

      {submissions.length === 0 && !showForm ? (
        <div style={{ padding: '14px 18px', fontSize: 12, color: '#9ca3af' }}>
          No submissions yet for this IPD.
        </div>
      ) : (
        <div style={{ padding: '10px 18px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {submissions.map(sub => (
            <div
              key={sub.id}
              style={{
                border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px',
                background: '#fafafa', minWidth: 180,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#1F4E79' }}>
                  {sub.submission_no}
                </span>
                <StatusBadge status={sub.status} />
              </div>
              {sub.title && (
                <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 3 }}>
                  {sub.title}
                </div>
              )}
              {sub.submission_date && (
                <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 3 }}>
                  {new Date(sub.submission_date).toLocaleDateString('en-MY')}
                </div>
              )}
              {sub.claim_form_link && (
                <a
                  href={sub.claim_form_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 11, color: '#185FA5', textDecoration: 'none' }}
                >
                  📎 {sub.title || 'Document'}
                </a>
              )}
              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                <button
                  onClick={() => startEdit(sub)}
                  style={{
                    fontSize: 10, padding: '2px 7px', borderRadius: 4,
                    border: '1px solid #bfdbfe', background: '#EBF3FB',
                    color: '#185FA5', cursor: 'pointer',
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(sub)}
                  style={{
                    fontSize: 10, padding: '2px 7px', borderRadius: 4,
                    border: '1px solid #fca5a5', background: '#fef2f2',
                    color: '#ef4444', cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div style={{ padding: '12px 18px', borderTop: '0.5px solid #e5e7eb', background: '#f8fafc' }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
            <div style={{ flex: '0 0 110px' }}>
              <label style={{ fontSize: 11, color: '#6b7280', display: 'block', marginBottom: 3 }}>
                Submission No. *
              </label>
              <input
                value={form.submission_no}
                onChange={e => setForm(p => ({ ...p, submission_no: e.target.value }))}
                placeholder="e.g. C1"
                style={FIELD_STYLE}
              />
            </div>
            <div style={{ flex: '0 0 140px' }}>
              <label style={{ fontSize: 11, color: '#6b7280', display: 'block', marginBottom: 3 }}>Date</label>
              <input
                type="date"
                value={form.submission_date}
                onChange={e => setForm(p => ({ ...p, submission_date: e.target.value }))}
                style={FIELD_STYLE}
              />
            </div>
            <div style={{ flex: '0 0 120px' }}>
              <label style={{ fontSize: 11, color: '#6b7280', display: 'block', marginBottom: 3 }}>Status</label>
              <select
                value={form.status}
                onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                style={FIELD_STYLE}
              >
                {STATUS_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ fontSize: 11, color: '#6b7280', display: 'block', marginBottom: 3 }}>
                Document / Attachment Link
              </label>
              <input
                value={form.claim_form_link}
                onChange={e => setForm(p => ({ ...p, claim_form_link: e.target.value }))}
                placeholder="https://..."
                style={FIELD_STYLE}
              />
            </div>
            <div style={{ flex: '1 1 180px' }}>
              <label style={{ fontSize: 11, color: '#6b7280', display: 'block', marginBottom: 3 }}>Title</label>
              <input
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Credit Claim Form, Implementation Report, Claim Report"
                style={FIELD_STYLE}
              />
            </div>
          </div>
          {err && <div style={{ fontSize: 11, color: '#ef4444', marginBottom: 8 }}>{err}</div>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                fontSize: 12, padding: '5px 14px', borderRadius: 5,
                background: '#1F4E79', color: '#fff', border: 'none',
                cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 500,
              }}
            >
              {saving ? 'Saving…' : (editingId ? 'Update' : 'Save')}
            </button>
            <button
              onClick={handleCancel}
              style={{
                fontSize: 12, padding: '5px 14px', borderRadius: 5,
                background: '#f3f4f6', color: '#374151', border: 'none', cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Summary Table ────────────────────────────────────────────────────────────

function SubmissionGroups({ sortedGroupKeys, groups, submissions }) {
  const thStyle = {
    padding: '8px 10px', textAlign: 'left', fontWeight: 500,
    color: '#6b7280', fontSize: 11, whiteSpace: 'nowrap',
    borderBottom: '0.5px solid #e5e7eb', background: '#f9fafb',
  }
  const tdBase = { padding: '8px 10px', verticalAlign: 'middle', borderBottom: '0.5px solid #f3f4f6' }

  let grandTotalAmt = 0
  let grandTotalIcv = 0
  const sections = sortedGroupKeys.map(subNo => {
    const rows = groups[subNo]
    const subRecord = submissions.find(s => s.submission_no === subNo) || null
    const groupAmt = rows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0)
    const groupIcv = rows.reduce((s, r) => s + (r.icv_value || 0), 0)
    grandTotalAmt += groupAmt
    grandTotalIcv += groupIcv
    return { subNo, rows, subRecord, groupAmt, groupIcv }
  })

  return (
    <div style={{ background: '#fff', border: '0.5px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, minWidth: 220 }}>Milestone Description</th>
              <th style={{ ...thStyle, minWidth: 100 }}>Submission No.</th>
              <th style={{ ...thStyle, minWidth: 180 }}>Vendor Name</th>
              <th style={{ ...thStyle, minWidth: 130, textAlign: 'right' }}>Vendor Amount (RM)</th>
              <th style={{ ...thStyle, minWidth: 90, textAlign: 'right' }}>Multiplier</th>
              <th style={{ ...thStyle, minWidth: 130, textAlign: 'right' }}>ICV Value (RM)</th>
              <th style={{ ...thStyle, minWidth: 80, textAlign: 'center' }}>Invoice</th>
            </tr>
          </thead>
          <tbody>
            {sortedGroupKeys.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  style={{ padding: '36px 16px', textAlign: 'center', color: '#9ca3af', fontSize: 12 }}
                >
                  No vendor records found. Add vendors via the 📎 Vendors button in Milestone Tracker.
                </td>
              </tr>
            )}

            {sections.map(({ subNo, rows, subRecord, groupAmt, groupIcv }) => (
              <Fragment key={subNo}>
                {/* Submission group header band */}
                <tr style={{ background: '#1F4E79' }}>
                  <td colSpan={7} style={{ padding: '8px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                      <span style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>
                        Submission {subNo}
                      </span>
                      {subRecord?.submission_date && (
                        <span style={{ color: '#93c5fd', fontSize: 11 }}>
                          {new Date(subRecord.submission_date).toLocaleDateString('en-MY')}
                        </span>
                      )}
                      {subRecord ? (
                        <StatusBadge status={subRecord.status || 'Pending'} />
                      ) : (
                        <span style={{ fontSize: 10, color: '#64748b', fontStyle: 'italic' }}>
                          No claim submission linked
                        </span>
                      )}
                      {subRecord?.claim_form_link && (
                        <a
                          href={subRecord.claim_form_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: 11, color: '#bfdbfe', textDecoration: 'none',
                            border: '1px solid rgba(191,219,254,0.4)', borderRadius: 4,
                            padding: '1px 8px',
                          }}
                        >
                          📎 {subRecord.title || 'Document'}
                        </a>
                      )}
                    </div>
                  </td>
                </tr>

                {/* Vendor rows */}
                {rows.map((row, idx) => (
                  <tr
                    key={row.id || idx}
                    style={{ borderBottom: '0.5px solid #f3f4f6' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc' }}
                    onMouseLeave={e => { e.currentTarget.style.background = '' }}
                  >
                    <td style={{
                      ...tdBase, color: '#374151',
                      maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {row.milestone_desc || '—'}
                    </td>
                    <td style={{ ...tdBase, color: '#6b7280' }}>{subNo}</td>
                    <td style={{ ...tdBase, color: '#374151' }}>{row.vendor_name || '—'}</td>
                    <td style={{ ...tdBase, textAlign: 'right', color: '#374151', fontWeight: 500 }}>
                      {fmt(row.amount)}
                    </td>
                    <td style={{ ...tdBase, textAlign: 'right', color: '#6b7280' }}>
                      {row.multiplier !== undefined && row.multiplier !== null ? row.multiplier : '—'}
                    </td>
                    <td style={{ ...tdBase, textAlign: 'right', color: '#185FA5', fontWeight: 600 }}>
                      {fmt(row.icv_value)}
                    </td>
                    <td style={{ ...tdBase, textAlign: 'center' }}>
                      {row.invoice_link ? (
                        <a
                          href={row.invoice_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#185FA5', textDecoration: 'none', fontSize: 16 }}
                        >
                          🔗
                        </a>
                      ) : (
                        <span style={{ color: '#d1d5db' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}

                {/* Subtotal row */}
                <tr style={{ background: '#dbeafe', borderBottom: '1px solid #bfdbfe' }}>
                  <td
                    colSpan={3}
                    style={{ padding: '7px 10px', fontSize: 11, fontWeight: 600, color: '#1e40af' }}
                  >
                    Subtotal — {subNo}
                  </td>
                  <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 700, color: '#1F4E79' }}>
                    {fmt(groupAmt)}
                  </td>
                  <td />
                  <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 700, color: '#1F4E79' }}>
                    {fmt(groupIcv)}
                  </td>
                  <td />
                </tr>
              </Fragment>
            ))}

            {/* Grand total */}
            {sortedGroupKeys.length > 0 && (
              <tr style={{ background: '#1F4E79' }}>
                <td
                  colSpan={3}
                  style={{ padding: '10px 14px', fontWeight: 700, color: '#fff', fontSize: 13 }}
                >
                  Grand Total
                </td>
                <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: '#fff', fontSize: 13 }}>
                  {fmt(grandTotalAmt)}
                </td>
                <td />
                <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: '#fff', fontSize: 13 }}>
                  {fmt(grandTotalIcv)}
                </td>
                <td />
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Export helper ────────────────────────────────────────────────────────────

function exportToExcel(ipd, groups, submissions) {
  const wb = XLSX.utils.book_new()
  const header = [
    'Milestone Description', 'Submission No.', 'Vendor Name',
    'Vendor Amount (RM)', 'Multiplier', 'ICV Value (RM)', 'Invoice Link',
  ]
  const sheetData = [
    [`BIP Claim Summary — ${ipd.code}: ${ipd.description}`],
    [],
    header,
  ]

  const sortedKeys = Object.keys(groups).sort()
  let totalAmt = 0
  let totalIcv = 0

  sortedKeys.forEach(subNo => {
    const rows = groups[subNo]
    const sub = submissions.find(s => s.submission_no === subNo)
    const headerLine = [
      `Submission ${subNo}`,
      sub?.submission_date ? new Date(sub.submission_date).toLocaleDateString('en-MY') : '',
      sub?.status || '',
    ]
    sheetData.push(headerLine)

    let groupAmt = 0
    let groupIcv = 0
    rows.forEach(r => {
      const amt = parseFloat(r.amount) || 0
      const icv = r.icv_value || 0
      groupAmt += amt
      groupIcv += icv
      sheetData.push([r.milestone_desc, subNo, r.vendor_name, amt, r.multiplier, icv, r.invoice_link || ''])
    })
    totalAmt += groupAmt
    totalIcv += groupIcv
    sheetData.push(['', `Subtotal ${subNo}`, '', groupAmt, '', groupIcv, ''])
    sheetData.push([])
  })

  sheetData.push(['Grand Total', '', '', totalAmt, '', totalIcv, ''])

  const ws = XLSX.utils.aoa_to_sheet(sheetData)
  ws['!cols'] = [
    { wch: 30 }, { wch: 14 }, { wch: 25 },
    { wch: 18 }, { wch: 12 }, { wch: 18 }, { wch: 30 },
  ]
  XLSX.utils.book_append_sheet(wb, ws, 'BIP Claim Summary')
  XLSX.writeFile(wb, `BIP_Claim_${ipd.code}.xlsx`)
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BipClaimSummary() {
  const { contracts, loading: contractsLoading } = useContracts()
  const [selectedContractId, setSelectedContractId] = useState(null)
  const [selectedIpdId, setSelectedIpdId] = useState(null)
  const [ipdVendors, setIpdVendors] = useState([])
  const [vendorLoading, setVendorLoading] = useState(false)

  const {
    ipds, milestones, claimSubmissions,
    loading: ipdsLoading, milestonesLoading,
    fetchMilestones, fetchClaimSubmissions,
    addClaimSubmission, updateClaimSubmission, deleteClaimSubmission,
  } = useIcvTracker(selectedContractId)

  // Auto-select first contract
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
      setIpdVendors([])
    }
  }, [ipds])

  // Load vendors when milestones for selected IPD are available
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const ipdMilestones = milestones[selectedIpdId]
    if (!selectedIpdId || !ipdMilestones) return

    const ids = ipdMilestones.map(m => m.id)
    if (!ids.length) { setIpdVendors([]); return }

    setVendorLoading(true)
    supabase
      .from('milestone_vendors')
      .select('*')
      .in('milestone_id', ids)
      .order('created_at')
      .then(({ data }) => {
        setIpdVendors(data || [])
        setVendorLoading(false)
      })
  }, [selectedIpdId, milestones[selectedIpdId]])

  // Load claim submissions when IPD changes
  useEffect(() => {
    if (selectedContractId && selectedIpdId) {
      fetchClaimSubmissions(selectedContractId, selectedIpdId)
    }
  }, [selectedContractId, selectedIpdId])

  function selectIpd(ipd) {
    setSelectedIpdId(ipd.id)
    setIpdVendors([])
    if (!milestones[ipd.id]) fetchMilestones(ipd.id)
  }

  const selectedIpd = ipds.find(i => i.id === selectedIpdId)
  const ipdMilestones = milestones[selectedIpdId] || []
  const parentsById = {}
  ipdMilestones.filter(m => !m.parent_milestone_id).forEach(p => { parentsById[p.id] = p })

  // Flat summary rows: join vendor records with milestone multiplier
  const summaryRows = ipdVendors.map(vendor => {
    const milestone = ipdMilestones.find(m => m.id === vendor.milestone_id)
    if (!milestone) return null
    const parent = milestone.parent_milestone_id ? parentsById[milestone.parent_milestone_id] : null
    const mult = parseFloat(parent ? parent.multiplier : milestone.multiplier) || 0
    const amount = parseFloat(vendor.amount) || 0
    return {
      ...vendor,
      milestone_desc: milestone.milestone_desc || parent?.milestone_desc || '',
      multiplier: mult,
      icv_value: amount * mult,
    }
  }).filter(Boolean)

  // Group by submission_no
  const groups = {}
  summaryRows.forEach(row => {
    const key = row.submission_no || '(unassigned)'
    if (!groups[key]) groups[key] = []
    groups[key].push(row)
  })

  const submissionsKey = `${selectedContractId}_${selectedIpdId}`
  const submissions = claimSubmissions[submissionsKey] || []

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>

      {/* ── Left: Contract list sidebar ── */}
      <div style={{
        width: 220, minWidth: 220, background: '#fff',
        borderRight: '0.5px solid #e5e7eb', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '16px 16px 10px', borderBottom: '0.5px solid #e5e7eb' }}>
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
                    setIpdVendors([])
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
                    <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>{c.contract_number}</div>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Right: IPD tabs + content ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* IPD tab bar */}
        <div style={{
          background: '#fff', borderBottom: '0.5px solid #e5e7eb',
          padding: '0 24px', display: 'flex', alignItems: 'center',
          minHeight: 48, flexWrap: 'nowrap', overflowX: 'auto',
        }}>
          {ipdsLoading ? (
            <span style={{ fontSize: 12, color: '#9ca3af', padding: '14px 0' }}>Loading IPDs…</span>
          ) : ipds.length === 0 ? (
            <span style={{ fontSize: 12, color: '#9ca3af', padding: '14px 0' }}>No IPDs found.</span>
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

          <div style={{ marginLeft: 'auto', padding: '8px 0' }}>
            {selectedIpd && (
              <button
                onClick={() => exportToExcel(selectedIpd, groups, submissions)}
                style={{
                  fontSize: 12, padding: '5px 14px', borderRadius: 6,
                  background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0',
                  cursor: 'pointer', fontWeight: 500, whiteSpace: 'nowrap',
                }}
              >
                ↓ Export to Excel
              </button>
            )}
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {!selectedContractId ? (
            <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13, paddingTop: 60 }}>
              Select a contract to view BIP claim summary.
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
            <>
              {/* Claim Submission Manager */}
              <ClaimSubmissionManager
                submissions={submissions}
                contractId={selectedContractId}
                ipdId={selectedIpdId}
                onAdd={addClaimSubmission}
                onUpdate={updateClaimSubmission}
                onDelete={deleteClaimSubmission}
              />

              {/* IPD label + loading state */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#1F4E79' }}>
                    {selectedIpd.code}
                  </span>
                  <span style={{ fontSize: 13, color: '#6b7280', marginLeft: 8 }}>
                    {selectedIpd.description}
                  </span>
                </div>
                {vendorLoading && (
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>Loading vendors…</span>
                )}
              </div>

              {/* Summary table */}
              <SubmissionGroups
                sortedGroupKeys={Object.keys(groups).sort()}
                groups={groups}
                submissions={submissions}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
