import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import ContractDetail from './pages/ContractDetail'
import ChatBot from './components/ChatBot'
import { useUrgentItems } from './hooks/useUrgentItems'
import { useContracts } from './hooks/useContracts'

export default function App() {
  const { counts, items } = useUrgentItems()
  const { contracts } = useContracts()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb' }}>
      <Sidebar urgentCount={counts.total} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/contracts" element={<Navigate to="/contracts/1" replace />} />
          <Route path="/contracts/:id" element={<ContractDetail />} />
          <Route path="/gantt" element={<div style={{ padding: 40, color: '#9ca3af' }}>Gantt — coming soon</div>} />
          <Route path="/urgent" element={<div style={{ padding: 40, color: '#9ca3af' }}>Urgent folder — coming soon</div>} />
          <Route path="/icv" element={<div style={{ padding: 40, color: '#9ca3af' }}>ICV Tracker — coming soon</div>} />
        </Routes>
      </div>

      {/* ChatBot global — appear on all pages */}
      <ChatBot contracts={contracts} urgentItems={items} />
    </div>
  )
}