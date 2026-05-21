import { useState, useEffect } from 'react'

const CATEGORY_TYPE_OPTS = [
  'MRO', 'IT & MRO and Research & Development',
  'Exhibition, Collaboration & Conference',
  'Human Capital Development - Training',
  'Human Capital Development - Knowledge Transfer',
  'Supply Chain Development', 'Other',
]
const PROJECT_CAT_OPTS = ['Essential', 'Strategic']
const PROGRESS_OPTS = ['Not Started', 'In Progress', 'Completed', 'Pending', 'Re-submitted', 'Approved', 'Rejected']

const EMPTY = {
  code: '', description: '', category_type: '', project_category: '',
  beneficiary: '', objectives: '',
  plan_start: '', tentative_completion: '',
  estimated_nominal_value: '', multiplier: '', sum_plan_icv: '', credits_claim: '',
  claim_progress: 'Not Started', activity_progress: 'Not Started',
  claim_submission_date: '', bip_comments: '', status: 'Pending',
}

function toNum(v) { const n = parseFloat(v); return isNaN(n) ? null : n }
function toDate(v) { return v || null }

const labelStyle = { fontSize: 11, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' }
const inputStyle = { width: '100%', padding: '8px 10px', fontSize: 13, border: '0.5px solid #e5e7eb', borderRadius: 8, outline: 'none', background: '#fff', color: '#111827', boxSizing: 'border-box' }
const row2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }

function Section({ title }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '16px 0 12px', borderTop: '0.5px solid #f3f4f6', paddingTop: 12 }}>
      {title}
    </div>
  )
}

export default function IpdFormModal({ ipd, onSave, onClose }) {
  const isEdit = !!ipd
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (ipd) {
      setForm({
        code: ipd.code || '',
        description: ipd.description || '',
        category_type: ipd.category_type || '',
        project_category: ipd.project_category || '',
        beneficiary: ipd.beneficiary || '',
        objectives: ipd.objectives || '',
        plan_start: ipd.plan_start || '',
        tentative_completion: ipd.tentative_completion || '',
        estimated_nominal_value: ipd.estimated_nominal_value ?? '',
        multiplier: ipd.multiplier ?? '',
        sum_plan_icv: ipd.sum_plan_icv ?? '',
        credits_claim: ipd.credits_claim ?? '',
        claim_progress: ipd.claim_progress || 'Not Started',
        activity_progress: ipd.activity_progress || 'Not Started',
        claim_submission_date: ipd.claim_submission_date || '',
        bip_comments: ipd.bip_comments || '',
        status: ipd.status || 'Pending',
      })
    } else {
      setForm(EMPTY)
    }
  }, [ipd])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSave() {
    if (!form.code.trim() || !form.description.trim()) {
      setError('IPD Code and Description are required.')
      return
    }
    setSaving(true); setError('')
    try {
      await onSave({
        code: form.code.trim(),
        description: form.description.trim(),
        category_type: form.category_type || null,
        project_category: form.project_category || null,
        beneficiary: form.beneficiary || null,
        objectives: form.objectives || null,
        plan_start: toDate(form.plan_start),
        tentative_completion: toDate(form.tentative_completion),
        estimated_nominal_value: toNum(form.estimated_nominal_value),
        multiplier: toNum(form.multiplier),
        sum_plan_icv: toNum(form.sum_plan_icv),
        credits_claim: toNum(form.credits_claim),
        claim_progress: form.claim_progress || null,
        activity_progress: form.activity_progress || null,
        claim_submission_date: form.claim_submission_date || null,
        bip_comments: form.bip_comments || null,
        status: form.status || null,
      })
    } catch (e) {
      setError(e.message || 'Something went wrong.')
      setSaving(false)
    }
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 12, padding: 24, width: '100%', maxWidth: 600, maxHeight: '92vh', overflowY: 'auto' }}>

        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>
          {isEdit ? `Edit IPD — ${ipd.code}` : 'Add IPD'}
        </h3>

        {error && (
          <div style={{ fontSize: 12, color: '#A32D2D', background: '#FCEBEB', border: '0.5px solid #fca5a5', borderRadius: 6, padding: '8px 12px', marginBottom: 14 }}>
            {error}
          </div>
        )}

        {/* Identity */}
        <div style={{ ...row2, marginBottom: 12 }}>
          <div>
            <label style={labelStyle}>IPD Code <span style={{ color: '#ef4444' }}>*</span></label>
            <input value={form.code} onChange={e => set('code', e.target.value)} placeholder="e.g. IPD 1" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Project Category</label>
            <select value={form.project_category} onChange={e => set('project_category', e.target.value)} style={inputStyle}>
              <option value="">— Select —</option>
              {PROJECT_CAT_OPTS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Description <span style={{ color: '#ef4444' }}>*</span></label>
          <input value={form.description} onChange={e => set('description', e.target.value)} placeholder="Full IPD description" style={inputStyle} />
        </div>

        <div style={{ ...row2, marginBottom: 12 }}>
          <div>
            <label style={labelStyle}>Category / Type</label>
            <select value={form.category_type} onChange={e => set('category_type', e.target.value)} style={inputStyle}>
              <option value="">— Select —</option>
              {CATEGORY_TYPE_OPTS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Beneficiary</label>
            <input value={form.beneficiary} onChange={e => set('beneficiary', e.target.value)} placeholder="e.g. RMAF" style={inputStyle} />
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Objectives</label>
          <textarea value={form.objectives} onChange={e => set('objectives', e.target.value)} rows={2} placeholder="IPD objectives..." style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
        </div>

        <Section title="Financial" />

        <div style={{ ...row2, marginBottom: 12 }}>
          <div>
            <label style={labelStyle}>Est. Nominal Value (RM)</label>
            <input type="number" value={form.estimated_nominal_value} onChange={e => set('estimated_nominal_value', e.target.value)} placeholder="0" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Multiplier</label>
            <input type="number" step="0.01" value={form.multiplier} onChange={e => set('multiplier', e.target.value)} placeholder="0.00" style={inputStyle} />
          </div>
        </div>

        <div style={{ ...row2, marginBottom: 12 }}>
          <div>
            <label style={labelStyle}>Sum Plan ICV (RM)</label>
            <input type="number" value={form.sum_plan_icv} onChange={e => set('sum_plan_icv', e.target.value)} placeholder="0" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Credits Claim (RM)</label>
            <input type="number" value={form.credits_claim} onChange={e => set('credits_claim', e.target.value)} placeholder="0" style={inputStyle} />
          </div>
        </div>

        <Section title="Timeline & Status" />

        <div style={{ ...row2, marginBottom: 12 }}>
          <div>
            <label style={labelStyle}>Plan Start</label>
            <input type="date" value={form.plan_start} onChange={e => set('plan_start', e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Tentative Completion</label>
            <input type="date" value={form.tentative_completion} onChange={e => set('tentative_completion', e.target.value)} style={inputStyle} />
          </div>
        </div>

        <div style={{ ...row2, marginBottom: 12 }}>
          <div>
            <label style={labelStyle}>Claim Progress</label>
            <select value={form.claim_progress} onChange={e => set('claim_progress', e.target.value)} style={inputStyle}>
              {PROGRESS_OPTS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Activity Progress</label>
            <select value={form.activity_progress} onChange={e => set('activity_progress', e.target.value)} style={inputStyle}>
              {PROGRESS_OPTS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Claim Submission Date</label>
          <input type="date" value={form.claim_submission_date} onChange={e => set('claim_submission_date', e.target.value)} style={inputStyle} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Remark</label>
          <textarea value={form.bip_comments} onChange={e => set('bip_comments', e.target.value)} rows={2} placeholder="BIP reviewer comments..." style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', borderTop: '0.5px solid #f3f4f6', paddingTop: 16 }}>
          <button onClick={onClose} style={{ fontSize: 13, padding: '8px 16px', borderRadius: 8, border: '0.5px solid #e5e7eb', background: '#fff', color: '#6b7280', cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} style={{ fontSize: 13, padding: '8px 20px', borderRadius: 8, background: saving ? '#e5e7eb' : '#1F4E79', color: '#fff', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 500 }}>
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add IPD'}
          </button>
        </div>
      </div>
    </div>
  )
}
