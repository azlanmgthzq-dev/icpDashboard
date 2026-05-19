import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useContracts } from '../hooks/useContracts'

const LAYERS = ['All', 'Contract', 'IPD', 'Milestone']

const LAYER_STYLE = {
  'Contract': { bg: '#EBF3FB', color: '#185FA5' },
  'IPD': { bg: '#EAF3DE', color: '#3B6D11' },
  'Milestone': { bg: '#EEEDFE', color: '#3C3489' },
}

const DATE_RANGES = ['All Time', 'This Week', 'This Month', 'This Year']

const EMPTY_FORM = {
  layer: 'Contract',
  contract_id: '',
  ipd_id: '',
  milestone_id: '',
  title: '',
  doc_link: '',
  storage_path: '',
  attached_by: '',
  notes: '',
}

function fmtDate(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })
}

function isWithinRange(ts, range) {
  if (!ts || range === 'All Time') return true
  const d = new Date(ts)
  const now = new Date()
  if (range === 'This Week') {
    const start = new Date(now)
    start.setDate(now.getDate() - now.getDay())
    start.setHours(0, 0, 0, 0)
    return d >= start
  }
  if (range === 'This Month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  if (range === 'This Year') return d.getFullYear() === now.getFullYear()
  return true
}

function LayerBadge({ layer }) {
  const s = LAYER_STYLE[layer] || { bg: '#f3f4f6', color: '#6b7280' }
  return (
    <span style={{
      fontSize: 10, padding: '2px 8px', borderRadius: 10,
      background: s.bg, color: s.color, fontWeight: 600, whiteSpace: 'nowrap',
    }}>
      {layer}
    </span>
  )
}

export default function DocumentReference() {
  const { contracts } = useContracts()
  const fileInputRef = useRef(null)

  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [activeLayer, setActiveLayer] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterContract, setFilterContract] = useState('')
  const [filterDate, setFilterDate] = useState('All Time')

  // Modals
  const [showModal, setShowModal] = useState(false)
  const [editingDoc, setEditingDoc] = useState(null)
  const [previewDoc, setPreviewDoc] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  // Form
  const [form, setForm] = useState(EMPTY_FORM)
  const [formIpds, setFormIpds] = useState([])
  const [formMilestones, setFormMilestones] = useState([])
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState('')
  const [formError, setFormError] = useState('')

  useEffect(() => { fetchDocs() }, [])

  // Load IPDs when contract changes in form
  useEffect(() => {
    if (!form.contract_id || form.layer === 'Contract') {
      setFormIpds([])
      setFormMilestones([])
      return
    }
    supabase.from('ipds').select('id, code, description')
      .eq('contract_id', form.contract_id).order('code')
      .then(({ data }) => setFormIpds(data || []))
  }, [form.contract_id, form.layer])

  // Load parent milestones when IPD changes in form
  useEffect(() => {
    if (!form.ipd_id || form.layer !== 'Milestone') {
      setFormMilestones([])
      return
    }
    supabase.from('ipd_milestones').select('id, milestone_desc, submission_number')
      .eq('ipd_id', form.ipd_id)
      .is('parent_milestone_id', null)
      .order('created_at')
      .then(({ data }) => setFormMilestones(data || []))
  }, [form.ipd_id, form.layer])

  async function fetchDocs() {
    setLoading(true)
    const { data, error } = await supabase
      .from('icp_documents')
      .select(`
        *,
        contracts(name),
        ipds(code, description),
        ipd_milestones(milestone_desc, submission_number)
      `)
      .order('created_at', { ascending: false })
    if (!error) setDocs(data || [])
    setLoading(false)
  }

  async function handleFileUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.type !== 'application/pdf') { setFormError('Only PDF files are supported.'); return }
    setUploading(true)
    setFormError('')
    try {
      const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`
      const { error } = await supabase.storage.from('icp-documents').upload(fileName, file, { contentType: 'application/pdf' })
      if (error) throw error
      if (form.storage_path) await supabase.storage.from('icp-documents').remove([form.storage_path])
      const { data: { publicUrl } } = supabase.storage.from('icp-documents').getPublicUrl(fileName)
      setForm(f => ({ ...f, doc_link: publicUrl, storage_path: fileName }))
      setUploadedFileName(file.name)
    } catch (e) {
      setFormError(e.message || 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  function openAdd() {
    setEditingDoc(null); setForm(EMPTY_FORM); setUploadedFileName(''); setFormError('')
    setFormIpds([]); setFormMilestones([]); setShowModal(true)
  }

  function openEdit(doc) {
    setEditingDoc(doc)
    setForm({
      layer: doc.layer || 'Contract',
      contract_id: doc.contract_id || '',
      ipd_id: doc.ipd_id || '',
      milestone_id: doc.milestone_id || '',
      title: doc.title || '',
      doc_link: doc.doc_link || '',
      storage_path: doc.storage_path || '',
      attached_by: doc.attached_by || '',
      notes: doc.notes || '',
    })
    setUploadedFileName(''); setFormError(''); setShowModal(true)
  }

  function closeModal() {
    setShowModal(false); setEditingDoc(null); setForm(EMPTY_FORM)
    setFormIpds([]); setFormMilestones([]); setUploadedFileName(''); setFormError('')
  }

  async function handleSave() {
    if (!form.contract_id || !form.title.trim()) { setFormError('Contract and Title are required.'); return }
    if (form.layer === 'IPD' && !form.ipd_id) { setFormError('Please select an IPD.'); return }
    if (form.layer === 'Milestone' && (!form.ipd_id || !form.milestone_id)) {
      setFormError('Please select an IPD and Milestone.'); return
    }
    setSaving(true); setFormError('')
    try {
      const payload = {
        layer: form.layer,
        contract_id: parseInt(form.contract_id),
        ipd_id: form.ipd_id ? parseInt(form.ipd_id) : null,
        milestone_id: form.milestone_id ? parseInt(form.milestone_id) : null,
        title: form.title.trim(),
        doc_link: form.doc_link.trim() || null,
        storage_path: form.storage_path || null,
        attached_by: form.attached_by.trim() || null,
        notes: form.notes.trim() || null,
      }
      const { error } = editingDoc
        ? await supabase.from('icp_documents').update(payload).eq('id', editingDoc.id)
        : await supabase.from('icp_documents').insert([payload])
      if (error) throw error
      closeModal(); await fetchDocs()
    } catch (e) {
      setFormError(e.message || 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    const doc = docs.find(d => d.id === id)
    if (doc?.storage_path) await supabase.storage.from('icp-documents').remove([doc.storage_path])
    const { error } = await supabase.from('icp_documents').delete().eq('id', id)
    if (!error) { setConfirmDeleteId(null); await fetchDocs() }
  }

  const filtered = docs.filter(d => {
    const q = searchTerm.toLowerCase()
    const matchLayer = activeLayer === 'All' || d.layer === activeLayer
    const matchSearch = !q || d.title?.toLowerCase().includes(q) || d.attached_by?.toLowerCase().includes(q)
    const matchContract = !filterContract || String(d.contract_id) === filterContract
    const matchDate = isWithinRange(d.created_at, filterDate)
    return matchLayer && matchSearch && matchContract && matchDate
  })

  function contextLabel(doc) {
    if (doc.layer === 'Contract') return null
    if (doc.layer === 'IPD') {
      const ipd = doc.ipds
      return ipd ? `${ipd.code} — ${ipd.description || ''}` : '—'
    }
    if (doc.layer === 'Milestone') {
      const ipd = doc.ipds
      const ms = doc.ipd_milestones
      const ipdPart = ipd ? ipd.code : '—'
      const msPart = ms?.milestone_desc || ms?.submission_number || '—'
      return `${ipdPart} · ${msPart}`
    }
    return null
  }

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 13 }}>
      Loading documents...
    </div>
  )

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: '#f9fafb' }}>

      {/* ── Page header ── */}
      <div style={{
        padding: '24px 28px 0',
        borderBottom: '0.5px solid #e5e7eb',
        background: '#fff',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Document Reference</h1>
            <p style={{ fontSize: 13, color: '#9ca3af', margin: '4px 0 0' }}>
              {filtered.length} document{filtered.length !== 1 ? 's' : ''} · organised by contract, IPD, and milestone
            </p>
          </div>
          <button
            onClick={openAdd}
            style={{
              fontSize: 13, padding: '8px 16px', borderRadius: 8,
              background: '#1F4E79', color: '#fff', border: 'none',
              cursor: 'pointer', fontWeight: 500, marginTop: 4,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#185FA5' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#1F4E79' }}
          >
            + Add Document
          </button>
        </div>

        {/* Layer tabs */}
        <div style={{ display: 'flex', gap: 2 }}>
          {LAYERS.map(layer => {
            const isActive = activeLayer === layer
            return (
              <button
                key={layer}
                onClick={() => setActiveLayer(layer)}
                style={{
                  fontSize: 13, padding: '8px 16px', border: 'none', cursor: 'pointer',
                  background: 'transparent', fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#1F4E79' : '#6b7280',
                  borderBottom: isActive ? '2px solid #1F4E79' : '2px solid transparent',
                  transition: 'all 0.15s',
                }}
              >
                {layer}
                {layer !== 'All' && (
                  <span style={{
                    marginLeft: 6, fontSize: 10, padding: '1px 6px', borderRadius: 10,
                    background: isActive ? '#EBF3FB' : '#f3f4f6',
                    color: isActive ? '#185FA5' : '#9ca3af',
                  }}>
                    {docs.filter(d => d.layer === layer).length}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ padding: '20px 28px' }}>

        {/* Filter bar */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"
              style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}>
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by title or attached by..."
              style={{
                width: '100%', padding: '8px 12px 8px 32px', fontSize: 13,
                border: '0.5px solid #e5e7eb', borderRadius: 8, outline: 'none',
                background: '#fff', color: '#111827', boxSizing: 'border-box',
              }}
            />
          </div>

          <select
            value={filterContract}
            onChange={e => setFilterContract(e.target.value)}
            style={{
              fontSize: 13, padding: '8px 12px', border: '0.5px solid #e5e7eb',
              borderRadius: 8, background: '#fff', color: '#374151', outline: 'none',
            }}
          >
            <option value="">All Contracts</option>
            {contracts.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
          </select>

          <select
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            style={{
              fontSize: 13, padding: '8px 12px', border: '0.5px solid #e5e7eb',
              borderRadius: 8, background: '#fff', color: '#374151', outline: 'none',
            }}
          >
            {DATE_RANGES.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>

        {/* Table */}
        <div style={{ background: '#fff', border: '0.5px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
              No documents found.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    {['No.', 'Level', 'Document Title', 'Contract', 'IPD / Milestone context', 'Attached By', 'Date', 'Preview', 'Actions'].map(h => (
                      <th key={h} style={{
                        padding: '10px 14px', textAlign: 'left', fontWeight: 500,
                        color: '#6b7280', fontSize: 11, whiteSpace: 'nowrap',
                        borderBottom: '0.5px solid #e5e7eb',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((doc, i) => (
                    <tr
                      key={doc.id}
                      style={{ borderBottom: '0.5px solid #f3f4f6', transition: 'background 0.12s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#fafafa' }}
                      onMouseLeave={e => { e.currentTarget.style.background = '' }}
                    >
                      <td style={{ padding: '12px 14px', color: '#9ca3af', fontSize: 12 }}>{i + 1}</td>

                      <td style={{ padding: '12px 14px' }}>
                        <LayerBadge layer={doc.layer} />
                      </td>

                      <td style={{ padding: '12px 14px', fontWeight: 500, color: '#111827', maxWidth: 260 }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {doc.title}
                        </div>
                        {doc.notes && (
                          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {doc.notes}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', fontSize: 12, color: '#374151' }}>
                        {doc.contracts?.name || '—'}
                      </td>

                      <td style={{ padding: '12px 14px', fontSize: 12, color: '#6b7280', maxWidth: 220 }}>
                        {contextLabel(doc)
                          ? <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{contextLabel(doc)}</span>
                          : <span style={{ color: '#d1d5db' }}>—</span>}
                      </td>

                      <td style={{ padding: '12px 14px', fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap' }}>
                        {doc.attached_by || '—'}
                      </td>

                      <td style={{ padding: '12px 14px', fontSize: 12, color: '#9ca3af', whiteSpace: 'nowrap' }}>
                        {fmtDate(doc.created_at)}
                      </td>

                      <td style={{ padding: '12px 14px' }}>
                        {doc.doc_link ? (
                          <button
                            onClick={() => setPreviewDoc(doc)}
                            style={{
                              fontSize: 11, padding: '4px 10px', borderRadius: 6,
                              background: '#EBF3FB', color: '#185FA5', border: 'none',
                              cursor: 'pointer', fontWeight: 500,
                            }}
                          >
                            Preview
                          </button>
                        ) : (
                          <span style={{ color: '#d1d5db', fontSize: 12 }}>—</span>
                        )}
                      </td>

                      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                        <button
                          onClick={() => openEdit(doc)}
                          style={{
                            fontSize: 11, padding: '4px 10px', borderRadius: 6,
                            background: '#f3f4f6', color: '#374151', border: 'none',
                            cursor: 'pointer', marginRight: 4,
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#e5e7eb' }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#f3f4f6' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(doc.id)}
                          style={{
                            fontSize: 11, padding: '4px 10px', borderRadius: 6,
                            background: '#fff', color: '#ef4444', border: '0.5px solid #fca5a5',
                            cursor: 'pointer',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2' }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── PDF Preview Modal ── */}
      {previewDoc && (
        <div
          onClick={() => setPreviewDoc(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 12, overflow: 'hidden',
              width: '90vw', maxWidth: 960, height: '88vh',
              display: 'flex', flexDirection: 'column',
            }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', borderBottom: '0.5px solid #e5e7eb', background: '#f9fafb',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <LayerBadge layer={previewDoc.layer} />
                <span style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{previewDoc.title}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <a
                  href={previewDoc.doc_link}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontSize: 12, padding: '5px 12px', borderRadius: 6,
                    background: '#EBF3FB', color: '#185FA5',
                    textDecoration: 'none', fontWeight: 500,
                  }}
                >
                  Open ↗
                </a>
                <button
                  onClick={() => setPreviewDoc(null)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 18, color: '#9ca3af', lineHeight: 1, padding: '4px 8px',
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
            <iframe
              src={previewDoc.doc_link}
              title={previewDoc.title}
              style={{ flex: 1, border: 'none', width: '100%' }}
            />
          </div>
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div
          onClick={closeModal}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 12, padding: 24,
              width: '100%', maxWidth: 520, maxHeight: '92vh', overflowY: 'auto',
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>
              {editingDoc ? 'Edit Document' : 'Add Document'}
            </h3>

            {formError && (
              <div style={{
                fontSize: 12, color: '#A32D2D', background: '#FCEBEB',
                border: '0.5px solid #fca5a5', borderRadius: 6,
                padding: '8px 12px', marginBottom: 14,
              }}>
                {formError}
              </div>
            )}

            {/* Layer selector */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 6 }}>
                DOCUMENT LEVEL
              </label>
              <div style={{ display: 'flex', gap: 6 }}>
                {['Contract', 'IPD', 'Milestone'].map(layer => {
                  const isActive = form.layer === layer
                  const s = LAYER_STYLE[layer]
                  return (
                    <button
                      key={layer}
                      onClick={() => setForm(f => ({ ...f, layer, ipd_id: '', milestone_id: '' }))}
                      style={{
                        flex: 1, padding: '7px 0', fontSize: 12, fontWeight: 600,
                        border: isActive ? `1.5px solid ${s.color}` : '1.5px solid #e5e7eb',
                        borderRadius: 8, cursor: 'pointer',
                        background: isActive ? s.bg : '#fafafa',
                        color: isActive ? s.color : '#9ca3af',
                        transition: 'all 0.15s',
                      }}
                    >
                      {layer}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Contract */}
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Contract <Req /></label>
              <select
                value={form.contract_id}
                onChange={e => setForm(f => ({ ...f, contract_id: e.target.value, ipd_id: '', milestone_id: '' }))}
                style={inputStyle}
              >
                <option value="">— Select Contract —</option>
                {contracts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* IPD (shown for IPD and Milestone layers) */}
            {(form.layer === 'IPD' || form.layer === 'Milestone') && (
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>IPD <Req /></label>
                <select
                  value={form.ipd_id}
                  onChange={e => setForm(f => ({ ...f, ipd_id: e.target.value, milestone_id: '' }))}
                  style={inputStyle}
                  disabled={!form.contract_id}
                >
                  <option value="">— Select IPD —</option>
                  {formIpds.map(ipd => (
                    <option key={ipd.id} value={ipd.id}>{ipd.code} — {ipd.description}</option>
                  ))}
                </select>
                {!form.contract_id && (
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Select a contract first</div>
                )}
              </div>
            )}

            {/* Milestone (shown for Milestone layer only) */}
            {form.layer === 'Milestone' && (
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Milestone <Req /></label>
                <select
                  value={form.milestone_id}
                  onChange={e => setForm(f => ({ ...f, milestone_id: e.target.value }))}
                  style={inputStyle}
                  disabled={!form.ipd_id}
                >
                  <option value="">— Select Milestone —</option>
                  {formMilestones.map(ms => (
                    <option key={ms.id} value={ms.id}>
                      {ms.milestone_desc || ms.submission_number || `Milestone #${ms.id}`}
                    </option>
                  ))}
                </select>
                {!form.ipd_id && (
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Select an IPD first</div>
                )}
              </div>
            )}

            {/* Title */}
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Document Title <Req /></label>
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Signed Contract PDF, ICV Approval Letter"
                style={inputStyle}
              />
            </div>

            {/* Upload PDF */}
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Upload PDF</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${uploadedFileName ? '#1D9E75' : '#d1d5db'}`,
                  borderRadius: 8, padding: '16px', textAlign: 'center',
                  cursor: 'pointer', background: uploadedFileName ? '#F0FBF4' : '#fafafa',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#185FA5' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = uploadedFileName ? '#1D9E75' : '#d1d5db' }}
              >
                <div style={{ fontSize: 11, color: uploadedFileName ? '#3B6D11' : '#9ca3af' }}>
                  {uploading ? 'Uploading...' : uploadedFileName ? `✓ ${uploadedFileName}` : 'Click to upload PDF'}
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file" accept="application/pdf"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
            </div>

            {/* Or paste URL */}
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Or paste URL</label>
              <input
                value={form.doc_link}
                onChange={e => setForm(f => ({ ...f, doc_link: e.target.value }))}
                placeholder="https://..."
                style={inputStyle}
              />
            </div>

            {/* Attached by */}
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Attached By</label>
              <input
                value={form.attached_by}
                onChange={e => setForm(f => ({ ...f, attached_by: e.target.value }))}
                placeholder="Your name"
                style={inputStyle}
              />
            </div>

            {/* Notes */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Notes</label>
              <textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Short description about this document..."
                rows={2}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={closeModal}
                style={{
                  fontSize: 13, padding: '8px 16px', borderRadius: 8,
                  border: '0.5px solid #e5e7eb', background: '#fff',
                  color: '#6b7280', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || uploading}
                style={{
                  fontSize: 13, padding: '8px 20px', borderRadius: 8,
                  background: saving || uploading ? '#e5e7eb' : '#1F4E79',
                  color: '#fff', border: 'none',
                  cursor: saving || uploading ? 'not-allowed' : 'pointer',
                  fontWeight: 500,
                }}
              >
                {saving ? 'Saving...' : 'Save Document'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {confirmDeleteId && (
        <div
          onClick={() => setConfirmDeleteId(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 12, padding: 24, width: 360 }}
          >
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>Delete document?</h3>
            <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 20px' }}>
              Fail yang diupload juga akan dipadam. Tindakan ini tidak boleh dibatalkan.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmDeleteId(null)}
                style={{
                  fontSize: 13, padding: '7px 14px', borderRadius: 8,
                  border: '0.5px solid #e5e7eb', background: '#fff', color: '#6b7280', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                style={{
                  fontSize: 13, padding: '7px 16px', borderRadius: 8,
                  background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 500,
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Small helpers ────────────────────────────────────────────────────────────
function Req() {
  return <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>
}

const labelStyle = {
  fontSize: 11, fontWeight: 600, color: '#6b7280',
  display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em',
}

const inputStyle = {
  width: '100%', padding: '8px 10px', fontSize: 13,
  border: '0.5px solid #e5e7eb', borderRadius: 8, outline: 'none',
  background: '#fff', color: '#111827', boxSizing: 'border-box',
}
