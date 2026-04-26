import { useNavigate } from 'react-router-dom'

function ProgressBar({ pct }) {
    const p = Math.min(Math.round((pct || 0) * 100), 100)
    const color = p > 90 ? '#E24B4A' : p > 70 ? '#EF9F27' : '#1D9E75'
    return (
        <span style={{ fontSize: 12, color: color, fontWeight: 500 }}>{p}%</span>
    )
}

function StatusBadge({ end }) {
    if (!end) return <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: '#f3f4f6', color: '#9ca3af' }}>—</span>
    const months = (new Date(end) - new Date()) / (1000 * 60 * 60 * 24 * 30)
    if (months < 0) return <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: '#FCEBEB', color: '#A32D2D' }}>Expired</span>
    if (months < 6) return <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: '#FAEEDA', color: '#854F0B' }}>Expiring soon</span>
    return <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: '#EAF3DE', color: '#3B6D11' }}>Active</span>
}

function WaiverBadge({ status }) {
    if (!status || status === 'Not Applicable') return null
    const styles = {
        'Proposed': { bg: '#EAF3DE', color: '#3B6D11' },
        'Approved': { bg: '#1D9E75', color: '#ffffff' },
        'In Planning': { bg: '#f3f4f6', color: '#6b7280' },
    }
    const s = styles[status] || styles['In Planning']
    return (
        <span style={{
            fontSize: 10, padding: '2px 7px', borderRadius: 10,
            background: s.bg, color: s.color, fontWeight: 500,
            whiteSpace: 'nowrap'
        }}>
            Waiver 60% · {status}
        </span>
    )
}

function ObaBadge({ status }) {
    if (!status || status === 'Not Applicable') return null
    const styles = {
        'In Planning': { bg: '#FAEEDA', color: '#854F0B' },
        'Proposed': { bg: '#E6F1FB', color: '#185FA5' },
        'Approved': { bg: '#EAF3DE', color: '#3B6D11' },
    }
    const s = styles[status] || styles['In Planning']
    return (
        <span style={{
            fontSize: 10, padding: '2px 7px', borderRadius: 10,
            background: s.bg, color: s.color, fontWeight: 500,
            whiteSpace: 'nowrap'
        }}>
            OBA · {status}
        </span>
    )
}

function fmt(n) {
    if (!n && n !== 0) return '—'
    if (n >= 1e9) return `RM ${(n / 1e9).toFixed(2)}B`
    if (n >= 1e6) return `RM ${(n / 1e6).toFixed(1)}M`
    return `RM ${Number(n).toLocaleString()}`
}

export default function ContractTable({ contracts, loading }) {
    const navigate = useNavigate()

    if (loading) return (
        <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
            Loading contracts...
        </div>
    )

    return (
        <div style={{
            background: '#fff', border: '0.5px solid #e5e7eb',
            borderRadius: 12, overflow: 'hidden', marginBottom: 20
        }}>
            {/* Header */}
            <div style={{
                padding: '14px 18px', borderBottom: '0.5px solid #e5e7eb',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <div>
                    <span style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>
                        ICP Contracts
                    </span>
                    <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 10 }}>
                        {contracts.length} contracts
                    </span>
                </div>
                <span style={{ fontSize: 11, color: '#9ca3af' }}>
                    Click any row to view details
                </span>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                        <tr style={{ background: '#f9fafb' }}>
                            {[
                                '#', 'Contract', 'Duration',
                                'Obligation', 'ICV Planned', 'ICV Balance',
                                'Est. Nominal', 'Actual ICV', '% Planned', 'Status'
                            ].map(h => (
                                <th key={h} style={{
                                    padding: '10px 14px', textAlign: 'left',
                                    fontWeight: 500, color: '#6b7280', fontSize: 11,
                                    borderBottom: '0.5px solid #e5e7eb', whiteSpace: 'nowrap'
                                }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {contracts.map((c, i) => (
                            <tr
                                key={c.id}
                                onClick={() => navigate(`/contracts/${c.id}`)}
                                style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                                onMouseLeave={e => e.currentTarget.style.background = ''}
                            >
                                <td style={{ padding: '12px 14px', color: '#9ca3af', fontSize: 12 }}>
                                    {i + 1}
                                </td>

                                <td style={{ padding: '12px 14px', minWidth: 200 }}>
                                    <div style={{ fontWeight: 500, color: '#111827' }}>{c.name}</div>
                                    <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
                                        <WaiverBadge status={c.waiver_status} />
                                        <ObaBadge status={c.oba_status} />
                                    </div>
                                </td>

                                <td style={{ padding: '12px 14px', color: '#6b7280', whiteSpace: 'nowrap', fontSize: 12 }}>
                                    {c.duration_start
                                        ? `${new Date(c.duration_start).toLocaleDateString('en-MY', { month: 'short', year: 'numeric' })} – ${new Date(c.duration_end).toLocaleDateString('en-MY', { month: 'short', year: 'numeric' })}`
                                        : '—'
                                    }
                                </td>

                                <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', fontWeight: 500 }}>
                                    {fmt(c.obligation_value)}
                                </td>

                                <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', color: '#185FA5' }}>
                                    {fmt(c.total_icv_planned)}
                                </td>

                                <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', color: '#854F0B' }}>
                                    {fmt(c.icv_balance)}
                                </td>

                                <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', fontSize: 12, color: '#374151' }}>
                                    {fmt(c.est_nominal_planned)}
                                </td>

                                <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', fontSize: 12, color: '#3B6D11' }}>
                                    {fmt(c.current_actual_icv)}
                                </td>

                                <td style={{ padding: '12px 14px', minWidth: 60 }}>
                                    <ProgressBar pct={c.pct_icv_planned} />
                                </td>

                                <td style={{ padding: '12px 14px' }}>
                                    <StatusBadge end={c.duration_end} />
                                </td>
                            </tr>
                        ))}
                    </tbody>

                    {/* Footer totals */}
                    <tfoot>
                        <tr style={{ background: '#f9fafb', borderTop: '0.5px solid #e5e7eb' }}>
                            <td colSpan={3} style={{ padding: '10px 14px', fontWeight: 600, fontSize: 12, color: '#374151' }}>
                                Overall Total
                            </td>
                            <td style={{ padding: '10px 14px', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap' }}>
                                {fmt(contracts.reduce((s, c) => s + (c.obligation_value || 0), 0))}
                            </td>
                            <td style={{ padding: '10px 14px', fontWeight: 600, fontSize: 12, color: '#185FA5', whiteSpace: 'nowrap' }}>
                                {fmt(contracts.reduce((s, c) => s + (c.total_icv_planned || 0), 0))}
                            </td>
                            <td style={{ padding: '10px 14px', fontWeight: 600, fontSize: 12, color: '#854F0B', whiteSpace: 'nowrap' }}>
                                {fmt(contracts.reduce((s, c) => s + (c.icv_balance || 0), 0))}
                            </td>
                            <td style={{ padding: '10px 14px', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap' }}>
                                {fmt(contracts.reduce((s, c) => s + (c.est_nominal_planned || 0), 0))}
                            </td>
                            <td style={{ padding: '10px 14px', fontWeight: 600, fontSize: 12, color: '#3B6D11', whiteSpace: 'nowrap' }}>
                                {fmt(contracts.reduce((s, c) => s + (c.current_actual_icv || 0), 0))}
                            </td>
                            <td colSpan={2} />
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* OBA legend */}
            <div style={{
                padding: '10px 18px', borderTop: '0.5px solid #f3f4f6',
                display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap'
            }}>
                <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>Legend:</span>
                {[
                    { label: 'Waiver 60% · Proposed', bg: '#EAF3DE', color: '#3B6D11' },
                    { label: 'OBA · In Planning', bg: '#FAEEDA', color: '#854F0B' },
                    { label: 'OBA · Proposed', bg: '#E6F1FB', color: '#185FA5' },
                    { label: 'OBA · Approved', bg: '#EAF3DE', color: '#3B6D11' },
                ].map(s => (
                    <span key={s.label} style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 10,
                        background: s.bg, color: s.color
                    }}>
                        {s.label}
                    </span>
                ))}
                <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 'auto' }}>
                    OBA = Outcome Based Approach · PK 1.7 · Waiver = 60% Obligation Reduction Request
                </span>
            </div>
        </div>
    )
}