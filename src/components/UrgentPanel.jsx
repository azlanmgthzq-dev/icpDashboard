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

export default function UrgentPanel({ items, loading, upload, updateStatus }) {
    const [uploading, setUploading] = useState(false)
    const [dragOver, setDragOver] = useState(false)
    const [title, setTitle] = useState('')
    const [dueDate, setDueDate] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [selectedFile, setSelectedFile] = useState(null)

    const active = items.filter(i => i.status !== 'Done')

    async function handleUpload() {
        if (!selectedFile || !title) return
        setUploading(true)
        await upload(selectedFile, {
            title, due_date: dueDate || null,
            uploaded_by: 'You', status: 'Pending'
        })
        setTitle(''); setDueDate(''); setSelectedFile(null); setShowForm(false)
        setUploading(false)
    }

    return (
        <div style={{
            background: '#fff', border: '0.5px solid #e5e7eb',
            borderRadius: 12, padding: '14px 16px', marginBottom: 20
        }}>
            <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: 12
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 500, fontSize: 14 }}>Urgent folder</span>
                    {active.length > 0 && (
                        <span style={{
                            background: '#E24B4A', color: '#fff',
                            fontSize: 10, padding: '1px 7px', borderRadius: 10
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
                            background: showForm ? '#EAF3FB' : '#fff', color: '#374151'
                        }}>
                        + Upload
                    </button>
                    <a href="https://globalturbineasiacom.sharepoint.com/:f:/s/ICPOffsetManagement/IgD_uknY2SxTRLV-5pHAWoivAYd4p6ce7a9zPgKYpo4dk10?e=mNZNte" target="_blank" rel="noreferrer"
                        style={{
                            fontSize: 12, padding: '5px 12px', borderRadius: 8,
                            border: '0.5px solid #e5e7eb', cursor: 'pointer',
                            background: '#fff', color: '#374151', textDecoration: 'none',
                            display: 'flex', alignItems: 'center', gap: 5
                        }}>
                        <svg width="13" height="13" viewBox="0 0 16 16" fill="#5059C9">
                            <rect x="2" y="5" width="8" height="8" rx="1.5" />
                            <rect x="7" y="2" width="7" height="7" rx="1.5" opacity=".6" />
                        </svg>
                        Open Teams
                    </a>
                </div>
            </div>

            {showForm && (
                <div style={{
                    background: '#f9fafb', borderRadius: 8,
                    padding: 12, marginBottom: 12, border: '0.5px solid #e5e7eb'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <input
                            placeholder="Title / document name"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            style={{
                                padding: '7px 10px', borderRadius: 6, border: '0.5px solid #d1d5db',
                                fontSize: 13, outline: 'none'
                            }}
                        />
                        <input type="date" value={dueDate}
                            onChange={e => setDueDate(e.target.value)}
                            style={{
                                padding: '7px 10px', borderRadius: 6, border: '0.5px solid #d1d5db',
                                fontSize: 13, outline: 'none', color: '#374151'
                            }}
                        />
                        <div
                            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={e => { e.preventDefault(); setDragOver(false); setSelectedFile(e.dataTransfer.files[0]) }}
                            onClick={() => document.getElementById('file-input').click()}
                            style={{
                                border: `1.5px dashed ${dragOver ? '#378ADD' : '#d1d5db'}`,
                                borderRadius: 8, padding: '14px', textAlign: 'center',
                                cursor: 'pointer', background: dragOver ? '#EBF3FB' : '#fff',
                                transition: 'all 0.2s'
                            }}>
                            <input id="file-input" type="file" hidden
                                onChange={e => setSelectedFile(e.target.files[0])} />
                            <div style={{ fontSize: 12, color: '#6b7280' }}>
                                {selectedFile ? `✓ ${selectedFile.name}` : 'Drop file here or click to browse'}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => { setShowForm(false); setTitle(''); setDueDate(''); setSelectedFile(null); }}
                                type="button"
                                style={{
                                    flex: 1, padding: '8px', borderRadius: 8, border: '0.5px solid #d1d5db',
                                    background: '#fff', color: '#374151', fontSize: 13, cursor: 'pointer'
                                }}>
                                Cancel
                            </button>
                            <button onClick={handleUpload} disabled={uploading || !title || !selectedFile}
                                type="button"
                                style={{
                                    flex: 2, padding: '8px', borderRadius: 8, border: 'none',
                                    background: '#1F4E79', color: '#fff', fontSize: 13,
                                    cursor: uploading ? 'not-allowed' : 'pointer',
                                    opacity: (!title || !selectedFile) ? 0.5 : 1
                                }}>
                                {uploading ? 'Uploading...' : 'Upload to urgent folder'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                                borderBottom: i < active.length - 1 ? '0.5px solid #f3f4f6' : 'none'
                            }}>
                                <div style={{
                                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                                    marginTop: 5, background: DOT_COLORS[item.status] || '#EF9F27'
                                }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>
                                        {item.title}
                                    </div>
                                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                                        {item.due_date && `Due ${new Date(item.due_date)
                                            .toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                                        {item.uploaded_by && ` · ${item.uploaded_by}`}
                                        {item.contracts?.name && ` · ${item.contracts.name}`}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                                    <span style={{
                                        fontSize: 10, padding: '2px 8px', borderRadius: 10,
                                        background: sc.bg, color: sc.color
                                    }}>
                                        {item.status}
                                    </span>
                                    <select
                                        value={item.status}
                                        onChange={e => updateStatus(item.id, e.target.value)}
                                        style={{
                                            fontSize: 10, padding: '2px 4px', borderRadius: 6,
                                            border: '0.5px solid #e5e7eb', color: '#6b7280',
                                            cursor: 'pointer', background: '#fff'
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