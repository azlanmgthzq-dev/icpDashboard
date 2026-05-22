import { useState, Fragment } from 'react'

const STATUS_OPTS = ['Not Started', 'In Progress', 'Done', 'On Hold']
const STATUS_COLORS = {
  'Done': { bg: '#EAF3DE', color: '#3B6D11' },
  'In Progress': { bg: '#E6F1FB', color: '#185FA5' },
  'Not Started': { bg: '#f3f4f6', color: '#6b7280' },
  'On Hold': { bg: '#FAEEDA', color: '#854F0B' },
}
const CATEGORY_OPTS = ['Essential', 'Strategic']
const CATEGORY_COLORS = {
  'Essential': { bg: '#EAF3DE', color: '#3B6D11' },
  'Strategic': { bg: '#FAEEDA', color: '#854F0B' },
}

const SHARED_COL_KEYS = new Set(['milestone_desc', 'est_nominal_value', 'multiplier', 'est_plan_icv'])

function fmt(n) {
  if (n === null || n === undefined || n === '') return '—'
  const num = Number(n)
  if (isNaN(num)) return '—'
  if (Math.abs(num) >= 1e6) return `RM ${(num / 1e6).toFixed(2)}M`
  return `RM ${num.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmtNum(n) {
  if (n === null || n === undefined || n === '') return '—'
  const num = Number(n)
  if (isNaN(num)) return '—'
  return num.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || { bg: '#f3f4f6', color: '#6b7280' }
  return (
    <span style={{
      fontSize: 10, padding: '2px 8px', borderRadius: 10,
      background: s.bg, color: s.color, fontWeight: 500, whiteSpace: 'nowrap',
    }}>
      {status || '—'}
    </span>
  )
}

const COLS = [
  { key: 'milestone_desc', label: 'Milestone Description', type: 'text', width: 250 },
  { key: 'submission_number', label: 'Submission No.', type: 'text', width: 120 },
  { key: 'est_nominal_value', label: 'Est. Nominal Value', type: 'number', width: 130 },
  { key: 'actual_nominal_value', label: 'Actual Nominal Value', type: 'number', width: 130 },
  { key: 'multiplier', label: 'Multiplier', type: 'plain', width: 80 },
  { key: 'est_plan_icv', label: 'Est. Plan ICV', type: 'calc', width: 130 },
  { key: 'actual_icv', label: 'Actual ICV', type: 'calc', width: 130 },
  { key: 'icv_variance', label: 'ICV Variance', type: 'variance', width: 130 },
  { key: 'submit_notes', label: 'Claim Submission & Approval', type: 'text', width: 190 },
  { key: 'total_icv_approved', label: 'Total ICV Approved', type: 'number', width: 130 },
  { key: 'balance_to_claim', label: 'Balance to Claim', type: 'balance', width: 130 },
  { key: 'payment_planning', label: 'Payment Planning', type: 'text', width: 150 },
  { key: 'status_project', label: 'Status', type: 'select', width: 110 },
]

const EMPTY_ROW = {
  milestone_desc: '', submission_number: '', est_nominal_value: '', actual_nominal_value: '',
  multiplier: '', submit_notes: '', total_icv_approved: '',
  payment_planning: '', status_project: 'Not Started',
}

const EMPTY_SUB_ROW = {
  submission_number: '', actual_nominal_value: '',
  submit_notes: '', total_icv_approved: '',
  payment_planning: '', status_project: 'Not Started',
}

const EMPTY_VENDOR = { submission_no: '', vendor_name: '', amount: '', invoice_link: '' }

function calc(row, parentRow = null) {
  const est = parseFloat(parentRow ? parentRow.est_nominal_value : row.est_nominal_value) || 0
  const actual = parseFloat(row.actual_nominal_value) || 0
  const mult = parseFloat(parentRow ? parentRow.multiplier : row.multiplier) || 0
  const estPlanIcv = est * mult
  const actualIcv = actual * mult
  return {
    est_plan_icv: estPlanIcv,
    actual_icv: actualIcv,
    icv_variance: actualIcv - estPlanIcv,
    balance_to_claim: estPlanIcv - actualIcv,
  }
}

function EditCell({ col, value, onChange, onBlur }) {
  if (col.type === 'calc' || col.type === 'balance' || col.type === 'variance') {
    return <span style={{ fontSize: 12, color: '#185FA5', fontWeight: 500 }}>{fmt(value)}</span>
  }
  if (col.type === 'select') {
    return (
      <select
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        onBlur={onBlur}
        autoFocus
        style={{
          fontSize: 12, border: '1px solid #1F4E79', borderRadius: 4,
          padding: '2px 4px', background: '#fff', color: '#111827',
          width: col.width - 8,
        }}
      >
        {STATUS_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    )
  }
  return (
    <input
      autoFocus
      type={col.type === 'number' || col.type === 'plain' ? 'number' : 'text'}
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      onBlur={onBlur}
      style={{
        fontSize: 12, border: '1px solid #1F4E79', borderRadius: 4,
        padding: '2px 6px', background: '#fff', color: '#111827',
        width: col.width - 12, outline: 'none',
      }}
    />
  )
}

function CellValue({ col, value }) {
  if (col.type === 'calc') return <span style={{ color: '#185FA5', fontWeight: 500 }}>{fmt(value)}</span>
  if (col.type === 'variance') {
    const num = Number(value)
    if (!value && value !== 0) return <span style={{ color: '#9ca3af' }}>—</span>
    if (num === 0) return <span style={{ color: '#9ca3af' }}>—</span>
    if (num > 0) return <span style={{ color: '#16a34a', fontWeight: 500 }}>{`+${fmt(value)}`}</span>
    return <span style={{ color: '#ef4444', fontWeight: 500 }}>{fmt(value)}</span>
  }
  if (col.type === 'balance') {
    const num = Number(value)
    if (!value && value !== 0) return <span style={{ color: '#9ca3af' }}>—</span>
    if (num > 0) return <span style={{ color: '#b45309', fontWeight: 500 }}>{fmt(value)}</span>
    return <span style={{ color: '#185FA5', fontWeight: 500 }}>{fmt(value)}</span>
  }
  if (col.type === 'select') return <StatusBadge status={value} />
  if (col.type === 'plain') return <span style={{ color: '#374151', cursor: 'text' }}>{fmtNum(value)}</span>
  if (col.type === 'number') return <span style={{ color: '#374151', cursor: 'text' }}>{fmt(value)}</span>
  return (
    <span style={{
      color: '#374151', cursor: 'text', display: 'block',
      maxWidth: col.width, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    }}>
      {value || <span style={{ color: '#d1d5db' }}>—</span>}
    </span>
  )
}

// ─── Vendor Panel ─────────────────────────────────────────────────────────────

const VENDOR_COLS = [
  { key: 'submission_no', label: 'Submission No.', width: 110 },
  { key: 'vendor_name', label: 'Vendor Name', width: 200 },
  { key: 'amount', label: 'Amount (RM)', width: 130, numeric: true },
  { key: 'invoice_link', label: 'Invoice Link', width: 180, isLink: true },
]

function VendorPanel({ milestoneId, vendors = [], loading, onAdd, onUpdate, onDelete }) {
  const [editingCell, setEditingCell] = useState(null) // { vendorId, colKey }
  const [draft, setDraft] = useState({}) // { [vendorId]: { [colKey]: val } }
  const [newRow, setNewRow] = useState(null)
  const [saving, setSaving] = useState(false)

  // Group by submission_no
  const groups = {}
  vendors.forEach(v => {
    const key = v.submission_no || '(no sub)'
    if (!groups[key]) groups[key] = []
    groups[key].push(v)
  })
  const sortedGroups = Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))

  function startEdit(vendorId, colKey, currentVal) {
    setEditingCell({ vendorId, colKey })
    setDraft(prev => ({
      ...prev,
      [vendorId]: { ...(prev[vendorId] || {}), [colKey]: currentVal ?? '' },
    }))
  }

  async function commitEdit(vendor, colKey) {
    setEditingCell(null)
    const val = draft[vendor.id]?.[colKey]
    if (val === undefined || val === vendor[colKey]) return
    setSaving(true)
    try { await onUpdate(vendor.id, { [colKey]: val }) } catch (e) { console.error(e) }
    setSaving(false)
  }

  async function handleDelete(vendorId) {
    if (!window.confirm('Delete this vendor row?')) return
    try { await onDelete(vendorId, milestoneId) } catch (e) { console.error(e) }
  }

  async function saveNewRow() {
    if (!newRow?.vendor_name?.trim()) return
    setSaving(true)
    try {
      await onAdd({ ...newRow, milestone_id: milestoneId })
      setNewRow(null)
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  const thStyle = {
    padding: '5px 8px', textAlign: 'left', fontSize: 10, fontWeight: 600,
    color: '#6b7280', whiteSpace: 'nowrap', borderBottom: '1px solid #bfdbfe',
    background: '#dbeafe',
  }
  const tdStyle = { padding: '5px 8px', fontSize: 12, verticalAlign: 'middle' }

  return (
    <div style={{
      background: '#EBF3FB', borderTop: '1px solid #bfdbfe',
      padding: '10px 16px 12px', borderBottom: '1px solid #dbeafe',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#1e40af', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          Vendor / Invoice Records
        </span>
        {saving && <span style={{ fontSize: 10, color: '#9ca3af' }}>Saving…</span>}
      </div>

      {loading ? (
        <div style={{ fontSize: 11, color: '#9ca3af', padding: '6px 0' }}>Loading vendors…</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, background: '#fff', borderRadius: 6, overflow: 'hidden', border: '1px solid #bfdbfe' }}>
          <thead>
            <tr>
              {VENDOR_COLS.map(c => <th key={c.key} style={{ ...thStyle, minWidth: c.width }}>{c.label}</th>)}
              <th style={{ ...thStyle, width: 60 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors.length === 0 && !newRow ? (
              <tr>
                <td colSpan={5} style={{ ...tdStyle, textAlign: 'center', color: '#9ca3af', padding: '10px 0' }}>
                  No vendors yet.
                </td>
              </tr>
            ) : null}

            {sortedGroups.map(([subNo, rows]) => (
              <Fragment key={subNo}>
                {rows.map(vendor => (
                  <tr
                    key={vendor.id}
                    style={{ borderBottom: '0.5px solid #e0eeff' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#f0f7ff' }}
                    onMouseLeave={e => { e.currentTarget.style.background = '' }}
                  >
                    {VENDOR_COLS.map(col => {
                      const isEditing = editingCell?.vendorId === vendor.id && editingCell?.colKey === col.key
                      const val = draft[vendor.id]?.[col.key] !== undefined && isEditing
                        ? draft[vendor.id][col.key]
                        : vendor[col.key]

                      return (
                        <td
                          key={col.key}
                          style={{ ...tdStyle, minWidth: col.width, cursor: col.isLink ? 'default' : 'text' }}
                          onClick={() => { if (!col.isLink && !isEditing) startEdit(vendor.id, col.key, vendor[col.key]) }}
                        >
                          {isEditing ? (
                            <input
                              autoFocus
                              type={col.numeric ? 'number' : 'text'}
                              value={draft[vendor.id]?.[col.key] ?? ''}
                              onChange={e => setDraft(prev => ({
                                ...prev,
                                [vendor.id]: { ...(prev[vendor.id] || {}), [col.key]: e.target.value },
                              }))}
                              onBlur={() => commitEdit(vendor, col.key)}
                              style={{
                                fontSize: 12, border: '1px solid #1F4E79', borderRadius: 4,
                                padding: '2px 6px', background: '#fff', outline: 'none',
                                width: col.width - 12,
                              }}
                            />
                          ) : col.isLink ? (
                            val ? (
                              <a
                                href={val}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#185FA5', textDecoration: 'none', fontSize: 14 }}
                                onClick={e => e.stopPropagation()}
                              >
                                🔗
                              </a>
                            ) : (
                              <span
                                style={{ color: '#d1d5db', cursor: 'text', fontSize: 11 }}
                                onClick={() => startEdit(vendor.id, col.key, vendor[col.key])}
                              >
                                + link
                              </span>
                            )
                          ) : col.numeric ? (
                            <span style={{ color: '#374151' }}>{fmt(val)}</span>
                          ) : (
                            <span style={{ color: '#374151' }}>{val || <span style={{ color: '#d1d5db' }}>—</span>}</span>
                          )}
                        </td>
                      )
                    })}
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <button
                        onClick={() => handleDelete(vendor.id)}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: '#d1d5db', fontSize: 13, padding: '2px 4px', borderRadius: 4,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#ef4444' }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#d1d5db' }}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
                {/* Group total row */}
                <tr style={{ background: '#dbeafe', borderBottom: '1px solid #bfdbfe' }}>
                  <td style={{ ...tdStyle, fontWeight: 600, color: '#1e40af', fontSize: 11 }} colSpan={2}>
                    Total — {subNo}
                  </td>
                  <td style={{ ...tdStyle, fontWeight: 600, color: '#1e40af', fontSize: 11 }}>
                    {fmt(rows.reduce((s, v) => s + (parseFloat(v.amount) || 0), 0))}
                  </td>
                  <td colSpan={2} />
                </tr>
              </Fragment>
            ))}

            {/* New vendor input row */}
            {newRow && (
              <tr style={{ background: '#f0f7ff', borderBottom: '0.5px solid #bfdbfe' }}>
                {VENDOR_COLS.map(col => (
                  <td key={col.key} style={{ ...tdStyle, minWidth: col.width }}>
                    <input
                      type={col.numeric ? 'number' : 'text'}
                      placeholder={col.label}
                      value={newRow[col.key] ?? ''}
                      onChange={e => setNewRow(prev => ({ ...prev, [col.key]: e.target.value }))}
                      style={{
                        fontSize: 11, border: '1px solid #bfdbfe', borderRadius: 4,
                        padding: '2px 6px', background: '#fff', outline: 'none',
                        width: col.width - 12,
                      }}
                    />
                  </td>
                ))}
                <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                  <button
                    onClick={saveNewRow}
                    disabled={saving}
                    style={{
                      fontSize: 10, padding: '2px 6px', borderRadius: 4,
                      background: '#1F4E79', color: '#fff', border: 'none', cursor: 'pointer', marginRight: 3,
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setNewRow(null)}
                    style={{
                      fontSize: 10, padding: '2px 6px', borderRadius: 4,
                      background: '#f3f4f6', color: '#6b7280', border: 'none', cursor: 'pointer',
                    }}
                  >
                    ✕
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {!newRow && (
        <button
          onClick={() => setNewRow({ ...EMPTY_VENDOR })}
          style={{
            marginTop: 8, fontSize: 11, padding: '4px 10px', borderRadius: 5,
            background: '#1F4E79', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 500,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#1e3a5f' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#1F4E79' }}
        >
          + Add Vendor
        </button>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MilestoneTable({
  ipd, milestones = [],
  onAdd, onUpdate, onDelete, onUpdateIpd, onDeleteIpd, onEditIpd,
  vendors = {},
  onFetchVendors, onAddVendor, onUpdateVendor, onDeleteVendor,
}) {
  const [editingCell, setEditingCell] = useState(null)
  const [draftValues, setDraftValues] = useState({})
  const [newRow, setNewRow] = useState(null)
  const [newSubRow, setNewSubRow] = useState(null)
  const [saving, setSaving] = useState(false)

  const [editingIpd, setEditingIpd] = useState(null)
  const [ipdDraft, setIpdDraft] = useState({})

  // Vendor panel state
  const [expandedVendors, setExpandedVendors] = useState(new Set())
  const [vendorPanelLoading, setVendorPanelLoading] = useState(new Set())

  const parents = milestones.filter(m => !m.parent_milestone_id)
  const childrenMap = {}
  milestones.filter(m => m.parent_milestone_id).forEach(m => {
    if (!childrenMap[m.parent_milestone_id]) childrenMap[m.parent_milestone_id] = []
    childrenMap[m.parent_milestone_id].push(m)
  })

  async function toggleVendorPanel(milestoneId) {
    if (expandedVendors.has(milestoneId)) {
      setExpandedVendors(prev => { const n = new Set(prev); n.delete(milestoneId); return n })
      return
    }
    setExpandedVendors(prev => new Set([...prev, milestoneId]))
    if (!onFetchVendors) return
    setVendorPanelLoading(prev => new Set([...prev, milestoneId]))
    try { await onFetchVendors(milestoneId) } catch (e) { console.error(e) }
    setVendorPanelLoading(prev => { const n = new Set(prev); n.delete(milestoneId); return n })
  }

  function startIpdEdit(field) {
    setEditingIpd(field)
    setIpdDraft(prev => ({ ...prev, [field]: ipd[field] ?? '' }))
  }

  async function commitIpdField(field) {
    setEditingIpd(null)
    if (ipdDraft[field] === undefined || ipdDraft[field] === ipd[field]) return
    try { await onUpdateIpd(ipd.id, { [field]: ipdDraft[field] }) } catch (e) { console.error(e) }
  }

  async function commitCategoryChange(val) {
    setEditingIpd(null)
    try { await onUpdateIpd(ipd.id, { project_category: val }) } catch (e) { console.error(e) }
  }

  function startEdit(rowId, colKey, currentVal) {
    setEditingCell({ rowId, colKey })
    setDraftValues(prev => ({
      ...prev,
      [rowId]: { ...(prev[rowId] || {}), [colKey]: currentVal ?? '' },
    }))
  }

  function draftChange(rowId, colKey, val) {
    setDraftValues(prev => ({
      ...prev,
      [rowId]: { ...(prev[rowId] || {}), [colKey]: val },
    }))
  }

  async function commitEdit(row, colKey) {
    setEditingCell(null)
    const draft = draftValues[row.id] || {}
    if (!(colKey in draft)) return
    const merged = { ...row, ...draft }
    const payload = { [colKey]: draft[colKey] }
    const isSub = !!row.parent_milestone_id
    if (['est_nominal_value', 'actual_nominal_value', 'multiplier', 'total_icv_approved'].includes(colKey)) {
      Object.assign(payload, {
        actual_nominal_value: merged.actual_nominal_value,
        total_icv_approved: merged.total_icv_approved,
        ...(!isSub && {
          est_nominal_value: merged.est_nominal_value,
          multiplier: merged.multiplier,
        }),
      })
    }
    setSaving(true)
    try { await onUpdate(row.id, payload) } catch (e) { console.error(e) }
    setSaving(false)
  }

  async function handleDeleteRow(id) {
    if (!window.confirm('Delete this milestone row?')) return
    try { await onDelete(id) } catch (e) { console.error(e) }
  }

  async function saveNewRow() {
    if (!newRow?.milestone_desc?.trim()) return
    setSaving(true)
    try { await onAdd(newRow); setNewRow(null) } catch (e) { console.error(e) }
    setSaving(false)
  }

  async function saveNewSubRow() {
    if (!newSubRow) return
    setSaving(true)
    try {
      await onAdd({ ...newSubRow.data, parent_milestone_id: newSubRow.parentId })
      setNewSubRow(null)
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  function computeTotal(col) {
    const sumKeys = ['est_nominal_value', 'actual_nominal_value', 'est_plan_icv', 'actual_icv', 'total_icv_approved', 'balance_to_claim', 'icv_variance']
    if (!sumKeys.includes(col.key)) return null

    if (col.key === 'balance_to_claim' || col.key === 'icv_variance') {
      const totalActualIcv = milestones.reduce((s, r) => {
        const parentRow = r.parent_milestone_id ? parents.find(p => p.id === r.parent_milestone_id) : null
        return s + (calc(r, parentRow).actual_icv || 0)
      }, 0)
      const totalEstPlanIcv = parents.reduce((s, r) => s + (calc(r).est_plan_icv || 0), 0)
      return col.key === 'balance_to_claim'
        ? totalEstPlanIcv - totalActualIcv
        : totalActualIcv - totalEstPlanIcv
    }

    if (['est_plan_icv', 'est_nominal_value'].includes(col.key)) {
      return parents.reduce((s, r) =>
        s + (col.type === 'calc' ? (calc(r)[col.key] || 0) : (parseFloat(r[col.key]) || 0)), 0)
    }

    return milestones.reduce((s, r) => {
      if (col.type === 'calc') {
        const parentRow = r.parent_milestone_id ? parents.find(p => p.id === r.parent_milestone_id) : null
        return s + (calc(r, parentRow)[col.key] || 0)
      }
      return s + (parseFloat(r[col.key]) || 0)
    }, 0)
  }

  const catStyle = CATEGORY_COLORS[ipd.project_category] || { bg: '#f3f4f6', color: '#6b7280' }

  function renderRow(row, parentRow = null) {
    const isSub = !!parentRow
    const computed = calc({ ...row, ...(draftValues[row.id] || {}) }, parentRow)
    const rowVendors = vendors[row.id] || []
    const vendorCount = rowVendors.length
    const isExpanded = expandedVendors.has(row.id)

    return (
      <tr
        key={row.id}
        style={{ borderBottom: '0.5px solid #f3f4f6', background: isSub ? '#fafbff' : undefined }}
        onMouseEnter={e => { e.currentTarget.style.background = isSub ? '#f0f4ff' : '#fafafa' }}
        onMouseLeave={e => { e.currentTarget.style.background = isSub ? '#fafbff' : '' }}
      >
        {COLS.map(col => {
          const isShared = isSub && SHARED_COL_KEYS.has(col.key)
          const isEditing = editingCell?.rowId === row.id && editingCell?.colKey === col.key

          if (isShared) {
            const parentVal = col.type === 'calc' ? calc(parentRow)[col.key] : parentRow[col.key]
            return (
              <td key={col.key} style={{ padding: '9px 10px', verticalAlign: 'middle', minWidth: col.width }}>
                {col.key === 'milestone_desc' ? (
                  <span style={{
                    color: '#9ca3af', paddingLeft: 20, display: 'block',
                    maxWidth: col.width, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {parentVal || '—'}
                  </span>
                ) : col.type === 'calc' ? (
                  <span style={{ color: '#93c5fd' }}>{fmt(parentVal)}</span>
                ) : col.type === 'plain' ? (
                  <span style={{ color: '#9ca3af' }}>{fmtNum(parentVal)}</span>
                ) : (
                  <span style={{ color: '#9ca3af' }}>{fmt(parentVal)}</span>
                )}
              </td>
            )
          }

          const isComputedCol = ['calc', 'balance', 'variance'].includes(col.type)
          const cellVal = isComputedCol
            ? computed[col.key]
            : (draftValues[row.id]?.[col.key] !== undefined ? draftValues[row.id][col.key] : row[col.key])

          return (
            <td
              key={col.key}
              style={{ padding: '9px 10px', verticalAlign: 'middle', minWidth: col.width }}
              onClick={() => { if (!isComputedCol && !isEditing) startEdit(row.id, col.key, row[col.key]) }}
            >
              {isEditing ? (
                <EditCell
                  col={col}
                  value={draftValues[row.id]?.[col.key] ?? row[col.key]}
                  onChange={val => draftChange(row.id, col.key, val)}
                  onBlur={() => commitEdit(row, col.key)}
                />
              ) : (
                <CellValue col={col} value={cellVal} />
              )}
            </td>
          )
        })}

        <td style={{ padding: '9px 10px', textAlign: 'center', whiteSpace: 'nowrap' }}>
          {/* Vendors button */}
          {onFetchVendors && (
            <button
              onClick={() => toggleVendorPanel(row.id)}
              title={isExpanded ? 'Hide vendors' : 'Show vendors'}
              style={{
                fontSize: 10, padding: '2px 6px', borderRadius: 4,
                background: isExpanded ? '#1F4E79' : (vendorCount > 0 ? '#EBF3FB' : 'none'),
                color: isExpanded ? '#fff' : (vendorCount > 0 ? '#185FA5' : '#9ca3af'),
                border: vendorCount > 0 ? '1px solid #bfdbfe' : '1px solid #e5e7eb',
                cursor: 'pointer', marginRight: 4, fontWeight: 500, whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.background = '#EBF3FB' }}
              onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.background = vendorCount > 0 ? '#EBF3FB' : 'none' }}
            >
              {vendorCount > 0 ? `📎 Vendors (${vendorCount})` : '📎 Add Vendor'}
            </button>
          )}
          {!isSub && (
            <button
              onClick={() => setNewSubRow({ parentId: row.id, data: { ...EMPTY_SUB_ROW } })}
              title="Add sub-submission"
              style={{
                background: 'none', border: '1px solid #bfdbfe', cursor: 'pointer',
                color: '#185FA5', fontSize: 12, lineHeight: 1,
                padding: '2px 6px', borderRadius: 4, marginRight: 4,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#EBF3FB' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
            >
              +
            </button>
          )}
          <button
            onClick={() => handleDeleteRow(row.id)}
            title="Delete row"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#d1d5db', fontSize: 14, lineHeight: 1, padding: '2px 4px', borderRadius: 4,
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#ef4444' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#d1d5db' }}
          >
            ✕
          </button>
        </td>
      </tr>
    )
  }

  function renderVendorPanelRow(milestoneId) {
    if (!expandedVendors.has(milestoneId)) return null
    const isLoading = vendorPanelLoading.has(milestoneId)
    const milestoneVendors = vendors[milestoneId] || []

    return (
      <tr key={`vendor-panel-${milestoneId}`}>
        <td colSpan={COLS.length + 1} style={{ padding: 0 }}>
          <VendorPanel
            milestoneId={milestoneId}
            vendors={milestoneVendors}
            loading={isLoading}
            onAdd={onAddVendor}
            onUpdate={onUpdateVendor}
            onDelete={onDeleteVendor}
          />
        </td>
      </tr>
    )
  }

  function renderNewSubRow(parent) {
    const subComputed = calc(newSubRow.data, parent)
    return (
      <tr style={{ background: '#f0f7ff', borderBottom: '0.5px solid #bfdbfe' }}>
        {COLS.map(col => {
          if (SHARED_COL_KEYS.has(col.key)) {
            const parentVal = col.type === 'calc' ? calc(parent)[col.key] : parent[col.key]
            return (
              <td key={col.key} style={{ padding: '7px 10px', minWidth: col.width }}>
                {col.key === 'milestone_desc' ? (
                  <span style={{ color: '#9ca3af', paddingLeft: 20, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {parentVal || '—'}
                  </span>
                ) : col.type === 'calc' ? (
                  <span style={{ color: '#93c5fd' }}>{fmt(parentVal)}</span>
                ) : col.type === 'plain' ? (
                  <span style={{ color: '#9ca3af' }}>{fmtNum(parentVal)}</span>
                ) : (
                  <span style={{ color: '#9ca3af' }}>{fmt(parentVal)}</span>
                )}
              </td>
            )
          }
          return (
            <td key={col.key} style={{ padding: '7px 10px', minWidth: col.width }}>
              {['calc', 'balance', 'variance'].includes(col.type) ? (
                <CellValue col={col} value={subComputed[col.key]} />
              ) : col.type === 'select' ? (
                <select
                  value={newSubRow.data[col.key] || ''}
                  onChange={e => setNewSubRow(prev => ({ ...prev, data: { ...prev.data, [col.key]: e.target.value } }))}
                  style={{
                    fontSize: 12, border: '1px solid #bfdbfe', borderRadius: 4,
                    padding: '2px 4px', background: '#fff', width: col.width - 8,
                  }}
                >
                  {STATUS_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input
                  type={col.type === 'number' || col.type === 'plain' ? 'number' : 'text'}
                  placeholder={col.label}
                  value={newSubRow.data[col.key] ?? ''}
                  onChange={e => setNewSubRow(prev => ({ ...prev, data: { ...prev.data, [col.key]: e.target.value } }))}
                  style={{
                    fontSize: 12, border: '1px solid #bfdbfe', borderRadius: 4,
                    padding: '2px 6px', background: '#fff', width: col.width - 12, outline: 'none',
                  }}
                />
              )}
            </td>
          )
        })}
        <td style={{ padding: '7px 10px', whiteSpace: 'nowrap' }}>
          <button
            onClick={saveNewSubRow}
            disabled={saving}
            style={{
              fontSize: 11, padding: '3px 8px', borderRadius: 4,
              background: '#1F4E79', color: '#fff', border: 'none', cursor: 'pointer', marginRight: 4,
            }}
          >
            Save
          </button>
          <button
            onClick={() => setNewSubRow(null)}
            style={{
              fontSize: 11, padding: '3px 8px', borderRadius: 4,
              background: '#f3f4f6', color: '#6b7280', border: 'none', cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </td>
      </tr>
    )
  }

  return (
    <div style={{ background: '#fff', borderRadius: 10, border: '0.5px solid #e5e7eb', overflow: 'hidden' }}>

      {/* ── IPD Header ── */}
      <div style={{
        padding: '14px 18px 12px', borderBottom: '0.5px solid #e5e7eb',
        background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#1F4E79' }}>{ipd.code}</span>
            <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{ipd.description}</span>
          </div>

          <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>Beneficiary:</span>
              {editingIpd === 'beneficiary' ? (
                <input
                  autoFocus
                  value={ipdDraft.beneficiary ?? ''}
                  onChange={e => setIpdDraft(prev => ({ ...prev, beneficiary: e.target.value }))}
                  onBlur={() => commitIpdField('beneficiary')}
                  onKeyDown={e => { if (e.key === 'Enter') e.target.blur() }}
                  style={{
                    fontSize: 12, border: '1px solid #1F4E79', borderRadius: 4,
                    padding: '2px 8px', outline: 'none', background: '#fff', color: '#111827', minWidth: 80,
                  }}
                />
              ) : (
                <span
                  onClick={() => startIpdEdit('beneficiary')}
                  title="Click to edit"
                  style={{
                    fontSize: 12, fontWeight: 500, cursor: 'text',
                    padding: '2px 8px', borderRadius: 8,
                    background: '#EBF3FB', color: '#185FA5',
                    minWidth: 40, display: 'inline-block',
                  }}
                >
                  {ipd.beneficiary || <span style={{ color: '#bfdbfe' }}>—</span>}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>Category:</span>
              {editingIpd === 'project_category' ? (
                <select
                  autoFocus
                  value={ipdDraft.project_category ?? ipd.project_category ?? ''}
                  onChange={e => {
                    setIpdDraft(prev => ({ ...prev, project_category: e.target.value }))
                    commitCategoryChange(e.target.value)
                  }}
                  onBlur={() => setEditingIpd(null)}
                  style={{
                    fontSize: 12, border: '1px solid #1F4E79', borderRadius: 4,
                    padding: '2px 6px', background: '#fff',
                  }}
                >
                  <option value="">—</option>
                  {CATEGORY_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <span
                  onClick={() => startIpdEdit('project_category')}
                  title="Click to edit"
                  style={{
                    fontSize: 11, fontWeight: 500, cursor: 'pointer',
                    padding: '2px 9px', borderRadius: 9,
                    background: catStyle.bg, color: catStyle.color,
                  }}
                >
                  {ipd.project_category || <span style={{ color: '#d1d5db' }}>—</span>}
                </span>
              )}
            </div>

            {ipd.category_type && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>IPD Type:</span>
                <span style={{
                  fontSize: 11, fontWeight: 500, padding: '2px 9px', borderRadius: 9,
                  background: '#f3f4f6', color: '#374151',
                }}>
                  {ipd.category_type}
                </span>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', paddingTop: 2 }}>
          {saving && <span style={{ fontSize: 11, color: '#9ca3af' }}>Saving…</span>}
          <button
            onClick={() => setNewRow({ ...EMPTY_ROW })}
            disabled={!!newRow}
            style={{
              fontSize: 12, padding: '5px 12px', borderRadius: 6,
              background: '#1F4E79', color: '#fff', border: 'none',
              cursor: newRow ? 'not-allowed' : 'pointer', fontWeight: 500,
            }}
          >
            + Add Sub IPD
          </button>
          <button
            onClick={() => onEditIpd(ipd)}
            title="Edit this IPD"
            style={{
              fontSize: 12, padding: '5px 10px', borderRadius: 6,
              background: '#fff', color: '#1F4E79',
              border: '1px solid #bfdbfe', cursor: 'pointer', fontWeight: 500,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#EBF3FB' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}
          >
            Edit Sub IPD
          </button>
          <button
            onClick={() => onDeleteIpd(ipd.id)}
            title="Delete this IPD"
            style={{
              fontSize: 12, padding: '5px 10px', borderRadius: 6,
              background: '#fff', color: '#ef4444',
              border: '1px solid #fca5a5', cursor: 'pointer', fontWeight: 500,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}
          >
            Delete IPD
          </button>
        </div>
      </div>

      {/* ── Milestone Table ── */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              {COLS.map(c => (
                <th key={c.key} style={{
                  padding: '8px 10px', textAlign: 'left', fontWeight: 500,
                  color: '#6b7280', fontSize: 11, whiteSpace: 'nowrap',
                  borderBottom: '0.5px solid #e5e7eb', minWidth: c.width,
                }}>
                  {c.label}
                  {['calc', 'balance', 'variance'].includes(c.type) && <span style={{ color: '#d1d5db', marginLeft: 2 }}>⚡</span>}
                </th>
              ))}
              <th style={{ padding: '8px 10px', borderBottom: '0.5px solid #e5e7eb', width: 60 }} />
            </tr>
          </thead>
          <tbody>
            {parents.length === 0 && !newRow && (
              <tr>
                <td colSpan={COLS.length + 1} style={{
                  padding: '32px 16px', textAlign: 'center', color: '#9ca3af', fontSize: 12,
                }}>
                  No milestones yet — click "+ Add Sub IPD" to get started.
                </td>
              </tr>
            )}

            {parents.map(parent => (
              <Fragment key={parent.id}>
                {renderRow(parent)}
                {renderVendorPanelRow(parent.id)}
                {(childrenMap[parent.id] || []).map(child => (
                  <Fragment key={child.id}>
                    {renderRow(child, parent)}
                    {renderVendorPanelRow(child.id)}
                  </Fragment>
                ))}
                {newSubRow?.parentId === parent.id && renderNewSubRow(parent)}
              </Fragment>
            ))}

            {newRow && (
              <tr style={{ background: '#f0f7ff', borderBottom: '0.5px solid #bfdbfe' }}>
                {COLS.map(col => {
                  const computed = calc(newRow)
                  return (
                    <td key={col.key} style={{ padding: '7px 10px', minWidth: col.width }}>
                      {['calc', 'balance', 'variance'].includes(col.type) ? (
                        <CellValue col={col} value={computed[col.key]} />
                      ) : col.type === 'select' ? (
                        <select
                          value={newRow[col.key] || ''}
                          onChange={e => setNewRow(prev => ({ ...prev, [col.key]: e.target.value }))}
                          style={{
                            fontSize: 12, border: '1px solid #bfdbfe', borderRadius: 4,
                            padding: '2px 4px', background: '#fff', width: col.width - 8,
                          }}
                        >
                          {STATUS_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input
                          type={col.type === 'number' || col.type === 'plain' ? 'number' : 'text'}
                          placeholder={col.label}
                          value={newRow[col.key] ?? ''}
                          onChange={e => setNewRow(prev => ({ ...prev, [col.key]: e.target.value }))}
                          style={{
                            fontSize: 12, border: '1px solid #bfdbfe', borderRadius: 4,
                            padding: '2px 6px', background: '#fff', width: col.width - 12, outline: 'none',
                          }}
                        />
                      )}
                    </td>
                  )
                })}
                <td style={{ padding: '7px 10px', whiteSpace: 'nowrap' }}>
                  <button
                    onClick={saveNewRow}
                    disabled={saving}
                    style={{
                      fontSize: 11, padding: '3px 8px', borderRadius: 4,
                      background: '#1F4E79', color: '#fff', border: 'none', cursor: 'pointer', marginRight: 4,
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setNewRow(null)}
                    style={{
                      fontSize: 11, padding: '3px 8px', borderRadius: 4,
                      background: '#f3f4f6', color: '#6b7280', border: 'none', cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            )}
          </tbody>

          {milestones.length > 0 && (
            <tfoot>
              <tr style={{ background: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
                <td style={{ padding: '8px 10px', fontWeight: 600, fontSize: 12, color: '#374151' }}>
                  Totals
                </td>
                {COLS.slice(1).map(col => {
                  const total = computeTotal(col)
                  if (total !== null) {
                    let color = '#374151'
                    let display = fmt(total)
                    if (col.key === 'icv_variance') {
                      if (total === 0) { color = '#9ca3af'; display = '—' }
                      else if (total > 0) { color = '#16a34a'; display = `+${fmt(total)}` }
                      else { color = '#ef4444' }
                    } else if (col.key === 'balance_to_claim') {
                      color = total > 0 ? '#b45309' : '#185FA5'
                    } else if (['est_plan_icv', 'actual_icv'].includes(col.key)) {
                      color = '#185FA5'
                    }
                    return (
                      <td key={col.key} style={{
                        padding: '8px 10px', fontWeight: 600, fontSize: 12,
                        color, whiteSpace: 'nowrap',
                      }}>
                        {display}
                      </td>
                    )
                  }
                  return <td key={col.key} />
                })}
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}
