import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import ContractDetail from './pages/ContractDetail'
import ChatBot from './components/ChatBot'
import AiAdmin from './pages/AiAdmin'
import OrgChart from './pages/OrgChart'
import { useUrgentItems } from './hooks/useUrgentItems'
import { useContracts } from './hooks/useContracts'

export default function App() {
  const { counts, items } = useUrgentItems()
  const { contracts } = useContracts()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f172a' }}>
      <Sidebar urgentCount={counts.total} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/contracts" element={<Navigate to="/contracts/1" replace />} />
          <Route path="/contracts/:id" element={<ContractDetail />} />
          <Route path="/gantt" element={<div style={{ padding: 40, color: '#9ca3af' }}>Gantt — coming soon</div>} />
          <Route path="/urgent" element={<div style={{ padding: 40, color: '#9ca3af' }}>Urgent folder — coming soon</div>} />
          <Route path="/icv" element={<div style={{ padding: 40, color: '#9ca3af' }}>ICV Tracker — coming soon</div>} />
          <Route path="/admin" element={<AiAdmin />} />
          <Route path="/org-chart" element={<OrgChart />} />
        </Routes>
      </div>

      {/* ChatBot global — appear on all pages */}
      <ChatBot contracts={contracts} urgentItems={items} />
    </div>
  )
}