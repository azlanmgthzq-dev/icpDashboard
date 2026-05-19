import { useState, useEffect } from 'react'

const WAIVER_STATUS_OPTS = ['Proposed', 'Approved', 'In Planning']
const OBA_STATUS_OPTS    = ['In Planning', 'Proposed', 'Approved']

const EMPTY = {
  name: '', duration_start: '', duration_end: '',
  obligation_value: '', total_icv_planned: '', icv_balance: '', approved_planned_icv: '',
  waiver_60pct: false, waiver_status: '', oba_40pct_value: '', oba_60pct_value: '',
  oba_plan: false, oba_status: '',
}

function toNum(v) { const n = parseFloat(v); return isNaN(n) ? null : n }
function toDate(v) { return v || null }

const label = { fontSize: 11, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' }
const input = { width: '100%', padding: '8px 10px', fontSize: 13, border: '0.5px solid #e5e7eb', borderRadius: 8, outline: 'none', background: '#fff', color: '#111827', boxSizing: 'border-box' }
const row2  = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }

export default function ContractFormModal({ contract, onSave, onClose }) {
  const isEdit = !!contract
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (contract) {
      setForm({
        name: contract.name || '',
        duration_start: contract.duration_start || '',
        duration_end: contract.duration_end || '',
        obligation_value: contract.obligation_value ?? '',
        total_icv_planned: contract.total_icv_planned ?? '',
        icv_balance: contract.icv_balance ?? '',
        approved_planned_icv: contract.approved_planned_icv ?? '',
        waiver_60pct: contract.waiver_60pct || false,
        waiver_status: contract.waiver_status || '',
        oba_40pct_value: contract.oba_40pct_value ?? '',
        oba_60pct_value: contract.oba_60pct_value ?? '',
        oba_plan: contract.oba_plan || false,
        oba_status: contract.oba_status || '',
      })
    } else {
      setForm(EMPTY)
    }
  }, [contract])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSave() {
    if (!form.name.trim()) { setError('Contract name is required.'); return }
    setSaving(true); setError('')
    try {
      await onSave({
        name: form.name.trim(),
        duration_start: toDate(form.duration_start),
        duration_end: toDate(form.duration_end),
        obligation_value: toNum(form.obligation_value),
        total_icv_planned: toNum(form.total_icv_planned),
        icv_balance: toNum(form.icv_balance),
        approved_planned_icv: toNum(form.approved_planned_icv),
        waiver_60pct: form.waiver_60pct,
        waiver_status: form.waiver_status || null,
        oba_40pct_value: toNum(form.oba_40pct_value),
        oba_60pct_value: toNum(form.oba_60pct_value),
        oba_plan: form.oba_plan,
        oba_status: form.oba_status || null,
      })
    } catch (e) {
      setError(e.message || 'Something went wrong.')
      setSaving(false)
    }
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 12, padding: 24, width: '100%', maxWidth: 560, maxHeight: '92vh', overflowY: 'auto' }}>

        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>
          {isEdit ? 'Edit Contract' : 'Add Contract'}
        </h3>

        {error && (
          <div style={{ fontSize: 12, color: '#A32D2D', background: '#FCEBEB', border: '0.5px solid #fca5a5', borderRadius: 6, padding: '8px 12px', marginBottom: 14 }}>
            {error}
          </div>
        )}

        {/* Name */}
        <div style={{ marginBottom: 12 }}>
          <label style={label}>Contract Name <span style={{ color: '#ef4444' }}>*</span></label>
          <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. ISS 2 TP400-D6" style={input} />
        </div>

        {/* Duration */}
        <div style={{ ...row2, marginBottom: 12 }}>
          <div>
            <label style={label}>Start Date</label>
            <input type="date" value={form.duration_start} onChange={e => set('duration_start', e.target.value)} style={input} />
          </div>
          <div>
            <label style={label}>End Date</label>
            <input type="date" value={form.duration_end} onChange={e => set('duration_end', e.target.value)} style={input} />
          </div>
        </div>

        {/* Divider */}
        <div style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '16px 0 12px', borderTop: '0.5px solid #f3f4f6', paddingTop: 12 }}>
          Financial
        </div>

        <div style={{ ...row2, marginBottom: 12 }}>
          <div>
            <label style={label}>ICP Obligation (RM)</label>
            <input type="number" value={form.obligation_value} onChange={e => set('obligation_value', e.target.value)} placeholder="0" style={input} />
          </div>
          <div>
            <label style={label}>Total ICV Planned (RM)</label>
            <input type="number" value={form.total_icv_planned} onChange={e => set('total_icv_planned', e.target.value)} placeholder="0" style={input} />
          </div>
        </div>

        <div style={{ ...row2, marginBottom: 16 }}>
          <div>
            <label style={label}>ICV Balance (RM)</label>
            <input type="number" value={form.icv_balance} onChange={e => set('icv_balance', e.target.value)} placeholder="0" style={input} />
          </div>
          <div>
            <label style={label}>BIP Approved (RM)</label>
            <input type="number" value={form.approved_planned_icv} onChange={e => set('approved_planned_icv', e.target.value)} placeholder="0" style={input} />
          </div>
        </div>

        {/* Divider */}
        <div style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px', borderTop: '0.5px solid #f3f4f6', paddingTop: 12 }}>
          Waiver & OBA
        </div>

        {/* Waiver 60% toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <button
            onClick={() => set('waiver_60pct', !form.waiver_60pct)}
            style={{
              width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer', padding: 0,
              background: form.waiver_60pct ? '#3B6D11' : '#d1d5db', transition: 'background 0.2s', position: 'relative',
            }}
          >
            <span style={{
              position: 'absolute', top: 3, left: form.waiver_60pct ? 21 : 3,
              width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s',
            }} />
          </button>
          <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>Waiver 60%</span>
        </div>

        {form.waiver_60pct && (
          <div style={{ paddingLeft: 12, borderLeft: '2px solid #EAF3DE', marginBottom: 12 }}>
            <div style={{ marginBottom: 10 }}>
              <label style={label}>Waiver Status</label>
              <select value={form.waiver_status} onChange={e => set('waiver_status', e.target.value)} style={input}>
                <option value="">— Select —</option>
                {WAIVER_STATUS_OPTS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div style={row2}>
              <div>
                <label style={label}>40% Value (RM)</label>
                <input type="number" value={form.oba_40pct_value} onChange={e => set('oba_40pct_value', e.target.value)} placeholder="0" style={input} />
              </div>
              <div>
                <label style={label}>60% Value (RM)</label>
                <input type="number" value={form.oba_60pct_value} onChange={e => set('oba_60pct_value', e.target.value)} placeholder="0" style={input} />
              </div>
            </div>
          </div>
        )}

        {/* OBA Plan toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, marginTop: 8 }}>
          <button
            onClick={() => set('oba_plan', !form.oba_plan)}
            style={{
              width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer', padding: 0,
              background: form.oba_plan ? '#854F0B' : '#d1d5db', transition: 'background 0.2s', position: 'relative',
            }}
          >
            <span style={{
              position: 'absolute', top: 3, left: form.oba_plan ? 21 : 3,
              width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s',
            }} />
          </button>
          <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>OBA Plan (PK 1.7)</span>
        </div>

        {form.oba_plan && (
          <div style={{ paddingLeft: 12, borderLeft: '2px solid #FAEEDA', marginBottom: 12 }}>
            <label style={label}>OBA Status</label>
            <select value={form.oba_status} onChange={e => set('oba_status', e.target.value)} style={input}>
              <option value="">— Select —</option>
              {OBA_STATUS_OPTS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20, borderTop: '0.5px solid #f3f4f6', paddingTop: 16 }}>
          <button onClick={onClose} style={{ fontSize: 13, padding: '8px 16px', borderRadius: 8, border: '0.5px solid #e5e7eb', background: '#fff', color: '#6b7280', cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} style={{ fontSize: 13, padding: '8px 20px', borderRadius: 8, background: saving ? '#e5e7eb' : '#1F4E79', color: '#fff', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 500 }}>
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Contract'}
          </button>
        </div>
      </div>
    </div>
  )
}
