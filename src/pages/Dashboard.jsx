import { useContracts } from '../hooks/useContracts'
import { useUrgentItems } from '../hooks/useUrgentItems'
import KpiBar from '../components/KpiBar'
import ContractTable from '../components/ContractTable'
import UrgentPanel from '../components/UrgentPanel'
import ChatBot from '../components/ChatBot'
import ExpiryAlert from '../components/ExpiryAlert'
import ExcelUpload from '../components/ExcelUpload'
import IcvDonutChart from '../components/IcvDonutChart'

const today = new Date().toLocaleDateString('en-MY', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
})

export default function Dashboard() {
    const { contracts, loading, totals, refetch } = useContracts()
    const { items, loading: urgLoading, addItem, editItem, updateStatus, counts } = useUrgentItems()

    const activeContracts = contracts?.filter(c => c.status === 'Active')?.length ?? '–'
    const totalContracts = contracts?.length ?? '–'
    const urgentCount = counts?.total ?? 0

    return (
        <div style={{ flex: 1, overflowY: 'auto', background: '#f1f5f9' }}>

            {/* ── Hero Section ─────────────────────────────── */}
            <div style={{
                position: 'relative',
                width: '100%',
                height: 280,
                overflow: 'hidden',
            }}>
                {/* Background image */}
                <img
                    src="/HeroBG/IMG_7779.jpg"
                    alt="ICP Hero Background"
                    style={{
                        position: 'absolute', inset: 0,
                        width: '100%', height: '100%',
                        objectFit: 'cover', objectPosition: 'center 40%',
                    }}
                />

                {/* Dark gradient overlay */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(105deg, rgba(7,15,40,0.88) 0%, rgba(14,30,60,0.72) 0%, rgba(0,0,0,0.40) 0%)',
                }} />

                {/* Subtle top fade for blend with sidebar */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 60%, rgba(15,23,42,0.55) 100%)',
                }} />

                {/* Content */}
                <div style={{
                    position: 'relative', zIndex: 2,
                    height: '100%',
                    display: 'flex', flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: '0 36px 28px',
                }}>
                    {/* Eyebrow label */}
                    {/* <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 7,
                        background: 'rgba(59,130,246,0.25)',
                        border: '1px solid rgba(59,130,246,0.45)',
                        backdropFilter: 'blur(8px)',
                        color: '#93c5fd',
                        fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        padding: '4px 12px', borderRadius: 20,
                        marginBottom: 12, width: 'fit-content',
                    }}>
                        <span style={{
                            width: 6, height: 6, borderRadius: '50%',
                            background: '#3b82f6',
                            boxShadow: '0 0 6px #3b82f6',
                            animation: 'heroPulse 2s ease-in-out infinite'
                        }} />
                        Live Dashboard
                    </div> */}

                    {/* Main title */}
                    <h1 style={{
                        fontSize: 32, fontWeight: 800,
                        color: '#f8fafc',
                        margin: 0, lineHeight: 1.15,
                        letterSpacing: '-0.02em',
                        textShadow: '0 2px 20px rgba(0,0,0,0.5)',
                    }}>
                        ICP Management
                        <span style={{
                            display: 'block',
                            background: 'linear-gradient(90deg, #60a5fa, #a78bfa)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}>
                            Contract Overview
                        </span>
                    </h1>

                    {/* Date + quick stats row */}
                    <div style={{
                        display: 'flex', alignItems: 'center',
                        gap: 12, marginTop: 14, flexWrap: 'wrap'
                    }}>
                        {/* Date chip */}
                        <span style={{
                            fontSize: 12, color: '#94a3b8',
                            display: 'flex', alignItems: 'center', gap: 5
                        }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                            </svg>
                            {today}
                        </span>

                        <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 14 }}>|</span>

                        {/* Quick stat chips */}
                        {[
                            { label: 'Total Contracts', value: totalContracts, color: '#3b82f6' },
                            { label: 'Active', value: activeContracts, color: '#10b981' },
                            { label: 'Urgent Items', value: urgentCount, color: '#f59e0b' },
                        ].map(chip => (
                            <div key={chip.label} style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                background: 'rgba(255,255,255,0.08)',
                                border: '1px solid rgba(255,255,255,0.12)',
                                backdropFilter: 'blur(6px)',
                                borderRadius: 8, padding: '4px 11px',
                            }}>
                                <span style={{
                                    width: 7, height: 7, borderRadius: '50%',
                                    background: chip.color, flexShrink: 0
                                }} />
                                <span style={{ fontSize: 11.5, color: '#cbd5e1' }}>{chip.label}</span>
                                <span style={{
                                    fontSize: 12.5, fontWeight: 700, color: '#f1f5f9',
                                    marginLeft: 2
                                }}>{chip.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Dashboard content below hero ─────────────── */}
            <div style={{ padding: '24px 28px' }}>

                <ExpiryAlert contracts={contracts} />

                <KpiBar totals={totals} contracts={contracts} urgentCount={counts.total} />

                <IcvDonutChart totals={totals} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16, marginBottom: 16 }}>
                    <ContractTable contracts={contracts} loading={loading} />
                    <UrgentPanel
                        items={items} loading={urgLoading}
                        addItem={addItem} editItem={editItem} updateStatus={updateStatus}
                    />
                </div>

                <ExcelUpload onSuccess={() => refetch()} />
            </div>

            {/* Keyframe animation for pulsing dot */}
            <style>{`
                @keyframes heroPulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(1.4); }
                }
            `}</style>

            <ChatBot contracts={contracts} urgentItems={items} />
        </div>
    )
}