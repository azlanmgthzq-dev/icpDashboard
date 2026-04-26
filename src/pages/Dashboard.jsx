import { useContracts } from '../hooks/useContracts'
import { useUrgentItems } from '../hooks/useUrgentItems'
import KpiBar from '../components/KpiBar'
import ContractTable from '../components/ContractTable'
import UrgentPanel from '../components/UrgentPanel'
import ChatBot from '../components/ChatBot'
import ExpiryAlert from '../components/ExpiryAlert'
import ExcelUpload from '../components/ExcelUpload'
import IcvDonutChart from '../components/IcvDonutChart'

export default function Dashboard() {
    const { contracts, loading, totals, refetch } = useContracts()
    const { items, loading: urgLoading, upload, updateStatus, counts } = useUrgentItems()

    return (
        <div style={{ padding: '20px 28px', flex: 1, overflowY: 'auto' }}>

            {/* Header */}
            <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontSize: 20, fontWeight: 600, color: '#111827', margin: 0 }}>
                    Dashboard
                </h1>
                <p style={{ fontSize: 13, color: '#9ca3af', margin: '4px 0 0' }}>
                    {new Date().toLocaleDateString('en-MY', {
                        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                    })} · Global Turbine Asia ICP Management
                </p>
            </div>

            <ExpiryAlert contracts={contracts} />

            <KpiBar totals={totals} contracts={contracts} urgentCount={counts.total} />

            <IcvDonutChart totals={totals} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16, marginBottom: 16 }}>
                <ContractTable contracts={contracts} loading={loading} />
                <UrgentPanel
                    items={items} loading={urgLoading}
                    upload={upload} updateStatus={updateStatus}
                />
            </div>

            <ExcelUpload onSuccess={() => refetch()} />

            <ChatBot contracts={contracts} urgentItems={items} />
        </div>
    )
}