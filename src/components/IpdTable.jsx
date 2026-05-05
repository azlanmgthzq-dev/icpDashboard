import { useNavigate, useParams } from 'react-router-dom'

const STATUS_COLORS = {
  'Completed': { bg: '#EAF3DE', color: '#3B6D11' },
  'In Progress': { bg: '#E6F1FB', color: '#185FA5' },
  'Not Started': { bg: '#f3f4f6', color: '#6b7280' },
  'Not started': { bg: '#f3f4f6', color: '#6b7280' },
  'Pending': { bg: '#FAEEDA', color: '#854F0B' },
  'Re-submitted': { bg: '#EEEDFE', color: '#3C3489' },
  'Approved': { bg: '#EAF3DE', color: '#3B6D11' },
  'Rejected': { bg: '#FCEBEB', color: '#A32D2D' },
}

function fmt(n) {
  if (!n && n !== 0) return '—'
  if (n >= 1e6) return `RM ${(n / 1e6).toFixed(2)}M`
  return `RM ${Number(n).toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || { bg: '#f3f4f6', color: '#6b7280' }
  return (
    <span style={{
      fontSize: 10, padding: '2px 8px', borderRadius: 10,
      background: s.bg, color: s.color, fontWeight: 500,
      whiteSpace: 'nowrap',
    }}>
      {status || 'Pending'}
    </span>
  )
}



export default function IpdTable({ ipds, loading }) {
  const navigate = useNavigate()
  const { id } = useParams()

  if (loading) return (
    <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
      Loading IPDs...
    </div>
  )

  if (!ipds.length) return (
    <div style={{
      padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 13,
      background: '#fff', borderRadius: 12, border: '0.5px solid #e5e7eb',
    }}>
      No IPDs found for this contract.
    </div>
  )

  return (
    <div style={{
      background: '#fff', border: '0.5px solid #e5e7eb',
      borderRadius: 12, overflow: 'hidden',
    }}>
      <div style={{
        padding: '14px 18px', borderBottom: '0.5px solid #e5e7eb',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <span style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>
            Industrial Projects (IPD)
          </span>
          <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 10 }}>
            {ipds.length} projects
          </span>
        </div>
        <span style={{ fontSize: 11, color: '#9ca3af' }}>
          Click row to view details
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              {[
                'Code', 'Description', 'Category',
                'Nominal Value', 'Est. Plan ICV', 'Sum Plan ICV', 'Credits Claim',
                'Claim %', 'Claim Progress', 'Activity Progress',
              ].map(h => (
                <th key={h} style={{
                  padding: '10px 14px', textAlign: 'left',
                  fontWeight: 500, color: '#6b7280', fontSize: 11,
                  borderBottom: '0.5px solid #e5e7eb', whiteSpace: 'nowrap',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ipds.map((ipd, i) => (
              <tr
                key={ipd.id}
                onClick={() => navigate(`/contracts/${id}/ipds/${ipd.id}`)}
                style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                onMouseLeave={e => e.currentTarget.style.background = ''}
              >
                <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                  <span style={{
                    fontWeight: 600, fontSize: 12,
                    color: '#1F4E79', background: '#EBF3FB',
                    padding: '2px 8px', borderRadius: 6,
                  }}>
                    {ipd.code}
                  </span>
                </td>
                <td style={{
                  padding: '12px 14px', maxWidth: 280,
                  color: '#111827', fontWeight: 500,
                }}>
                  <div style={{
                    overflow: 'hidden', textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {ipd.description}
                  </div>
                  {ipd.project_category && (
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                      {ipd.project_category}
                    </div>
                  )}
                </td>
                <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                  <StatusBadge status={ipd.category_type} />
                </td>
                <td style={{
                  padding: '12px 14px', whiteSpace: 'nowrap',
                  fontSize: 12, color: '#374151'
                }}>
                  {fmt(ipd.estimated_nominal_value)}
                </td>
                <td style={{
                  padding: '12px 14px', whiteSpace: 'nowrap',
                  fontSize: 12, color: '#185FA5'
                }}>
                  {fmt(ipd.estimated_plan_icv)}
                </td>
                <td style={{
                  padding: '12px 14px', whiteSpace: 'nowrap',
                  fontSize: 12, color: '#374151'
                }}>
                  {fmt(ipd.sum_plan_icv)}
                </td>
                <td style={{
                  padding: '12px 14px', whiteSpace: 'nowrap',
                  fontSize: 12, color: '#3B6D11'
                }}>
                  {fmt(ipd.credits_claim)}
                </td>
                <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', fontSize: 12, color: '#374151' }}>
                  {ipd.sum_plan_icv && ipd.credits_claim
                    ? ((ipd.credits_claim / ipd.sum_plan_icv) * 100).toFixed(2) + '%'
                    : '0.00%'
                  }
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <StatusBadge status={ipd.claim_progress} />
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <StatusBadge status={ipd.activity_progress} />
                </td>
              </tr>
            ))}
          </tbody>

          {/* Footer totals */}
          <tfoot>
            <tr style={{ background: '#f9fafb', borderTop: '0.5px solid #e5e7eb' }}>
              <td colSpan={3} style={{
                padding: '10px 14px',
                fontWeight: 600, fontSize: 12, color: '#374151'
              }}>
                Total
              </td>
              <td style={{
                padding: '10px 14px', fontWeight: 600,
                fontSize: 12, color: '#374151', whiteSpace: 'nowrap'
              }}>
                {fmt(ipds.reduce((s, i) => s + (i.estimated_nominal_value || 0), 0))}
              </td>
              <td style={{
                padding: '10px 14px', fontWeight: 600,
                fontSize: 12, color: '#185FA5', whiteSpace: 'nowrap'
              }}>
                {fmt(ipds.reduce((s, i) => s + (i.estimated_plan_icv || 0), 0))}
              </td>
              <td style={{
                padding: '10px 14px', fontWeight: 600,
                fontSize: 12, whiteSpace: 'nowrap'
              }}>
                {fmt(ipds.reduce((s, i) => s + (i.sum_plan_icv || 0), 0))}
              </td>
              <td style={{
                padding: '10px 14px', fontWeight: 600,
                fontSize: 12, color: '#3B6D11', whiteSpace: 'nowrap'
              }}>
                {fmt(ipds.reduce((s, i) => s + (i.credits_claim || 0), 0))}
              </td>
              <td colSpan={3} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
