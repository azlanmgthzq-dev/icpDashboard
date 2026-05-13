import { useSearchParams, useNavigate } from 'react-router-dom'
import { useContracts } from '../hooks/useContracts'

function fmtRM(n) {
  if (!n && n !== 0) return '—'
  if (n >= 1e9) return `RM ${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `RM ${(n / 1e6).toFixed(1)}M`
  return `RM ${Number(n).toLocaleString('en-MY')}`
}
function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-MY', { month: 'short', year: 'numeric' })
}

// ─── Tab 1: What is ICP? ──────────────────────────────────────────────────────

function WhatIsIcp() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #1F4E79 0%, #1a3c5e 55%, #0d2137 100%)',
        borderRadius: 14, padding: '36px 32px', color: '#fff', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -30, top: -30, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#93c5fd', marginBottom: 8 }}>
          Government Policy · MINDEF / MOF Malaysia
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 12px', lineHeight: 1.3 }}>
          Industrial Collaboration Programme (ICP)
        </h1>
        <p style={{ fontSize: 14, color: '#cbd5e1', margin: 0, lineHeight: 1.75, maxWidth: 680 }}>
          A mandatory framework requiring foreign companies awarded Malaysian government contracts above a defined threshold to invest back into Malaysian industry — through technology transfer, training, R&D, and strategic collaboration.
        </p>
      </div>

      {/* Overview + Formula */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 3, minWidth: 280, background: '#fff', borderRadius: 12, border: '0.5px solid #e5e7eb', borderTop: '3px solid #1F4E79', padding: '20px 22px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#1F4E79', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Programme Overview</div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#374151', lineHeight: 1.9 }}>
            <li>Applies to foreign contracts typically above <strong>RM 5 million</strong></li>
            <li>Obligation amount is negotiated between the foreign contractor and BIP (MINDEF)</li>
            <li>Companies must generate Industrial Collaboration Value (ICV) through BIP-approved activities</li>
            <li>ICV must meet or exceed the obligation to discharge the Performance Bond</li>
            <li>Administered by the <strong>Bahagian Industri Pertahanan (BIP)</strong> unit under MOF</li>
          </ul>
        </div>
        <div style={{ flex: 2, minWidth: 220, background: 'linear-gradient(135deg, #EBF3FB, #dbeafe)', borderRadius: 12, border: '1px solid #bfdbfe', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#1F4E79', textTransform: 'uppercase', letterSpacing: '0.07em' }}>ICV Formula</div>
          <div style={{ background: '#fff', borderRadius: 10, padding: '18px', textAlign: 'center', border: '1px solid #bfdbfe' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#1F4E79', marginBottom: 8 }}>ICV</div>
            <div style={{ fontSize: 13, color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span style={{ fontWeight: 600, color: '#1F4E79' }}>Nominal Value</span>
              <span style={{ fontSize: 20, color: '#6b7280', fontWeight: 300 }}>×</span>
              <span style={{ fontWeight: 600, color: '#1F4E79' }}>Multiplier</span>
            </div>
          </div>
          <p style={{ fontSize: 12, color: '#374151', margin: 0, lineHeight: 1.7 }}>
            Higher-multiplier activities generate more ICV per ringgit spent, letting companies reach their obligation faster.
          </p>
        </div>
      </div>

      {/* Multiplier table */}
      <div style={{ background: '#fff', borderRadius: 12, border: '0.5px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ padding: '13px 18px', borderBottom: '0.5px solid #e5e7eb', background: '#f8fafc', fontWeight: 600, fontSize: 13, color: '#1F4E79' }}>
          ICV Multiplier Reference Table
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              {['Activity Type', 'Multiplier', 'Impact'].map(h => (
                <th key={h} style={{ padding: '9px 16px', textAlign: 'left', fontWeight: 500, color: '#6b7280', fontSize: 11, borderBottom: '0.5px solid #e5e7eb' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { type: 'Basic Procurement / Direct Supply', mult: '1x', note: 'Direct spending only — minimal ICV generation', color: '#6b7280', bg: '#f3f4f6' },
              { type: 'Training & Human Capital Development', mult: '2x', note: 'Doubles the ICV per ringgit spent', color: '#185FA5', bg: '#E6F1FB' },
              { type: 'R&D / Technology Transfer', mult: '3x – 4x', note: 'High strategic value — encouraged by BIP', color: '#3B6D11', bg: '#EAF3DE' },
              { type: 'Strategic High-Value Collaboration', mult: '7.2x – 9x', note: 'Maximum multiplier — major ICV boost', color: '#854F0B', bg: '#FAEEDA' },
            ].map((m, i) => (
              <tr key={i} style={{ borderBottom: '0.5px solid #f3f4f6' }}>
                <td style={{ padding: '11px 16px', color: '#111827', fontWeight: 500 }}>{m.type}</td>
                <td style={{ padding: '11px 16px' }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: m.color, background: m.bg, padding: '3px 12px', borderRadius: 8 }}>{m.mult}</span>
                </td>
                <td style={{ padding: '11px 16px', color: '#6b7280', fontSize: 12 }}>{m.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Essential vs Strategic */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {[
          {
            label: 'Essential', bg: '#EAF3DE', color: '#3B6D11', border: '#3B6D11',
            desc: 'Operational spending that GTA must carry out to maintain core capability — still claimable as ICP.',
            items: ['EASA / regulatory certification renewal', 'Technical training & recurrency programmes', 'OEM royalty & licensing fees', 'Protégé programme salaries & allowances'],
          },
          {
            label: 'Strategic', bg: '#FAEEDA', color: '#854F0B', border: '#b45309',
            desc: 'Activities beyond normal operations that push GTA\'s strategic capability forward.',
            items: ['R&D and technology transfer initiatives', 'Digitization & IT system development', 'International exhibitions & LIMA conferences', 'Masters / PhD programme sponsorship'],
          },
        ].map(cat => (
          <div key={cat.label} style={{ flex: 1, minWidth: 280, background: '#fff', borderRadius: 12, border: '0.5px solid #e5e7eb', borderTop: `3px solid ${cat.border}`, padding: '20px 22px' }}>
            <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 10, background: cat.bg, color: cat.color, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
              {cat.label}
            </span>
            <p style={{ fontSize: 13, color: '#374151', margin: '0 0 10px', lineHeight: 1.7 }}>{cat.desc}</p>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: '#6b7280', lineHeight: 1.85 }}>
              {cat.items.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Tab 2: ICP in GTA ────────────────────────────────────────────────────────

function IcpInGta({ contracts, loading, totals }) {
  const navigate = useNavigate()
  const activeCount = contracts.filter(c => !c.duration_end || new Date(c.duration_end) > new Date()).length

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: '#fff', borderRadius: 12, border: '0.5px solid #e5e7eb', padding: '20px 24px', borderLeft: '4px solid #1F4E79' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1F4E79', margin: '0 0 8px' }}>Global Turbine Asia (GTA) &amp; ICP</h2>
        <p style={{ fontSize: 13, color: '#374151', margin: 0, lineHeight: 1.75 }}>
          Global Turbine Asia manages ICP obligations across <strong>{contracts.length} contracts</strong>, spanning MRO services, training programmes, and strategic technology collaboration. All Industrial Projects (IPDs) and BIP claim submissions are tracked through this dashboard.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {[
          { label: 'Total ICP Obligation', value: fmtRM(totals.obligation), color: '#1F4E79', borderColor: '#1F4E79', bg: '#EBF3FB' },
          { label: 'Total ICV Planned', value: fmtRM(totals.icv_planned), color: '#185FA5', borderColor: '#378ADD', bg: '#E6F1FB' },
          { label: 'BIP Approved ICV', value: fmtRM(totals.approved_icv), color: '#3B6D11', borderColor: '#1D9E75', bg: '#EAF3DE' },
          { label: 'Active Contracts', value: String(activeCount), color: '#854F0B', borderColor: '#EF9F27', bg: '#FAEEDA' },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, minWidth: 160, background: s.bg, borderRadius: 12, border: '0.5px solid #e5e7eb', borderTop: `3px solid ${s.borderColor}`, padding: '16px 18px' }}>
            <div style={{ fontSize: 11, color: s.color, fontWeight: 600, marginBottom: 6, opacity: 0.85 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{loading ? '…' : s.value}</div>
          </div>
        ))}
      </div>

      {/* Contracts table */}
      <div style={{ background: '#fff', borderRadius: 12, border: '0.5px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ padding: '13px 18px', borderBottom: '0.5px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
          <span style={{ fontWeight: 600, fontSize: 13, color: '#1F4E79' }}>Contract Summary</span>
          <button onClick={() => navigate('/contracts/1')} style={{ fontSize: 12, padding: '5px 12px', borderRadius: 6, background: '#1F4E79', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
            View Contract Details →
          </button>
        </div>
        {loading ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Loading…</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['Contract', 'Duration', 'Obligation', 'ICV Planned', 'BIP Approved', 'Status'].map(h => (
                    <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontWeight: 500, color: '#6b7280', fontSize: 11, borderBottom: '0.5px solid #e5e7eb', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {contracts.map(c => {
                  const end = c.duration_end ? new Date(c.duration_end) : null
                  const expired = end && end < new Date()
                  const monthsLeft = end ? Math.round((end - new Date()) / (1000 * 60 * 60 * 24 * 30)) : null
                  return (
                    <tr key={c.id} onClick={() => navigate(`/contracts/${c.id}`)} style={{ borderBottom: '0.5px solid #f3f4f6', cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <td style={{ padding: '11px 14px', fontWeight: 600, color: '#111827', maxWidth: 200 }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                        {c.contract_number && <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>{c.contract_number}</div>}
                      </td>
                      <td style={{ padding: '11px 14px', color: '#374151', fontSize: 12, whiteSpace: 'nowrap' }}>{fmtDate(c.duration_start)} – {fmtDate(c.duration_end)}</td>
                      <td style={{ padding: '11px 14px', color: '#111827', fontWeight: 500, whiteSpace: 'nowrap' }}>{fmtRM(c.obligation_value)}</td>
                      <td style={{ padding: '11px 14px', color: '#185FA5', whiteSpace: 'nowrap' }}>{fmtRM(c.total_icv_planned)}</td>
                      <td style={{ padding: '11px 14px', color: '#3B6D11', whiteSpace: 'nowrap' }}>{fmtRM(c.approved_planned_icv)}</td>
                      <td style={{ padding: '11px 14px' }}>
                        <span style={{
                          fontSize: 10, padding: '2px 8px', borderRadius: 8, fontWeight: 600,
                          background: expired ? '#FCEBEB' : (monthsLeft !== null && monthsLeft <= 9) ? '#FAEEDA' : '#EAF3DE',
                          color: expired ? '#A32D2D' : (monthsLeft !== null && monthsLeft <= 9) ? '#854F0B' : '#3B6D11',
                        }}>
                          {expired ? 'Expired' : monthsLeft !== null ? `${monthsLeft}m left` : 'Active'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Tab 3: Process Flow ──────────────────────────────────────────────────────

const ACTOR_STYLES = {
  GTA: { bg: '#EBF3FB', color: '#1F4E79', border: '#bfdbfe' },
  BOD: { bg: '#f3e8ff', color: '#6d28d9', border: '#c4b5fd' },
  RMAF: { bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
  BIP: { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  MOF: { bg: '#ecfeff', color: '#0e7490', border: '#a5f3fc' },
  MINDEF: { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' },
}

const FLOW_DATA = [
  { type: 'stage', num: 1, title: 'ICP PROPOSAL', bg: 'linear-gradient(90deg,#1F4E79,#2563eb)' },
  { type: 'step', actor: 'GTA', label: 'Receival of Obligation Letter' },
  { type: 'step', actor: 'RMAF', label: 'ICP Wishlist from RMAF' },
  { type: 'step', actor: 'GTA', label: 'Internal Discussion' },
  { type: 'step', actor: 'GTA', label: 'Initial Review & Feasibility' },
  { type: 'step', actor: 'GTA', label: 'Risk Assessment' },
  { type: 'step', actor: 'GTA', label: 'Consolidation of Proposal' },
  { type: 'step', actor: ['GTA', 'BOD'], label: 'Proposal Review & Approval' },
  { type: 'decision', question: 'Proposal Approved?', yes: 'Proceed to RMAF review', no: 'Revision & Resubmission ↺' },
  { type: 'step', actor: 'RMAF', label: 'RMAF JKICP Review' },
  { type: 'step', actor: ['GTA', 'RMAF', 'BIP'], label: 'GTA / RMAF / BIP Review' },
  { type: 'decision', question: 'BIP Accept?', yes: 'Proceed to MOF review', no: 'Back to Revision ↺' },
  { type: 'step', actor: ['BIP', 'MOF'], label: 'BIP / MOF Review (IOGC)' },
  { type: 'decision', question: 'MINDEF Approve?', yes: 'ICP Approval granted', no: 'Discharge / Revision' },
  { type: 'step', actor: 'GTA', label: 'Receival of ICP Approval' },
  { type: 'step', actor: 'GTA', label: 'ICP Agreement Signed' },

  { type: 'stage', num: 2, title: 'PROJECT EXECUTION', bg: 'linear-gradient(90deg,#166534,#16a34a)' },
  { type: 'step', actor: 'GTA', label: 'Implementation of ICP Project' },
  { type: 'step', actor: 'GTA', label: 'Project Execution' },
  { type: 'step', actor: 'GTA', label: 'Monitoring & Progress Reporting' },
  { type: 'step', actor: 'GTA', label: 'Project Completion' },

  { type: 'stage', num: 3, title: 'ICV CREDIT CLAIM', bg: 'linear-gradient(90deg,#b45309,#d97706)' },
  { type: 'step', actor: 'GTA', label: 'Preparation of Claim Document' },
  { type: 'step', actor: 'GTA', label: 'Gather All Invoices' },
  { type: 'step', actor: 'GTA', label: 'Prepare Pictures / Evidence of Items Procured' },
  { type: 'step', actor: 'GTA', label: 'Update Tracker to Capture Claimed Cost' },
  { type: 'step', actor: 'GTA', label: 'Fill in Claim Form' },
  { type: 'step', actor: 'GTA', label: 'Fill in Progress Report' },
  { type: 'step', actor: 'GTA', label: 'Contact BIP to Submit' },
  { type: 'note', label: 'Required Submission Documents', items: ['Invoice', 'Proof of Payment', 'Certificates (if any)', 'Completed Claim Form', 'Progress Report'] },

  { type: 'stage', num: 4, title: 'BIP REVIEW & APPROVAL', bg: 'linear-gradient(90deg,#6d28d9,#7c3aed)' },
  { type: 'step', actor: 'BIP', label: 'BIP Review & Audit' },
  { type: 'decision', question: 'Verify?', yes: 'Continue to IC Meeting', no: 'Back for Clarification' },
  { type: 'step', actor: 'BIP', label: 'IC Meeting & Review' },
  { type: 'decision', question: 'Claim Approved?', yes: 'ICV Banking', no: 'Discharge Penalty' },
  { type: 'step', actor: ['BIP', 'GTA'], label: 'ICV Banking' },
  { type: 'step', actor: 'GTA', label: 'Relief of Obligation' },
  { type: 'step', actor: 'GTA', label: 'Release of Performance Bond' },
  { type: 'end' },
]

function FlowArrow() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: 1.5, height: 14, background: '#94a3b8' }} />
      <svg width="10" height="6" viewBox="0 0 10 6"><polygon points="5,6 0,0 10,0" fill="#94a3b8" /></svg>
    </div>
  )
}

function ActorTag({ a }) {
  const s = ACTOR_STYLES[a] || { bg: '#f3f4f6', color: '#6b7280', border: '#e5e7eb' }
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 7, background: s.bg, color: s.color, border: `1px solid ${s.border}`, whiteSpace: 'nowrap' }}>
      {a}
    </span>
  )
}

function ProcessFlow() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* Actor legend */}
      <div style={{ background: '#fff', borderRadius: 12, border: '0.5px solid #e5e7eb', padding: '12px 18px', marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', marginRight: 4 }}>Parties:</span>
        {[
          ['GTA', 'Global Turbine Asia'],
          ['BOD', 'Board of Director'],
          ['RMAF', 'RMAF'],
          ['BIP', 'BIP (MINDEF)'],
          ['MOF', 'MOF'],
          ['MINDEF', 'MINDEF'],
        ].map(([key, label]) => {
          const s = ACTOR_STYLES[key]
          return (
            <span key={key} style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 8, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
              {label}
            </span>
          )
        })}
      </div>

      {/* Flow nodes */}
      {FLOW_DATA.map((node, i) => {
        if (node.type === 'stage') return (
          <div key={i}>
            {i > 0 && <FlowArrow />}
            <div style={{ background: node.bg, borderRadius: 10, padding: '11px 20px', display: 'flex', alignItems: 'center', gap: 12, color: '#fff' }}>
              <span style={{ fontSize: 10, fontWeight: 800, background: 'rgba(255,255,255,0.22)', padding: '2px 9px', borderRadius: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Stage {node.num}
              </span>
              <span style={{ fontSize: 14, fontWeight: 700 }}>{node.title}</span>
            </div>
          </div>
        )

        if (node.type === 'step') {
          const actors = Array.isArray(node.actor) ? node.actor : [node.actor]
          return (
            <div key={i}>
              <FlowArrow />
              <div style={{ background: '#fff', border: '0.5px solid #e5e7eb', borderRadius: 8, padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 13, color: '#1e293b', fontWeight: 500 }}>{node.label}</span>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {actors.map(a => <ActorTag key={a} a={a} />)}
                </div>
              </div>
            </div>
          )
        }

        if (node.type === 'decision') return (
          <div key={i}>
            <FlowArrow />
            <div style={{ background: '#fef9c3', border: '2px dashed #f59e0b', borderRadius: 8, padding: '12px 18px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Decision</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#78350f', marginBottom: 10 }}>{node.question}</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 120, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '7px 12px', fontSize: 12 }}>
                  <span style={{ fontWeight: 700, color: '#166534' }}>✓ Yes</span>
                  <span style={{ color: '#374151', marginLeft: 6 }}>→ {node.yes}</span>
                </div>
                <div style={{ flex: 1, minWidth: 120, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '7px 12px', fontSize: 12 }}>
                  <span style={{ fontWeight: 700, color: '#b91c1c' }}>✗ No</span>
                  <span style={{ color: '#374151', marginLeft: 6 }}>→ {node.no}</span>
                </div>
              </div>
            </div>
          </div>
        )

        if (node.type === 'note') return (
          <div key={i}>
            <FlowArrow />
            <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 8, padding: '12px 16px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#1F4E79', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>{node.label}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {node.items.map((item, j) => (
                  <span key={j} style={{ fontSize: 12, padding: '3px 10px', borderRadius: 6, background: '#fff', border: '0.5px solid #e5e7eb', color: '#374151' }}>{item}</span>
                ))}
              </div>
            </div>
          </div>
        )

        if (node.type === 'end') return (
          <div key={i}>
            <FlowArrow />
            <div style={{ background: 'linear-gradient(90deg,#1D9E75,#059669)', borderRadius: 10, padding: '14px 20px', textAlign: 'center', color: '#fff', fontWeight: 700, fontSize: 15 }}>
              ICP Obligation Discharged — END
            </div>
          </div>
        )

        return null
      })}
    </div>
  )
}

// ─── Tab 4: Our Contracts ─────────────────────────────────────────────────────

function OurContracts({ contracts, loading }) {
  const navigate = useNavigate()

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af', fontSize: 13 }}>Loading contracts…</div>

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: 16 }}>
        {contracts.map(c => {
          const end = c.duration_end ? new Date(c.duration_end) : null
          const today = new Date()
          const monthsLeft = end ? Math.round((end - today) / (1000 * 60 * 60 * 24 * 30)) : null
          const expired = end && end < today
          const pctApproved = c.total_icv_planned
            ? Math.min(100, Math.round((c.approved_planned_icv / c.total_icv_planned) * 100))
            : 0

          const expiryBg = expired ? '#FCEBEB' : (monthsLeft !== null && monthsLeft <= 9) ? '#FAEEDA' : '#EAF3DE'
          const expiryColor = expired ? '#A32D2D' : (monthsLeft !== null && monthsLeft <= 9) ? '#854F0B' : '#3B6D11'
          const expiryLabel = expired ? 'Expired' : monthsLeft !== null ? `${monthsLeft}m left` : 'Active'
          const barColor = pctApproved >= 70 ? '#1D9E75' : pctApproved >= 40 ? '#378ADD' : '#EF9F27'

          return (
            <div key={c.id} onClick={() => navigate(`/contracts/${c.id}`)}
              style={{ background: '#fff', borderRadius: 14, border: '0.5px solid #e5e7eb', borderTop: '3px solid #1F4E79', padding: '20px 22px', cursor: 'pointer', transition: 'box-shadow 0.15s, transform 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(31,78,121,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = '' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{ flex: 1, marginRight: 10 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1F4E79', lineHeight: 1.35, marginBottom: 3 }}>{c.name}</div>
                  {c.contract_number && <div style={{ fontSize: 11, color: '#9ca3af' }}>{c.contract_number}</div>}
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 8, flexShrink: 0, background: expiryBg, color: expiryColor }}>{expiryLabel}</span>
              </div>

              <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                {[
                  { label: 'Obligation', value: fmtRM(c.obligation_value), color: '#111827' },
                  { label: 'ICV Planned', value: fmtRM(c.total_icv_planned), color: '#185FA5' },
                  { label: 'BIP Approved', value: fmtRM(c.approved_planned_icv), color: '#3B6D11' },
                ].map(s => (
                  <div key={s.label} style={{ flex: 1, minWidth: 90 }}>
                    <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 2 }}>{s.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: '#6b7280' }}>ICV Claimed Progress</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#1F4E79' }}>{pctApproved}%</span>
                </div>
                <div style={{ background: '#f1f5f9', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                  <div style={{ width: `${pctApproved}%`, height: '100%', borderRadius: 4, background: barColor }} />
                </div>
              </div>

              {(c.duration_start || c.duration_end) && (
                <div style={{ marginTop: 10, fontSize: 11, color: '#9ca3af' }}>
                  {fmtDate(c.duration_start)} — {fmtDate(c.duration_end)}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'what-is-icp', label: 'What is ICP?' },
  { id: 'icp-in-gta', label: 'ICP in GTA' },
  { id: 'process-flow', label: 'Process Flow' },
  { id: 'our-contracts', label: 'Our Contracts' },
]

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'what-is-icp'
  const { contracts, loading, totals } = useContracts()

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f1f5f9' }}>
      <div style={{ background: '#fff', borderBottom: '0.5px solid #e5e7eb', padding: '0 28px', display: 'flex', alignItems: 'center', minHeight: 48, gap: 0 }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setSearchParams({ tab: tab.id })}
            style={{
              padding: '0 18px', height: 48, border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap',
              fontWeight: activeTab === tab.id ? 600 : 400,
              color: activeTab === tab.id ? '#1F4E79' : '#6b7280',
              borderBottom: activeTab === tab.id ? '2px solid #1F4E79' : '2px solid transparent',
              transition: 'color 0.12s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
        {activeTab === 'what-is-icp' && <WhatIsIcp />}
        {activeTab === 'icp-in-gta' && <IcpInGta contracts={contracts} loading={loading} totals={totals} />}
        {activeTab === 'process-flow' && <ProcessFlow />}
        {activeTab === 'our-contracts' && <OurContracts contracts={contracts} loading={loading} />}
      </div>
    </div>
  )
}
