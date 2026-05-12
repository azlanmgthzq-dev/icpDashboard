import { useState } from 'react'

const STATUS_OPTS = ['Not Started', 'In Progress', 'Done', 'On Hold']

const STATUS_COLORS = {
  'Done':        { bg: '#EAF3DE', color: '#3B6D11' },
  'In Progress': { bg: '#E6F1FB', color: '#185FA5' },
  'Not Started': { bg: '#f3f4f6', color: '#6b7280' },
  'On Hold':     { bg: '#FAEEDA', color: '#854F0B' },
}

const CATEGORY_OPTS = ['Essential', 'Strategic']

const CATEGORY_COLORS = {
  'Essential': { bg: '#EAF3DE', color: '#3B6D11' },
  'Strategic': { bg: '#FAEEDA', color: '#854F0B' },
}

function fmt(n) {
  if (n === null || n === undefined || n === '') return '—'
  const num = Number(n)
  if (isNaN(num)) return '—'
  if (Math.abs(num) >= 1e6) return `RM ${(num / 1e6).toFixed(2)}M`
  return `RM ${num.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
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
  { key: 'milestone_desc',       label: 'Milestone Description',       type: 'text',   width: 250 },
  { key: 'submission_number',    label: 'Submission No.',              type: 'text',   width: 120 },
  { key: 'est_nominal_value',    label: 'Est. Nominal Value',          type: 'number', width: 130 },
  { key: 'actual_nominal_value', label: 'Actual Nominal Value',        type: 'number', width: 130 },
  { key: 'multiplier',           label: 'Multiplier',                  type: 'number', width: 80  },
  { key: 'est_plan_icv',         label: 'Est. Plan ICV',               type: 'calc',   width: 130 },
  { key: 'actual_icv',           label: 'Actual ICV',                  type: 'calc',   width: 130 },
  { key: 'submit_notes',         label: 'Claim Submission & Approval', type: 'text',   width: 190 },
  { key: 'total_icv_approved',   label: 'Total ICV Approved',          type: 'number', width: 130 },
  { key: 'balance_icv',          label: 'Balance ICV',                 type: 'calc',   width: 130 },
  { key: 'payment_planning',     label: 'Payment Planning',            type: 'text',   width: 150 },
  { key: 'status_project',       label: 'Status',                      type: 'select', width: 110 },
]

const EMPTY_ROW = {
  milestone_desc: '', submission_number: '', est_nominal_value: '', actual_nominal_value: '',
  multiplier: '', submit_notes: '', total_icv_approved: '',
  payment_planning: '', status_project: 'Not Started',
}

function calc(row) {
  const est = parseFloat(row.est_nominal_value) || 0
  const actual = parseFloat(row.actual_nominal_value) || 0
  const mult = parseFloat(row.multiplier) || 0
  const approved = parseFloat(row.total_icv_approved) || 0
  return {
    est_plan_icv: est * mult,
    actual_icv: actual * mult,
    balance_icv: est * mult - approved,
  }
}

function EditCell({ col, value, onChange, onBlur }) {
  if (col.type === 'calc') {
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
      type={col.type === 'number' ? 'number' : 'text'}
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

export default function MilestoneTable({ ipd, milestones = [], onAdd, onUpdate, onDelete, onUpdateIpd, onDeleteIpd, onEditIpd }) {
  const [editingCell, setEditingCell] = useState(null)
  const [draftValues, setDraftValues] = useState({})
  const [newRow, setNewRow] = useState(null)
  const [saving, setSaving] = useState(false)

  // IPD header inline edit state
  const [editingIpd, setEditingIpd] = useState(null) // 'beneficiary' | 'project_category' | null
  const [ipdDraft, setIpdDraft] = useState({})

  function startIpdEdit(field) {
    setEditingIpd(field)
    setIpdDraft(prev => ({ ...prev, [field]: ipd[field] ?? '' }))
  }

  async function commitIpdField(field) {
    setEditingIpd(null)
    if (ipdDraft[field] === undefined || ipdDraft[field] === ipd[field]) return
    try {
      await onUpdateIpd(ipd.id, { [field]: ipdDraft[field] })
    } catch (e) {
      console.error(e)
    }
  }

  async function commitCategoryChange(val) {
    setEditingIpd(null)
    try {
      await onUpdateIpd(ipd.id, { project_category: val })
    } catch (e) {
      console.error(e)
    }
  }

  // Milestone cell editing
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
    if (['est_nominal_value', 'actual_nominal_value', 'multiplier', 'total_icv_approved'].includes(colKey)) {
      Object.assign(payload, {
        est_nominal_value: merged.est_nominal_value,
        actual_nominal_value: merged.actual_nominal_value,
        multiplier: merged.multiplier,
        total_icv_approved: merged.total_icv_approved,
      })
    }
    setSaving(true)
    try {
      await onUpdate(row.id, payload)
    } catch (e) {
      console.error(e)
    }
    setSaving(false)
  }

  async function handleDeleteRow(id) {
    if (!window.confirm('Delete this milestone row?')) return
    try { await onDelete(id) } catch (e) { console.error(e) }
  }

  async function saveNewRow() {
    if (!newRow?.milestone_desc?.trim()) return
    setSaving(true)
    try {
      await onAdd(newRow)
      setNewRow(null)
    } catch (e) {
      console.error(e)
    }
    setSaving(false)
  }

  const catStyle = CATEGORY_COLORS[ipd.project_category] || { bg: '#f3f4f6', color: '#6b7280' }

  return (
    <div style={{ background: '#fff', borderRadius: 10, border: '0.5px solid #e5e7eb', overflow: 'hidden' }}>

      {/* ── IPD Header ── */}
      <div style={{
        padding: '14px 18px 12px', borderBottom: '0.5px solid #e5e7eb',
        background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      }}>
        <div>
          {/* Code + Description */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#1F4E79' }}>{ipd.code}</span>
            <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{ipd.description}</span>
          </div>

          {/* Beneficiary + Category */}
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>

            {/* Beneficiary */}
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
                    padding: '2px 8px', outline: 'none', background: '#fff', color: '#111827',
                    minWidth: 80,
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

            {/* Project Category */}
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

            {/* IPD Type (category_type) — read-only badge, edit via Edit IPD modal */}
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

        {/* Right: saving + Add Row + Delete IPD */}
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
            + Add Row
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
            Edit IPD
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
                  {c.type === 'calc' && <span style={{ color: '#d1d5db', marginLeft: 2 }}>⚡</span>}
                </th>
              ))}
              <th style={{
                padding: '8px 10px', borderBottom: '0.5px solid #e5e7eb', width: 40,
              }} />
            </tr>
          </thead>
          <tbody>
            {milestones.length === 0 && !newRow && (
              <tr>
                <td colSpan={COLS.length + 1} style={{
                  padding: '32px 16px', textAlign: 'center', color: '#9ca3af', fontSize: 12,
                }}>
                  No milestones yet — click "+ Add Row" to get started.
                </td>
              </tr>
            )}

            {milestones.map(row => {
              const computed = calc({ ...row, ...(draftValues[row.id] || {}) })
              return (
                <tr
                  key={row.id}
                  style={{ borderBottom: '0.5px solid #f3f4f6' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                >
                  {COLS.map(col => {
                    const isEditing = editingCell?.rowId === row.id && editingCell?.colKey === col.key
                    const cellVal = col.type === 'calc'
                      ? computed[col.key]
                      : (draftValues[row.id]?.[col.key] !== undefined
                        ? draftValues[row.id][col.key]
                        : row[col.key])

                    return (
                      <td
                        key={col.key}
                        style={{ padding: '9px 10px', verticalAlign: 'middle', minWidth: col.width }}
                        onClick={() => {
                          if (col.type !== 'calc' && !isEditing)
                            startEdit(row.id, col.key, row[col.key])
                        }}
                      >
                        {isEditing ? (
                          <EditCell
                            col={col}
                            value={draftValues[row.id]?.[col.key] ?? row[col.key]}
                            onChange={val => draftChange(row.id, col.key, val)}
                            onBlur={() => commitEdit(row, col.key)}
                          />
                        ) : col.type === 'calc' ? (
                          <span style={{ color: '#185FA5', fontWeight: 500 }}>{fmt(cellVal)}</span>
                        ) : col.type === 'select' ? (
                          <StatusBadge status={cellVal} />
                        ) : col.type === 'number' ? (
                          <span style={{ color: '#374151', cursor: 'text' }}>{fmt(cellVal)}</span>
                        ) : (
                          <span style={{
                            color: '#374151', cursor: 'text', display: 'block',
                            maxWidth: col.width, overflow: 'hidden',
                            textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {cellVal || <span style={{ color: '#d1d5db' }}>—</span>}
                          </span>
                        )}
                      </td>
                    )
                  })}
                  <td style={{ padding: '9px 10px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleDeleteRow(row.id)}
                      title="Delete row"
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#d1d5db', fontSize: 14, lineHeight: 1, padding: '2px 4px', borderRadius: 4,
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={e => e.currentTarget.style.color = '#d1d5db'}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              )
            })}

            {/* New row entry */}
            {newRow && (
              <tr style={{ background: '#f0f7ff', borderBottom: '0.5px solid #bfdbfe' }}>
                {COLS.map(col => {
                  const computed = calc(newRow)
                  return (
                    <td key={col.key} style={{ padding: '7px 10px', minWidth: col.width }}>
                      {col.type === 'calc' ? (
                        <span style={{ color: '#185FA5', fontWeight: 500 }}>{fmt(computed[col.key])}</span>
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
                          type={col.type === 'number' ? 'number' : 'text'}
                          placeholder={col.label}
                          value={newRow[col.key] ?? ''}
                          onChange={e => setNewRow(prev => ({ ...prev, [col.key]: e.target.value }))}
                          style={{
                            fontSize: 12, border: '1px solid #bfdbfe', borderRadius: 4,
                            padding: '2px 6px', background: '#fff', width: col.width - 12,
                            outline: 'none',
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
                      background: '#1F4E79', color: '#fff', border: 'none',
                      cursor: 'pointer', marginRight: 4,
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

          {/* Footer totals */}
          {milestones.length > 0 && (
            <tfoot>
              <tr style={{ background: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
                <td style={{ padding: '8px 10px', fontWeight: 600, fontSize: 12, color: '#374151' }}>
                  Totals
                </td>
                {COLS.slice(1).map(col => {
                  const sumKeys = ['est_nominal_value', 'actual_nominal_value', 'est_plan_icv', 'actual_icv', 'total_icv_approved', 'balance_icv']
                  if (sumKeys.includes(col.key)) {
                    const total = col.type === 'calc'
                      ? milestones.reduce((s, r) => s + (calc(r)[col.key] || 0), 0)
                      : milestones.reduce((s, r) => s + (parseFloat(r[col.key]) || 0), 0)
                    return (
                      <td key={col.key} style={{
                        padding: '8px 10px', fontWeight: 600, fontSize: 12,
                        color: col.key.includes('icv') ? '#185FA5' : '#374151',
                        whiteSpace: 'nowrap',
                      }}>
                        {fmt(total)}
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
