import { useNavigate, useParams } from 'react-router-dom'

export default function ContractTabs({ contracts, onAddContract }) {
  const navigate  = useNavigate()
  const { id }    = useParams()
  const activeId  = parseInt(id)

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: '#fff', borderBottom: '0.5px solid #e5e7eb',
      padding: '0 28px',
    }}>
      {/* Back to dashboard */}
      <div style={{ paddingTop: 12, marginBottom: 8 }}>
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 12, color: '#6b7280', padding: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Back to Dashboard
        </button>
      </div>

      {/* Tabs + Add button */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 4, overflowX: 'auto', flex: 1 }}>
          {contracts.map(c => {
            const isActive = c.id === activeId
            return (
              <button
                key={c.id}
                onClick={() => navigate(`/contracts/${c.id}`)}
                style={{
                  padding: '10px 16px',
                  border: 'none', background: 'none',
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  fontSize: 13, fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#1F4E79' : '#6b7280',
                  borderBottom: isActive ? '2px solid #1F4E79' : '2px solid transparent',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = '#374151' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = '#6b7280' }}
              >
                {c.name}
                {(c.oba_plan || c.waiver_60pct) && (
                  <span style={{
                    marginLeft: 6, fontSize: 9,
                    background: c.waiver_60pct ? '#EAF3DE' : '#FAEEDA',
                    color: c.waiver_60pct ? '#3B6D11' : '#854F0B',
                    padding: '1px 5px', borderRadius: 8,
                  }}>
                    {c.waiver_60pct ? 'Waiver' : 'OBA'}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {onAddContract && (
          <button
            onClick={onAddContract}
            style={{
              flexShrink: 0, fontSize: 12, padding: '6px 12px', borderRadius: 7,
              background: '#1F4E79', color: '#fff', border: 'none', cursor: 'pointer',
              fontWeight: 500, marginBottom: 2,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#185FA5' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#1F4E79' }}
          >
            + Add Contract
          </button>
        )}
      </div>
    </div>
  )
}
