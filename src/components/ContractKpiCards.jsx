function fmt(n) {
  if (!n && n !== 0) return '—'
  if (n >= 1e9) return `RM ${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `RM ${(n / 1e6).toFixed(1)}M`
  return `RM ${Number(n).toLocaleString()}`
}

function KpiCard({ label, value, sub, color, borderColor }) {
  return (
    <div style={{
      background: '#fff', border: '0.5px solid #e5e7eb',
      borderTop: `3px solid ${borderColor || '#e5e7eb'}`,
      borderRadius: 12, padding: '14px 16px', flex: 1, minWidth: 0,
    }}>
      <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6, fontWeight: 500 }}>
        {label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 600, color: color || '#111827' }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

export default function ContractKpiCards({ contract, ipdTotals, ipdCount }) {
  if (!contract) return null

  const pctPlanned = contract.obligation_value
    ? ((contract.total_icv_planned / contract.obligation_value) * 100).toFixed(1)
    : 0

  const pctApproved = contract.obligation_value
    ? ((contract.approved_planned_icv / contract.obligation_value) * 100).toFixed(1)
    : 0

  const today = new Date()
  const end   = new Date(contract.duration_end)
  const months = ((end - today) / (1000 * 60 * 60 * 24 * 30)).toFixed(0)

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Row 1 */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
        <KpiCard
          label="ICP obligation"
          value={fmt(contract.obligation_value)}
          sub={`${contract.duration_start ? new Date(contract.duration_start)
            .toLocaleDateString('en-MY', { month: 'short', year: 'numeric' }) : '—'} –
            ${contract.duration_end ? new Date(contract.duration_end)
            .toLocaleDateString('en-MY', { month: 'short', year: 'numeric' }) : '—'}`}
          borderColor="#1F4E79"
        />
        <KpiCard
          label="Total ICV planned"
          value={fmt(contract.total_icv_planned)}
          sub={`${pctPlanned}% of obligation`}
          color="#185FA5"
          borderColor="#378ADD"
        />
        <KpiCard
          label="ICV balance"
          value={fmt(contract.icv_balance)}
          sub="Still to be claimed"
          color="#854F0B"
          borderColor="#EF9F27"
        />
        <KpiCard
          label="BIP approved"
          value={fmt(contract.approved_planned_icv)}
          sub={`${pctApproved}% of obligation`}
          color="#3B6D11"
          borderColor="#1D9E75"
        />
        <KpiCard
          label="Total IPDs"
          value={ipdCount}
          sub="Industrial projects"
          color="#3C3489"
          borderColor="#7F77DD"
        />
        <KpiCard
          label="Contract expires"
          value={months > 0 ? `${months} months` : 'Expired'}
          sub={contract.duration_end
            ? new Date(contract.duration_end).toLocaleDateString('en-MY',
              { day: 'numeric', month: 'long', year: 'numeric' })
            : '—'}
          color={months <= 9 ? '#A32D2D' : '#3B6D11'}
          borderColor={months <= 9 ? '#E24B4A' : '#639922'}
        />
      </div>

      {/* OBA/Waiver info bar */}
      {(contract.oba_plan || contract.waiver_60pct) && (
        <div style={{
          background: '#FAEEDA', border: '0.5px solid #EF9F27',
          borderRadius: 8, padding: '10px 16px',
          display: 'flex', gap: 24, flexWrap: 'wrap',
          fontSize: 12,
        }}>
          {contract.waiver_60pct && (
            <div>
              <span style={{ fontWeight: 500, color: '#854F0B' }}>
                Waiver 60% · {contract.waiver_status}
              </span>
              <span style={{ color: '#854F0B', marginLeft: 8 }}>
                40% = {fmt(contract.oba_40pct_value)} ·
                60% = {fmt(contract.oba_60pct_value)}
              </span>
            </div>
          )}
          {contract.oba_plan && (
            <div>
              <span style={{ fontWeight: 500, color: '#3C3489' }}>
                OBA Plan · {contract.oba_status}
              </span>
              <span style={{ color: '#6b7280', marginLeft: 8 }}>
                Outcome Based Approach — PK 1.7
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
