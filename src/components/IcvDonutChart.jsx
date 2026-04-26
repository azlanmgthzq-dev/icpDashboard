import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = {
  approved: '#1D9E75',
  claimed:  '#378ADD',
  balance:  '#E5E7EB',
}

function fmt(n) {
  if (!n) return 'RM 0'
  if (n >= 1e9) return `RM ${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `RM ${(n / 1e6).toFixed(1)}M`
  return `RM ${Number(n).toLocaleString()}`
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div style={{
      background: '#fff', border: '0.5px solid #e5e7eb',
      borderRadius: 8, padding: '10px 14px', fontSize: 12,
    }}>
      <div style={{ fontWeight: 600, color: '#111827', marginBottom: 4 }}>
        {d.name}
      </div>
      <div style={{ color: '#6b7280' }}>{fmt(d.value)}</div>
      <div style={{ color: '#9ca3af', marginTop: 2 }}>
        {((d.value / d.payload.total) * 100).toFixed(1)}% of obligation
      </div>
    </div>
  )
}

function CustomLabel({ cx, cy, total }) {
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
      <tspan x={cx} dy="-10" fontSize="11" fill="#9ca3af">Total obligation</tspan>
      <tspan x={cx} dy="22" fontSize="15" fontWeight="600" fill="#111827">
        {fmt(total)}
      </tspan>
    </text>
  )
}

export default function IcvDonutChart({ totals }) {
  const approved = totals.approved_icv || 0
  const planned  = (totals.icv_planned || 0) - approved
  const balance  = totals.icv_balance || 0
  const total    = totals.obligation || 0

  const data = [
    { name: 'BIP Approved',    value: approved, total },
    { name: 'ICV Planned',     value: planned,  total },
    { name: 'ICV Balance',     value: balance,  total },
  ].filter(d => d.value > 0)

  const colors = [COLORS.approved, COLORS.claimed, COLORS.balance]

  const legendItems = [
    { label: 'BIP Approved',  value: approved, color: COLORS.approved },
    { label: 'ICV Planned',   value: planned,  color: COLORS.claimed  },
    { label: 'ICV Balance',   value: balance,  color: COLORS.balance  },
  ]

  return (
    <div style={{
      background: '#fff', border: '0.5px solid #e5e7eb',
      borderRadius: 12, padding: '16px 20px', marginBottom: 16,
    }}>
      <div style={{ fontWeight: 600, fontSize: 14, color: '#111827', marginBottom: 4 }}>
        ICV Overview
      </div>
      <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16 }}>
        Overall ICV distribution across all contracts
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>

        {/* Donut */}
        <div style={{ width: 200, height: 200, flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                labelLine={false}
                label={<CustomLabel total={total} />}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={colors[i]} stroke="none" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend + values */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {legendItems.map(item => {
            const pct = total ? ((item.value / total) * 100).toFixed(1) : 0
            return (
              <div key={item.label}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', marginBottom: 4,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: item.color, flexShrink: 0,
                    }} />
                    <span style={{ fontSize: 12, color: '#374151' }}>{item.label}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: '#111827' }}>
                      {fmt(item.value)}
                    </span>
                    <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 6 }}>
                      {pct}%
                    </span>
                  </div>
                </div>
                <div style={{
                  height: 4, background: '#f3f4f6',
                  borderRadius: 2, overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${pct}%`, height: '100%',
                    background: item.color, borderRadius: 2,
                    transition: 'width 0.8s ease',
                  }} />
                </div>
              </div>
            )
          })}

          <div style={{
            marginTop: 4, padding: '10px 12px',
            background: '#f9fafb', borderRadius: 8,
            fontSize: 11, color: '#6b7280',
          }}>
            💡 ICV Balance = ICV Planned − BIP Approved — masih perlu diclaim
          </div>
        </div>
      </div>
    </div>
  )
}
