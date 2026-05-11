import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

// Default fallback members if database is empty
const DEFAULT_MEMBERS = [
    { id: 1, name: 'Mohd Rizal B Mohtar', role: 'Head of Department (HOD)' },
    { id: 2, name: 'Nadia Omar', role: 'ICP Manager' },
    { id: 3, name: 'Ahmad Imaduddin', role: 'Project Executive' },
    { id: 4, name: 'Atiqah Azis', role: 'Operation & Documentation Exec' },
    { id: 5, name: 'Megat Amirul', role: 'Project IT Implementation Exec' },
]

export default function OrgChart() {
    const [members, setMembers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [uploadingId, setUploadingId] = useState(null)
    const fileInputRef = useRef(null)

    useEffect(() => {
        fetchMembers()
    }, [])

    async function fetchMembers() {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('org_members')
                .select('*')
                .order('id')

            if (error) {
                if (error.code === '42P01') {
                    // Table doesn't exist yet, show default
                    setMembers(DEFAULT_MEMBERS)
                    setError('Table "org_members" does not exist yet. Please run the setup SQL.')
                } else {
                    throw error
                }
            } else if (data && data.length > 0) {
                setMembers(data)
                setError(null)
            } else {
                setMembers(DEFAULT_MEMBERS)
            }
        } catch (err) {
            console.error('Error fetching org members:', err)
            setMembers(DEFAULT_MEMBERS)
        }
        setLoading(false)
    }

    // Helper to compress image before saving to DB
    const compressImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = (event) => {
                const img = new Image()
                img.src = event.target.result
                img.onload = () => {
                    const canvas = document.createElement('canvas')
                    const MAX_WIDTH = 300
                    const MAX_HEIGHT = 300
                    let width = img.width
                    let height = img.height

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width
                            width = MAX_WIDTH
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height
                            height = MAX_HEIGHT
                        }
                    }
                    canvas.width = width
                    canvas.height = height
                    const ctx = canvas.getContext('2d')
                    ctx.drawImage(img, 0, 0, width, height)
                    resolve(canvas.toDataURL('image/jpeg', 0.8)) // compress to base64 jpeg
                }
            }
        })
    }

    const handleFileChange = async (e) => {
        const file = e.target.files[0]
        if (!file || !uploadingId) return

        try {
            const base64Image = await compressImage(file)

            // Optimistic UI update
            setMembers(prev => prev.map(m => m.id === uploadingId ? { ...m, image_data: base64Image } : m))

            // Check if table exists by trying to update
            const { error } = await supabase
                .from('org_members')
                .update({ image_data: base64Image })
                .eq('id', uploadingId)

            if (error) {
                if (error.code === '42P01') {
                    alert('Sila run SQL command di bawah dahulu sebelum upload gambar.')
                } else {
                    throw error
                }
            }
        } catch (err) {
            console.error('Failed to upload image:', err)
            alert('Failed to upload image.')
            fetchMembers() // revert
        }

        setUploadingId(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const triggerUpload = (id) => {
        setUploadingId(id)
        if (fileInputRef.current) fileInputRef.current.click()
    }

    const hod = members.find(m => m.id === 1) || DEFAULT_MEMBERS[0]
    const manager = members.find(m => m.id === 2) || DEFAULT_MEMBERS[1]
    const execs = members.filter(m => m.id >= 3 && m.id <= 5)

    const renderCard = (member) => {
        if (!member) return null
        return (
            <div style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: 16,
                padding: '24px 20px',
                width: 260,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                position: 'relative',
                zIndex: 2,
            }}>
                <div
                    onClick={() => triggerUpload(member.id)}
                    style={{
                        width: 100, height: 100,
                        borderRadius: '50%',
                        background: '#f1f5f9',
                        border: '3px solid #e2e8f0',
                        marginBottom: 16,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        position: 'relative',
                    }}
                    className="avatar-container"
                >
                    {member.image_data ? (
                        <img src={member.image_data} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    )}
                    <div className="upload-overlay" style={{
                        position: 'absolute', inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: 12, fontWeight: 600,
                        opacity: 0, transition: 'opacity 0.2s',
                    }}>
                        Upload
                    </div>
                </div>
                <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 15, textAlign: 'center', marginBottom: 4 }}>
                    {member.name}
                </div>
                <div style={{ fontSize: 12, color: '#64748b', textAlign: 'center', fontWeight: 500, background: '#f1f5f9', padding: '4px 10px', borderRadius: 12 }}>
                    {member.role}
                </div>
            </div>
        )
    }

    return (
        <div style={{ padding: '40px', flex: 1, overflowY: 'auto', background: '#f8fafc' }}>
            <div style={{ marginBottom: 40, textAlign: 'center' }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', margin: 0 }}>ICP Department</h1>
                <p style={{ color: '#64748b', fontSize: 15, marginTop: 8 }}>Organization Chart</p>
            </div>

            {error && (
                <div style={{ background: '#1e293b', color: '#f1f5f9', padding: 24, borderRadius: 12, marginBottom: 40, maxWidth: 800, margin: '0 auto 40px auto' }}>
                    <div style={{ color: '#fbbf24', fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                        Database Table Missing
                    </div>
                    <p style={{ fontSize: 14, marginBottom: 16 }}>Untuk membolehkan fungsi upload gambar, sila run kod SQL ini dalam Supabase SQL Editor anda:</p>
                    <pre style={{ background: '#0f172a', padding: 16, borderRadius: 8, overflowX: 'auto', fontSize: 13, color: '#38bdf8' }}>
                        {`CREATE TABLE org_members (
  id integer PRIMARY KEY,
  name text NOT NULL,
  role text NOT NULL,
  image_data text
);

INSERT INTO org_members (id, name, role) VALUES 
(1, 'Mohd Rizal B Mohtar', 'Head of Department (HOD)'),
(2, 'Nadia Omar', 'ICP Manager'),
(3, 'Ahmad Imaduddin', 'Project Executive'),
(4, 'Atiqah Azis', 'Operation & Documentation Exec'),
(5, 'Megat Amirul', 'Project IT Implementation Exec');`}
                    </pre>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                {/* HOD Level */}
                {renderCard(hod)}

                {/* Vertical Line 1 */}
                <div style={{ width: 2, height: 40, background: '#cbd5e1' }} />

                {/* Manager Level */}
                {renderCard(manager)}

                {/* Vertical Line 2 */}
                <div style={{ width: 2, height: 40, background: '#cbd5e1' }} />

                {/* Horizontal Line for Execs */}
                <div style={{ width: '600px', height: 2, background: '#cbd5e1' }} />

                {/* Vertical lines to Execs */}
                <div style={{ display: 'flex', width: '600px', justifyContent: 'space-between', marginBottom: -2 }}>
                    <div style={{ width: 2, height: 20, background: '#cbd5e1' }} />
                    <div style={{ width: 2, height: 20, background: '#cbd5e1' }} />
                    <div style={{ width: 2, height: 20, background: '#cbd5e1' }} />
                </div>

                {/* Execs Level */}
                <div style={{ display: 'flex', gap: 40, justifyContent: 'center' }}>
                    {execs.length === 0 ? DEFAULT_MEMBERS.slice(2).map(m => renderCard(m)) : execs.map(exec => (
                        <div key={exec.id}>
                            {renderCard(exec)}
                        </div>
                    ))}
                </div>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: 'none' }}
            />

            <style>{`
                .avatar-container:hover .upload-overlay {
                    opacity: 1 !important;
                }
            `}</style>
        </div>
    )
}
