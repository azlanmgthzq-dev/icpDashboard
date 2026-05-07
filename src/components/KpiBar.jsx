function fmt(n) {
    if (!n && n !== 0) return '—'
    if (n >= 1e9) return `RM ${(n / 1e9).toFixed(2)}B`
    if (n >= 1e6) return `RM ${(n / 1e6).toFixed(1)}M`
    return `RM ${Number(n).toLocaleString()}`
}

function KpiCard({ label, value, sub, color, borderColor }) {
    return (
        <div style={{
            background: '#fff',
            border: '0.5px solid #e5e7eb',
            borderTop: borderColor ? `3px solid ${borderColor}` : '0.5px solid #e5e7eb',
            borderRadius: 12, padding: '14px 16px',
            flex: 1, minWidth: 0
        }}>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6, fontWeight: 500 }}>
                {label}
            </div>
            <div style={{ fontSize: 20, fontWeight: 600, color: color || '#111827', lineHeight: 1.2 }}>
                {value}
            </div>
            {sub && (
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>{sub}</div>
            )}
        </div>
    )
}

function Divider() {
    return <div style={{ width: '0.5px', background: '#e5e7eb', alignSelf: 'stretch', margin: '0 4px' }} />
}

export default function KpiBar({ totals, contracts, urgentCount }) {
    const claimedPct = totals.obligation
        ? ((totals.approved_icv / totals.obligation) * 100).toFixed(1)
        : 0

    const plannedPct = totals.obligation
        ? ((totals.icv_planned / totals.obligation) * 100).toFixed(1)
        : 0

    const actualIcvTotal = contracts.reduce((s, c) => s + (c.current_actual_icv || 0), 0)
    const estNominalTotal = contracts.reduce((s, c) => s + (c.est_nominal_planned || 0), 0)
    const obaContracts = contracts.filter(c => c.oba_plan === true).length

    const expiringSoon = contracts.filter(c => {
        if (!c.duration_end) return false
        const months = (new Date(c.duration_end) - new Date()) / (1000 * 60 * 60 * 24 * 30)
        return months <= 9 && months > 0
    }).length

    return (
        <div style={{ marginBottom: 20 }}>

            {/* Row 1 — ICV metrics */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                <KpiCard
                    label="Total ICP obligation"
                    value={fmt(totals.obligation)}
                    sub={`${contracts.length} active contracts`}
                    borderColor="#1F4E79"
                />
                <KpiCard
                    label="Total ICV planned"
                    value={fmt(totals.icv_planned)}
                    sub={`${plannedPct}% of obligation`}
                    color="#185FA5"
                    borderColor="#378ADD"
                />
                <KpiCard
                    label="Est. nominal value"
                    value={fmt(estNominalTotal)}
                    sub="Planned project cost"
                    color="#374151"
                    borderColor="#9ca3af"
                />
                <KpiCard
                    label="Current actual ICV"
                    value={fmt(actualIcvTotal)}
                    sub="Generated so far"
                    color="#3B6D11"
                    borderColor="#639922"
                />
                <KpiCard
                    label="ICV approved by BIP"
                    value={fmt(totals.approved_icv)}
                    sub={`${claimedPct}% of obligation`}
                    color="#1D9E75"
                    borderColor="#1D9E75"
                />
            </div>

            {/* Row 2 — Status & alerts */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <KpiCard
                    label="Active contracts"
                    value={contracts.length}
                    sub="ICP contracts"
                    color="#3C3489"
                    borderColor="#7F77DD"
                />
                <KpiCard
                    label="Expiring ≤ 9 months"
                    value={expiringSoon}
                    sub={expiringSoon > 0 ? 'Action required' : 'All clear'}
                    color={expiringSoon > 0 ? '#A32D2D' : '#3B6D11'}
                    borderColor={expiringSoon > 0 ? '#E24B4A' : '#639922'}
                />
                <KpiCard
                    label="Plan for OBA"
                    value={obaContracts}
                    sub="Hardware, Additional, Extension"
                    color="#854F0B"
                    borderColor="#EF9F27"
                />
                <KpiCard
                    label="Urgent items"
                    value={urgentCount}
                    sub={urgentCount > 0 ? 'Require action' : 'All clear'}
                    color={urgentCount > 0 ? '#A32D2D' : '#3B6D11'}
                    borderColor={urgentCount > 0 ? '#E24B4A' : '#639922'}
                />

                {/* Overall ICV progress bar card */}
                <div style={{
                    background: '#fff', border: '0.5px solid #e5e7eb',
                    borderTop: '3px solid #1F4E79',
                    borderRadius: 12, padding: '14px 16px',
                    flex: 2, minWidth: 200
                }}>
                    <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 8, fontWeight: 500 }}>
                        Overall ICV progress
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {[
                            { label: 'ICV Planned', val: totals.icv_planned, total: totals.obligation, color: '#378ADD' },
                            { label: 'Actual ICV', val: actualIcvTotal, total: totals.obligation, color: '#1D9E75' },
                            { label: 'BIP Approved', val: totals.approved_icv, total: totals.obligation, color: '#639922' },
                        ].map(item => {
                            const pct = item.total ? Math.min((item.val / item.total) * 100, 100) : 0
                            return (
                                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ fontSize: 10, color: '#6b7280', minWidth: 80 }}>{item.label}</div>
                                    <div style={{
                                        flex: 1, height: 8, background: '#f3f4f6',
                                        borderRadius: 4, overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: `${pct}%`, height: '100%',
                                            background: item.color, borderRadius: 4,
                                            transition: 'width 0.6s ease'
                                        }} />
                                    </div>
                                    <div style={{ fontSize: 10, color: '#6b7280', minWidth: 36, textAlign: 'right' }}>
                                        {pct.toFixed(1)}%
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}