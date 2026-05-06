import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function AiAdmin() {
    const [guidelines, setGuidelines] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)
    const [needsSetup, setNeedsSetup] = useState(false)

    useEffect(() => {
        fetchGuidelines()
    }, [])

    async function fetchGuidelines() {
        setLoading(true)
        setError(null)
        try {
            const { data, error } = await supabase
                .from('ai_settings')
                .select('guidelines')
                .eq('id', 1)
                .single()

            if (error) {
                if (error.code === '42P01') { // relation does not exist
                    setNeedsSetup(true)
                } else if (error.code === 'PGRST116') { // no rows returned
                    // Table exists but no data, let's insert default
                    setGuidelines("You are GTA Assist, a professional ICP (Industrial Collaboration Programme) assistant for Global Turbine Asia (GTA).")
                } else {
                    throw error
                }
            } else if (data) {
                setGuidelines(data.guidelines)
            }
        } catch (err) {
            console.error('Error fetching AI guidelines:', err)
            setError(err.message)
        }
        setLoading(false)
    }

    async function handleSave() {
        setSaving(true)
        setError(null)
        setSuccess(false)
        try {
            // Check if row exists first
            const { data: existing } = await supabase.from('ai_settings').select('id').eq('id', 1).single()
            
            let res
            if (existing) {
                res = await supabase.from('ai_settings').update({ guidelines }).eq('id', 1)
            } else {
                res = await supabase.from('ai_settings').insert({ id: 1, guidelines })
            }

            if (res.error) throw res.error
            
            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        } catch (err) {
            console.error('Error saving AI guidelines:', err)
            setError(err.message)
        }
        setSaving(false)
    }

    if (loading) {
        return <div style={{ padding: 40 }}>Loading AI settings...</div>
    }

    if (needsSetup) {
        return (
            <div style={{ padding: '40px', maxWidth: 800 }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>AI Admin Setup Required</h2>
                <p style={{ color: '#4b5563', marginBottom: 20 }}>
                    To enable the AI Admin page, you need to create the <code>ai_settings</code> table in your Supabase database.
                </p>
                <div style={{ background: '#1f2937', padding: 20, borderRadius: 8, color: '#e5e7eb' }}>
                    <p style={{ marginBottom: 12, fontSize: 14 }}>Run this SQL command in your Supabase SQL Editor:</p>
                    <pre style={{ background: '#111827', padding: 16, borderRadius: 6, overflowX: 'auto', fontSize: 13 }}>
{`CREATE TABLE ai_settings (
  id integer PRIMARY KEY,
  guidelines text NOT NULL
);

INSERT INTO ai_settings (id, guidelines) 
VALUES (1, 'You are GTA Assist, a professional ICP (Industrial Collaboration Programme) assistant for Global Turbine Asia (GTA), a Malaysian aerospace MRO company based in Subang, Selangor.

Answer questions in the same language the user uses (Bahasa Melayu or English). Be concise, accurate and professional.
When showing numbers, format in RM with commas. When showing percentages, round to 1 decimal place.');`}
                    </pre>
                </div>
                <button 
                    onClick={() => {
                        setNeedsSetup(false)
                        fetchGuidelines()
                    }}
                    style={{ marginTop: 20, padding: '10px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                >
                    I have run the SQL, check again
                </button>
            </div>
        )
    }

    return (
        <div style={{ padding: '32px 40px', maxWidth: 1000 }}>
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: 0 }}>AI Assistant Settings</h1>
                <p style={{ color: '#64748b', fontSize: 14, marginTop: 6 }}>
                    Manage the system guidelines, rules, and behavioral prompt for GTA Assist.
                    The AI will follow these rules when answering questions.
                </p>
            </div>

            {error && (
                <div style={{ padding: 12, background: '#fee2e2', color: '#b91c1c', borderRadius: 6, marginBottom: 20 }}>
                    Error: {error}
                </div>
            )}

            {success && (
                <div style={{ padding: 12, background: '#dcfce3', color: '#15803d', borderRadius: 6, marginBottom: 20 }}>
                    Guidelines saved successfully! The AI will now use these new rules.
                </div>
            )}

            <div style={{ background: '#fff', padding: 24, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, color: '#334155' }}>
                    System Guidelines & Policies
                </label>
                <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
                    Write the prompt that dictates how the AI should behave. You can define specific policies, tone of voice, formatting rules, or company terminology here.
                </p>
                <textarea
                    value={guidelines}
                    onChange={(e) => setGuidelines(e.target.value)}
                    style={{
                        width: '100%',
                        height: 300,
                        padding: 16,
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: 14,
                        fontFamily: 'monospace',
                        lineHeight: 1.5,
                        resize: 'vertical',
                        outline: 'none'
                    }}
                    placeholder="Enter AI guidelines here..."
                />
                
                <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                            background: saving ? '#93c5fd' : '#2563eb',
                            color: '#fff',
                            border: 'none',
                            padding: '10px 24px',
                            borderRadius: 6,
                            fontWeight: 600,
                            cursor: saving ? 'not-allowed' : 'pointer',
                            transition: 'background 0.2s'
                        }}
                    >
                        {saving ? 'Saving...' : 'Save Guidelines'}
                    </button>
                </div>
            </div>
            
            <div style={{ marginTop: 24, padding: 20, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#334155', marginBottom: 8 }}>How it works</h3>
                <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
                    The text you write above acts as the <strong>System Prompt</strong> for the AI model. 
                    Every time a user asks a question, this text is secretly sent to the AI first, so it understands its role.
                    <br/><br/>
                    <em>Note: The dashboard automatically appends the latest live data (Contracts, IPDs, Urgent items) to the AI's context behind the scenes, so you don't need to write any data here—just the behavioral rules.</em>
                </p>
            </div>
        </div>
    )
}
