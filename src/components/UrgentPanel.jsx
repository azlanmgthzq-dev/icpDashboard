import { useState } from 'react'

const STATUS_COLORS = {
    Overdue: { bg: '#FCEBEB', color: '#A32D2D' },
    Urgent: { bg: '#FCEBEB', color: '#A32D2D' },
    Pending: { bg: '#FAEEDA', color: '#854F0B' },
    Review: { bg: '#E6F1FB', color: '#185FA5' },
    Done: { bg: '#EAF3DE', color: '#3B6D11' },
}

const DOT_COLORS = {
    Overdue: '#E24B4A', Urgent: '#E24B4A',
    Pending: '#EF9F27', Review: '#378ADD', Done: '#639922',
}

export default function UrgentPanel({ items, loading, addItem, updateStatus }) {
    const [showForm, setShowForm] = useState(false)
    const [title, setTitle] = useState('')
    const [dueDate, setDueDate] = useState('')
    const [link, setLink] = useState('')
    const [status, setStatus] = useState('Pending')
    const [submitting, setSubmitting] = useState(false)

    const active = items.filter(i => i.status !== 'Done')

    async function handleAdd() {
        if (!title.trim()) return
        setSubmitting(true)
        await addItem({
            title,
            due_date: dueDate || null,
            file_link: link || null,
            uploaded_by: 'You',
            status,
        })
        setTitle(''); setDueDate(''); setLink(''); setStatus('Pending'); setShowForm(false)
        setSubmitting(false)
    }

    function resetForm() {
        setTitle(''); setDueDate(''); setLink(''); setStatus('Pending'); setShowForm(false)
    }

    return (
        <div style={{
            background: '#fff',
            border: '0.5px solid #e5e7eb',
            borderRadius: 12,
            padding: '14px 16px',
            marginBottom: 20,
        }}>
            {/* ── Header ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 500, fontSize: 14 }}>Urgent folder</span>
                    {active.length > 0 && (
                        <span style={{
                            background: '#E24B4A', color: '#fff',
                            fontSize: 10, padding: '1px 7px', borderRadius: 10,
                        }}>
                            {active.length}
                        </span>
                    )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        style={{
                            fontSize: 12, padding: '5px 12px', borderRadius: 8,
                            border: '0.5px solid #e5e7eb', cursor: 'pointer',
                            background: showForm ? '#EAF3FB' : '#fff', color: '#374151',
                        }}>
                        + Add item
                    </button>
                    <a
                        href="https://globalturbineasiacom.sharepoint.com/:f:/s/ICPOffsetManagement/IgD_uknY2SxTRLV-5pHAWoivAYd4p6ce7a9zPgKYpo4dk10?e=mNZNte"
                        target="_blank" rel="noreferrer"
                        style={{
                            fontSize: 12, padding: '5px 12px', borderRadius: 8,
                            border: '0.5px solid #e5e7eb', cursor: 'pointer',
                            background: '#fff', color: '#374151', textDecoration: 'none',
                            display: 'flex', alignItems: 'center', gap: 5,
                        }}>
                        <svg width="13" height="13" viewBox="0 0 16 16" fill="#5059C9">
                            <rect x="2" y="5" width="8" height="8" rx="1.5" />
                            <rect x="7" y="2" width="7" height="7" rx="1.5" opacity=".6" />
                        </svg>
                        Open Teams
                    </a>
                </div>
            </div>

            {/* ── Add Item Form ── */}
            {showForm && (
                <div style={{
                    background: '#f9fafb', borderRadius: 8,
                    padding: 12, marginBottom: 12, border: '0.5px solid #e5e7eb',
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

                        {/* Title */}
                        <input
                            placeholder="Title / document name *"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            style={{
                                padding: '7px 10px', borderRadius: 6,
                                border: '0.5px solid #d1d5db',
                                fontSize: 13, outline: 'none',
                            }}
                        />

                        {/* Due date */}
                        <input
                            type="date"
                            value={dueDate}
                            onChange={e => setDueDate(e.target.value)}
                            style={{
                                padding: '7px 10px', borderRadius: 6,
                                border: '0.5px solid #d1d5db',
                                fontSize: 13, outline: 'none', color: '#374151',
                            }}
                        />

                        {/* File / SharePoint link */}
                        <div style={{ position: 'relative' }}>
                            <span style={{
                                position: 'absolute', left: 10, top: '50%',
                                transform: 'translateY(-50%)',
                                pointerEvents: 'none',
                            }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                                    stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                </svg>
                            </span>
                            <input
                                placeholder="Paste SharePoint / Teams / file link (optional)"
                                value={link}
                                onChange={e => setLink(e.target.value)}
                                style={{
                                    width: '100%', padding: '7px 10px 7px 30px',
                                    borderRadius: 6, border: '0.5px solid #d1d5db',
                                    fontSize: 13, outline: 'none', boxSizing: 'border-box',
                                }}
                            />
                        </div>

                        {/* Status selector */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap' }}>Set status:</span>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                {['Pending', 'Urgent', 'Review', 'Done'].map(s => {
                                    const sc = STATUS_COLORS[s]
                                    const selected = status === s
                                    return (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setStatus(s)}
                                            style={{
                                                fontSize: 11, padding: '3px 10px', borderRadius: 10,
                                                border: selected ? `1.5px solid ${sc.color}` : '0.5px solid #e5e7eb',
                                                background: selected ? sc.bg : '#fff',
                                                color: selected ? sc.color : '#6b7280',
                                                cursor: 'pointer', fontWeight: selected ? 600 : 400,
                                                transition: 'all 0.15s',
                                            }}>
                                            {s}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button
                                onClick={resetForm}
                                type="button"
                                style={{
                                    flex: 1, padding: '8px', borderRadius: 8,
                                    border: '0.5px solid #d1d5db', background: '#fff',
                                    color: '#374151', fontSize: 13, cursor: 'pointer',
                                }}>
                                Cancel
                            </button>
                            <button
                                onClick={handleAdd}
                                disabled={submitting || !title.trim()}
                                type="button"
                                style={{
                                    flex: 2, padding: '8px', borderRadius: 8,
                                    border: 'none', background: '#1F4E79', color: '#fff',
                                    fontSize: 13, cursor: submitting ? 'not-allowed' : 'pointer',
                                    opacity: !title.trim() ? 0.5 : 1,
                                }}>
                                {submitting ? 'Adding...' : 'Add to urgent folder'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Item List ── */}
            {loading ? (
                <div style={{ padding: 20, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                    Loading...
                </div>
            ) : active.length === 0 ? (
                <div style={{ padding: 20, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                    No urgent items
                </div>
            ) : (
                <div>
                    {active.map((item, i) => {
                        const sc = STATUS_COLORS[item.status] || STATUS_COLORS.Pending
                        return (
                            <div key={item.id} style={{
                                display: 'flex', alignItems: 'flex-start', gap: 10,
                                padding: '10px 0',
                                borderBottom: i < active.length - 1 ? '0.5px solid #f3f4f6' : 'none',
                            }}>
                                {/* Status dot */}
                                <div style={{
                                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                                    marginTop: 5, background: DOT_COLORS[item.status] || '#EF9F27',
                                }} />

                                {/* Content */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    {/* Title — clickable if link exists */}
                                    {item.file_link ? (
                                        <a
                                            href={item.file_link}
                                            target="_blank"
                                            rel="noreferrer"
                                            style={{
                                                fontSize: 13, fontWeight: 500, color: '#185FA5',
                                                textDecoration: 'none', display: 'inline-flex',
                                                alignItems: 'center', gap: 4,
                                            }}>
                                            {item.title}
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                                                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                                <polyline points="15 3 21 3 21 9" />
                                                <line x1="10" y1="14" x2="21" y2="3" />
                                            </svg>
                                        </a>
                                    ) : (
                                        <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>
                                            {item.title}
                                        </div>
                                    )}

                                    {/* Meta */}
                                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                                        {item.due_date && `Due ${new Date(item.due_date)
                                            .toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                                        {item.uploaded_by && ` · ${item.uploaded_by}`}
                                        {item.contracts?.name && ` · ${item.contracts.name}`}
                                    </div>
                                </div>

                                {/* Status badge + selector */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                                    <span style={{
                                        fontSize: 10, padding: '2px 8px', borderRadius: 10,
                                        background: sc.bg, color: sc.color,
                                    }}>
                                        {item.status}
                                    </span>
                                    <select
                                        value={item.status}
                                        onChange={e => updateStatus(item.id, e.target.value)}
                                        style={{
                                            fontSize: 10, padding: '2px 4px', borderRadius: 6,
                                            border: '0.5px solid #e5e7eb', color: '#6b7280',
                                            cursor: 'pointer', background: '#fff',
                                        }}>
                                        {['Pending', 'Urgent', 'Review', 'Done'].map(s => (
                                            <option key={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}