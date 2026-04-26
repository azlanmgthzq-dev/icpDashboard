export default function ExpiryAlert({ contracts }) {
    const today = new Date()
    const soon = contracts.filter(c => {
        const end = new Date(c.duration_end)
        const months = (end - today) / (1000 * 60 * 60 * 24 * 30)
        return months <= 9 && months > 0
    })
    if (!soon.length) return null

    return (
        <div style={{
            background: '#FAEEDA', border: '1px solid #EF9F27',
            borderRadius: 10, padding: '10px 16px',
            marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10
        }}>
            <span style={{ fontSize: 18 }}>⚠️</span>
            <div>
                <span style={{ fontWeight: 600, color: '#854F0B', fontSize: 13 }}>
                    Contract expiry alert —{' '}
                </span>
                <span style={{ fontSize: 13, color: '#854F0B' }}>
                    {soon.map(c => `${c.name} (${new Date(c.duration_end)
                        .toLocaleDateString('en-MY', { month: 'short', year: 'numeric' })})`
                    ).join(' · ')}
                </span>
            </div>
        </div>
    )
}