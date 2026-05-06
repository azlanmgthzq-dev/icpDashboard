import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const FREE_MODEL = 'z-ai/glm-4.5-air:free'

export default function ChatBot({ contracts, urgentItems }) {
    const [open, setOpen] = useState(false)
    const [messages, setMessages] = useState([
        { role: 'assistant', text: 'Hi! Saya GTA Assist — boleh jawab soalan tentang ICP contracts, IPD status, ICV balance, urgent items dan gantt progress. Cuba tanya saya!' }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [ipds, setIpds] = useState([])
    const [ganttItems, setGanttItems] = useState([])
    const [customGuideline, setCustomGuideline] = useState(null)
    const bottomRef = useRef(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Fetch IPDs and gantt data when chatbot opens
    useEffect(() => {
        if (!open) return
        async function fetchData() {
            const { data: ipdData } = await supabase
                .from('ipds')
                .select('*, contracts(name)')
                .order('contract_id')
            setIpds(ipdData || [])

            const { data: ganttData } = await supabase
                .from('gantt_items')
                .select('*, gantt_charts(title, overall_status, ipds(code, description))')
            setGanttItems(ganttData || [])

            const { data: aiSettings } = await supabase
                .from('ai_settings')
                .select('guidelines')
                .eq('id', 1)
                .single()
            if (aiSettings) {
                setCustomGuideline(aiSettings.guidelines)
            }
        }
        fetchData()
    }, [open])

    function buildContext() {
        const contractSummary = contracts.map(c => ({
            id: c.id,
            name: c.name,
            duration: `${c.duration_start} to ${c.duration_end}`,
            obligation_rm: c.obligation_value,
            icv_planned_rm: c.total_icv_planned,
            icv_balance_rm: c.icv_balance,
            pct_icv_planned: c.pct_icv_planned
                ? (c.pct_icv_planned * 100).toFixed(1) + '%'
                : '0%',
            approved_by_bip_rm: c.approved_planned_icv,
            current_actual_icv: c.current_actual_icv,
            est_nominal_planned: c.est_nominal_planned,
            waiver_status: c.waiver_status,
            oba_plan: c.oba_plan,
            oba_status: c.oba_status,
            oba_40pct: c.oba_40pct_value,
            oba_60pct: c.oba_60pct_value,
        }))

        const ipdSummary = ipds.map(i => ({
            contract: i.contracts?.name,
            code: i.code,
            description: i.description,
            category: i.project_category,
            status: i.status,
            claim_progress: i.claim_progress,
            activity_progress: i.activity_progress,
            estimated_nominal: i.estimated_nominal_value,
            actual_nominal: i.actual_nominal_value,
            multiplier: i.multiplier,
            estimated_plan_icv: i.estimated_plan_icv,
            actual_icv: i.actual_icv,
            sum_plan_icv: i.sum_plan_icv,
            credits_claim: i.credits_claim,
            claim_pct: i.claim_pct,
            plan_start: i.plan_start,
            tentative_completion: i.tentative_completion,
            bip_comments: i.bip_comments,
        }))

        const ganttSummary = ganttItems.map(g => ({
            ipd: g.gantt_charts?.ipds?.code,
            work_item: g.work_item,
            owner: g.owner,
            start_date: g.start_date,
            end_date: g.end_date,
            status: g.status,
        }))

        const urgentSummary = urgentItems.map(i => ({
            title: i.title,
            status: i.status,
            due_date: i.due_date,
            uploaded_by: i.uploaded_by,
            contract: i.contracts?.name,
        }))

        const systemInstruction = customGuideline || `You are GTA Assist, a professional ICP (Industrial Collaboration Programme) assistant for Global Turbine Asia (GTA), a Malaysian aerospace MRO company based in Subang, Selangor.

Answer questions in the same language the user uses (Bahasa Melayu or English). Be concise, accurate and professional.
When showing numbers, format in RM with commas. When showing percentages, round to 1 decimal place.`

        return `${systemInstruction}

Today: ${new Date().toLocaleDateString('en-MY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}

━━━ CONTRACTS (${contracts.length} total) ━━━
${JSON.stringify(contractSummary, null, 2)}

━━━ IPDs (${ipds.length} total) ━━━
${JSON.stringify(ipdSummary, null, 2)}

━━━ GANTT ITEMS (${ganttItems.length} total) ━━━
${JSON.stringify(ganttSummary, null, 2)}

━━━ URGENT ITEMS (${urgentItems.length} total) ━━━
${JSON.stringify(urgentSummary, null, 2)}

Key definitions:
- ICV = Industrial Collaboration Value (Nominal Value × Multiplier)
- BIP = Bahagian Industri Pertahanan (approves ICV claims)
- OBA = Outcome Based Approach (alternative ICP implementation method per PK 1.7)
- Waiver = Request to reduce 60% of ICP obligation, only fulfil 40%
- Essential/Mandatory = Core ICP commitments
- Strategic = Value-adding projects`
    }

    async function send() {
        if (!input.trim() || loading) return
        const userMsg = input.trim()
        setInput('')
        setMessages(prev => [...prev, { role: 'user', text: userMsg }])
        setLoading(true)

        const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY

        if (!apiKey) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                text: 'API key belum set. Tambah VITE_OPENROUTER_API_KEY dalam .env file.'
            }])
            setLoading(false)
            return
        }

        try {
            const chatHistory = messages
                .filter((_, i) => i > 0)
                .map(m => ({ role: m.role, content: m.text }))

            const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': 'http://localhost:5173',
                    'X-Title': 'GTA ICP Dashboard',
                },
                body: JSON.stringify({
                    model: FREE_MODEL,
                    messages: [
                        { role: 'system', content: buildContext() },
                        ...chatHistory,
                        { role: 'user', content: userMsg },
                    ],
                    max_tokens: 1000,
                    temperature: 0.3,
                })
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error?.message || 'API error')
            }

            const data = await res.json()
            const reply = data.choices?.[0]?.message?.content || 'Sorry, tiada response.'
            setMessages(prev => [...prev, { role: 'assistant', text: reply }])

        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                text: `Error: ${err.message}. Sila cuba lagi.`
            }])
        }
        setLoading(false)
    }

    const QUICK_PROMPTS = [
        'Berapa ICV balance ISS 2?',
        'IPD mana yang belum claim?',
        'Contract mana expiring soon?',
        'Status OBA contracts?',
        'Urgent items pending?',
    ]

    return (
        <>
            {/* Floating button */}
            <button
                onClick={() => setOpen(!open)}
                style={{
                    position: 'fixed', bottom: 24, right: 24,
                    width: 52, height: 52, borderRadius: '50%',
                    background: '#1F4E79', border: 'none',
                    cursor: 'pointer', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 16px rgba(31,78,121,0.35)',
                    transition: 'transform 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
                <svg width="22" height="22" viewBox="0 0 24 24"
                    fill="none" stroke="#fff" strokeWidth="2">
                    {open
                        ? <path d="M18 6L6 18M6 6l12 12" />
                        : <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                    }
                </svg>
            </button>

            {/* Chat window */}
            {open && (
                <div style={{
                    position: 'fixed', bottom: 88, right: 24,
                    width: 380, height: 520,
                    background: '#fff', borderRadius: 16,
                    border: '0.5px solid #e5e7eb',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.14)',
                    display: 'flex', flexDirection: 'column',
                    zIndex: 999, overflow: 'hidden',
                }}>

                    {/* Header */}
                    <div style={{
                        padding: '14px 16px', background: '#1F4E79',
                        display: 'flex', alignItems: 'center', gap: 10,
                    }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: 'rgba(255,255,255,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <svg width="16" height="16" viewBox="0 0 24 24"
                                fill="none" stroke="#fff" strokeWidth="2">
                                <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm1 14H11v-2h2v2zm0-4H11V6h2v6z" />
                            </svg>
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 13, color: '#fff' }}>GTA Assist</div>
                            <div style={{ fontSize: 10, color: '#93c5fd' }}>
                                Contracts · IPDs · Gantt · Urgent — Powered by GLM-4.5 Air
                            </div>
                        </div>
                        {(ipds.length > 0) && (
                            <span style={{
                                fontSize: 10, background: 'rgba(255,255,255,0.2)',
                                color: '#fff', padding: '2px 8px', borderRadius: 10
                            }}>
                                {ipds.length} IPDs loaded
                            </span>
                        )}
                    </div>

                    {/* Messages */}
                    <div style={{
                        flex: 1, overflowY: 'auto', padding: '14px',
                        display: 'flex', flexDirection: 'column', gap: 10,
                        background: '#fafafa',
                    }}>
                        {messages.map((m, i) => (
                            <div key={i} style={{
                                display: 'flex',
                                justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
                            }}>
                                <div style={{
                                    maxWidth: '82%', padding: '9px 13px',
                                    borderRadius: 12, fontSize: 13, lineHeight: 1.55,
                                    background: m.role === 'user' ? '#1F4E79' : '#fff',
                                    color: m.role === 'user' ? '#fff' : '#111827',
                                    border: m.role === 'assistant' ? '0.5px solid #e5e7eb' : 'none',
                                    borderBottomRightRadius: m.role === 'user' ? 4 : 12,
                                    borderBottomLeftRadius: m.role === 'assistant' ? 4 : 12,
                                    whiteSpace: 'pre-wrap',
                                }}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                <div style={{
                                    padding: '9px 14px', borderRadius: 12,
                                    background: '#fff', border: '0.5px solid #e5e7eb',
                                    fontSize: 13, color: '#9ca3af',
                                }}>
                                    Thinking...
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Quick prompts */}
                    {messages.length === 1 && (
                        <div style={{
                            padding: '8px 12px', display: 'flex',
                            gap: 6, flexWrap: 'wrap',
                            background: '#fafafa', borderTop: '0.5px solid #f3f4f6',
                        }}>
                            {QUICK_PROMPTS.map(q => (
                                <button key={q} onClick={() => setInput(q)}
                                    style={{
                                        fontSize: 11, padding: '4px 10px', borderRadius: 20,
                                        border: '0.5px solid #e5e7eb', background: '#fff',
                                        color: '#374151', cursor: 'pointer',
                                    }}>
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div style={{
                        padding: '10px 12px', borderTop: '0.5px solid #e5e7eb',
                        display: 'flex', gap: 8, background: '#fff',
                    }}>
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                            placeholder="Tanya soalan tentang ICP..."
                            style={{
                                flex: 1, padding: '9px 12px', borderRadius: 8,
                                border: '0.5px solid #e5e7eb', fontSize: 13,
                                outline: 'none', background: '#f9fafb',
                            }}
                        />
                        <button
                            onClick={send}
                            disabled={loading || !input.trim()}
                            style={{
                                padding: '9px 16px', borderRadius: 8,
                                background: loading || !input.trim() ? '#e5e7eb' : '#1F4E79',
                                border: 'none', color: '#fff', fontSize: 13,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', gap: 4,
                            }}>
                            <svg width="14" height="14" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}