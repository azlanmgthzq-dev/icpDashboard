import { useParams } from 'react-router-dom'
import { useContracts } from '../hooks/useContracts'
import { useIpds } from '../hooks/useIpds'
import ContractTabs from '../components/ContractTabs'
import ContractKpiCards from '../components/ContractKpiCards'
import IpdTable from '../components/IpdTable'

export default function ContractDetail() {
  const { id } = useParams()
  const { contracts, loading: contractsLoading } = useContracts()
  const { ipds, loading: ipdsLoading, totals } = useIpds(parseInt(id))

  const contract = contracts.find(c => c.id === parseInt(id))

  if (contractsLoading) return (
    <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
      Loading...
    </div>
  )

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column',
      minHeight: '100vh', background: '#f9fafb' }}>

      {/* Sticky tabs */}
      <ContractTabs contracts={contracts} />

      {/* Content */}
      <div style={{ padding: '24px 28px', flex: 1 }}>

        {/* Contract header */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: '#111827', margin: 0 }}>
            {contract?.name}
          </h1>
          <p style={{ fontSize: 13, color: '#9ca3af', margin: '4px 0 0' }}>
            Contract details & Industrial Projects (IPD)
          </p>
        </div>

        {/* KPI cards */}
        <ContractKpiCards
          contract={contract}
          ipdTotals={totals}
          ipdCount={ipds.length}
        />

        {/* IPD table */}
        <IpdTable ipds={ipds} loading={ipdsLoading} />
      </div>
    </div>
  )
}
