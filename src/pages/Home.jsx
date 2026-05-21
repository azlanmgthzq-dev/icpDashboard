import { useState, useEffect, useRef } from 'react'
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

// ─── ICP Evolution Timeline ───────────────────────────────────────────────────

const TIMELINE_EVENTS = [
  { year: '1987', title: 'Countertrade Programme', desc: "Introduced by Ministry of Finance as Malaysia's first structured industrial collaboration mechanism." },
  { year: '1990', title: 'First Defence Offset', desc: 'Malaysia purchased Hawk aircraft from BAE Systems (UK) — the first formal defence offset arrangement.' },
  { year: '2005', title: 'Countertrade & Offset Policy', desc: 'Evolved into a comprehensive Countertrade and Offset Policy covering broader sectors.' },
  { year: '2014', title: 'Policy Update', desc: 'Updated Countertrade and Offset Policy with refined obligations and compliance mechanisms.' },
  { year: '2025', title: 'ICP — PK 1.7', desc: 'Rebranded as ICP under PK 1.7 with Outcome-Based Approach (OBA) introduced in the 3rd edition.' },
]

function IcpTimeline() {
  const [visible, setVisible] = useState(false)
  const [narrow, setNarrow] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.12 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const check = () => setNarrow(window.innerWidth < 680)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <div ref={ref} style={{
      background: '#fff', borderRadius: 12, border: '0.5px solid #e5e7eb', borderTop: '3px solid #1F4E79',
      padding: '20px 22px',
      opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(22px)',
      transition: 'opacity 0.55s ease, transform 0.55s ease',
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#1F4E79', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 20 }}>
        ICP Evolution Timeline
      </div>

      {narrow ? (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {TIMELINE_EVENTS.map((ev, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#1F4E79', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{ev.year}</div>
                {i < TIMELINE_EVENTS.length - 1 && <div style={{ width: 2, flex: 1, background: '#d1d5db', minHeight: 20, margin: '4px 0' }} />}
              </div>
              <div style={{ paddingTop: 14, paddingBottom: i < TIMELINE_EVENTS.length - 1 ? 20 : 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#378ADD', marginBottom: 4 }}>{ev.title}</div>
                <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6 }}>{ev.desc}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ position: 'relative', display: 'flex', alignItems: 'stretch' }}>
          <div style={{ position: 'absolute', left: '5%', right: '5%', height: 2, background: 'linear-gradient(90deg,#1F4E79,#378ADD,#1F4E79)', top: '50%', transform: 'translateY(-50%)', zIndex: 0 }} />
          {TIMELINE_EVENTS.map((ev, i) => {
            const above = i % 2 === 0
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0 }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '8px 6px 16px', textAlign: 'center', minHeight: 100 }}>
                  {above && (
                    <>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#378ADD', lineHeight: 1.35, marginBottom: 4 }}>{ev.title}</div>
                      <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.55 }}>{ev.desc}</div>
                    </>
                  )}
                </div>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#1F4E79', boxShadow: '0 0 0 3px #fff, 0 0 0 5px #1F4E79', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, flexShrink: 0, color: '#fff', fontSize: 11, fontWeight: 800 }}>{ev.year}</div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', padding: '16px 6px 8px', textAlign: 'center', minHeight: 100 }}>
                  {!above && (
                    <>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#378ADD', lineHeight: 1.35, marginBottom: 4 }}>{ev.title}</div>
                      <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.55 }}>{ev.desc}</div>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div style={{ textAlign: 'right', marginTop: 14, fontSize: 10, color: '#9ca3af', fontStyle: 'italic' }}>
        Sources: Malaysia MOF Policy Documents; Balakrishnan (2008 2009 test); PK 1.7 Third Edition (2025)
      </div>
    </div>
  )
}

// ─── Key Facts Grid ───────────────────────────────────────────────────────────

const KEY_FACTS_COLS = [
  {
    icon: '📅', title: 'History & Background', borderColor: '#1F4E79',
    facts: [
      { text: "Malaysia's first offset was in 1990 — Hawk aircraft purchased from BAE Systems (UK)", source: 'Balakrishnan (2008)' },
      { text: 'Offset value typically ranges from 30% to 400% of contract value', source: 'Balakrishnan (2008)' },
    ],
  },
  {
    icon: '📋', title: 'Policy & Obligation', borderColor: '#378ADD',
    facts: [
      { text: 'OBA (Outcome-Based Approach) introduced Jan 2025 under PK 1.7 3rd Edition', source: 'PK 1.7 Third Edition' },
      { text: 'NDIP: mandatory minimum 30% local content in all defence contracts', source: 'SA ICP MY Ecosystem — HO_GBDS & Contract' },
      { text: 'ICP viewed as tool for a self-reliant and resilient defence industry', source: 'PK 1.7 Third Edition' },
    ],
  },
  {
    icon: '🤝', title: 'Best Practice', borderColor: '#1D9E75',
    facts: [
      { text: 'Success depends on effective monitoring & auditing with a structured framework', source: 'Abdullah & Safari (2018)' },
      { text: 'Industrial partnerships built on mutual interest — government role: monitor, ensure delivery, mediate disputes', source: 'Balakrishnan & Johar (2021)' },
      { text: 'Clear integrated roadmap needed for technology transfer through offsets', source: 'Kumar Behera (2009)' },
    ],
  },
]

function KeyFactsGrid() {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(22px)', transition: 'opacity 0.6s ease 0.15s, transform 0.6s ease 0.15s' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#1F4E79', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
        Key Facts &amp; Research Insights
      </div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {KEY_FACTS_COLS.map((col, i) => (
          <div key={i}
            style={{ flex: 1, minWidth: 240, background: '#fff', borderRadius: 12, border: '0.5px solid #e5e7eb', borderTop: `3px solid ${col.borderColor}`, padding: '18px 20px', transition: 'box-shadow 0.2s, transform 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.10)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = '' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 18 }}>{col.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1F4E79' }}>{col.title}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {col.facts.map((fact, j) => (
                <div key={j}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <span style={{ color: col.borderColor, fontWeight: 700, flexShrink: 0 }}>•</span>
                    <span style={{ fontSize: 12, color: '#374151', lineHeight: 1.65 }}>{fact.text}</span>
                  </div>
                  <div style={{ fontSize: 10, color: '#9ca3af', fontStyle: 'italic', paddingLeft: 16, marginTop: 2 }}>{fact.source}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
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
            <li>Administered by the <strong>Bahagian Industri Pertahanan (BIP)</strong> unit under MINDEF</li>
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

      {/* ICP Evolution Timeline */}
      <IcpTimeline />

      {/* Key Facts Grid */}
      <KeyFactsGrid />
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

const CLAIM_DOCS = [
  'ICP Credit Claim Form',
  'ICP Implementation Form',
  'ICP Project Report (Annex 1A — photos, Annex 1B — feedback)',
  'Formal Letter Appendix',
  'Poster',
  'Business Trip Request Form',
  'Cash Advance Revision Form',
  'Expenses Claim Form',
  'Receipt',
  'Purchase Requisition',
  'Payment Voucher',
  'Quotation',
  'Invoice',
  'Mileage Claim Forms',
  'ACH Network Form',
]

function Lightbox({ src, alt, onClose }) {
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.87)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        cursor: 'zoom-out',
      }}
    >
      <img
        src={src} alt={alt}
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '95vw', maxHeight: '90vh', borderRadius: 10, boxShadow: '0 24px 80px rgba(0,0,0,0.6)', cursor: 'default', display: 'block' }}
      />
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: 20, right: 24, background: 'rgba(255,255,255,0.15)',
          border: '1px solid rgba(255,255,255,0.25)', color: '#fff', width: 36, height: 36,
          borderRadius: '50%', fontSize: 16, cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}
      >✕</button>
    </div>
  )
}

const STAGE_CHIP_COLORS = [
  { bg: '#EBF3FB', color: '#1F4E79', border: '#bfdbfe' },
  { bg: '#fef9c3', color: '#78350f', border: '#fde68a' },
  { bg: '#EAF3DE', color: '#3B6D11', border: '#bbf7d0' },
]

function StageChips({ stages }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
      {stages.map((s, i) => {
        const c = STAGE_CHIP_COLORS[i] || STAGE_CHIP_COLORS[0]
        return (
          <span key={i} style={{ fontSize: 12, fontWeight: 600, padding: '5px 14px', borderRadius: 20, background: c.bg, color: c.color, border: `1px solid ${c.border}`, whiteSpace: 'nowrap' }}>
            {s}
          </span>
        )
      })}
    </div>
  )
}

function ProcessFlow() {
  const [lightbox, setLightbox] = useState(null)

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* Section 1 — ICP Proposal Flow */}
      <div style={{ background: '#fff', borderRadius: 12, border: '0.5px solid #e5e7eb', borderTop: '3px solid #1F4E79', padding: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#1F4E79', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 16 }}>
          Section 1 — ICP Proposal Flow
        </div>
        <img
          src="/flowchart/icp-proposal-flow.webp"
          alt="ICP Proposal Flow"
          onClick={() => setLightbox('/flowchart/icp-proposal-flow.webp')}
          style={{ width: '100%', borderRadius: 10, boxShadow: '0 2px 14px rgba(31,78,121,0.10)', cursor: 'zoom-in', display: 'block', border: '0.5px solid #e5e7eb' }}
        />
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1F4E79', marginBottom: 8 }}>ICP Proposal Process</div>
          <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.75, margin: 0 }}>
            The ICP Proposal process begins with GTA receiving the Obligation Letter from BIP, followed by internal discussions and feasibility assessments. GTA consolidates its proposal with RMAF's wishlist before submitting for review through multiple levels — RMAF JKICP, BIP, and IOGC — until final approval by the Implementation Committee (IC). If rejected at any stage, GTA revises and resubmits the proposal.
          </p>
          <StageChips stages={[
            'Stage 1: Proposal Preparation',
            'Stage 2: Multi-level Review (RMAF → BIP → IOGC)',
            'Stage 3: IC Decision & Implementation',
          ]} />
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, margin: '0 24px', background: 'linear-gradient(90deg,transparent,#e5e7eb,transparent)' }} />

      {/* Section 2 — ICV Credit Claim Flow */}
      <div style={{ background: '#fff', borderRadius: 12, border: '0.5px solid #e5e7eb', borderTop: '3px solid #378ADD', padding: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#378ADD', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 16 }}>
          Section 2 — ICV Credit Claim Flow
        </div>
        <img
          src="/flowchart/icv-credit-claim-flow.webp"
          alt="ICV Credit Claim Flow"
          onClick={() => setLightbox('/flowchart/icv-credit-claim-flow.webp')}
          style={{ width: '100%', borderRadius: 10, boxShadow: '0 2px 14px rgba(31,78,121,0.10)', cursor: 'zoom-in', display: 'block', border: '0.5px solid #e5e7eb' }}
        />
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1F4E79', marginBottom: 8 }}>ICV Credit Claim Process</div>
          <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.75, margin: '0 0 20px' }}>
            Once an ICP project is completed, GTA prepares the claim document by gathering all invoices, evidence photos, and filling in the required forms. The submission package is then sent to BIP for review and audit by the Implementation Committee (IC). If approved, GTA receives the ICV Credit Value Approval Letter.
          </p>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#1F4E79', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
            Required Submission Documents
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {CLAIM_DOCS.map((doc, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: '#f8fafc', borderRadius: 8, padding: '7px 10px', border: '0.5px solid #e5e7eb' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#1F4E79', flexShrink: 0, minWidth: 18, marginTop: 1 }}>{String(i + 1).padStart(2, '0')}</span>
                <span style={{ fontSize: 12, color: '#374151', lineHeight: 1.45 }}>{doc}</span>
              </div>
            ))}
          </div>
          <StageChips stages={[
            'Stage 1: Claim Preparation & Document Gathering',
            'Stage 2: BIP Review & IC Audit',
            'Stage 3: ICV Credit Approval',
          ]} />
        </div>
      </div>

      {lightbox && <Lightbox src={lightbox} alt="Process flow diagram" onClose={() => setLightbox(null)} />}
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

const TAB_BG = {
  'what-is-icp':   '/services_images/service1.jpg',
  'icp-in-gta':    '/services_images/dato.jpg',
  'process-flow':  '/services_images/maintenance1.jpg',
  'our-contracts': '/services_images/LW-1035.jpg',
}

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

      <div style={{
        flex: 1, overflowY: 'auto', padding: '28px 32px',
        backgroundImage: `linear-gradient(rgba(15,32,68,0.88), rgba(15,32,68,0.80)), url(${TAB_BG[activeTab]})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        transition: 'background-image 0.3s ease',
      }}>
        {activeTab === 'what-is-icp' && <WhatIsIcp />}
        {activeTab === 'icp-in-gta' && <IcpInGta contracts={contracts} loading={loading} totals={totals} />}
        {activeTab === 'process-flow' && <ProcessFlow />}
        {activeTab === 'our-contracts' && <OurContracts contracts={contracts} loading={loading} />}
      </div>
    </div>
  )
}
