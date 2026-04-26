import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import { useUrgentItems } from './hooks/useUrgentItems'

export default function App() {
  const { counts } = useUrgentItems()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb' }}>
      <Sidebar urgentCount={counts.total} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/contracts" element={<div style={{ padding: 40, color: '#9ca3af' }}>Contracts page — coming soon (Layer 2)</div>} />
          <Route path="/contracts/:id" element={<div style={{ padding: 40, color: '#9ca3af' }}>Contract detail — coming soon (Layer 2)</div>} />
          <Route path="/gantt" element={<div style={{ padding: 40, color: '#9ca3af' }}>Gantt — coming soon (Layer 4)</div>} />
          <Route path="/urgent" element={<div style={{ padding: 40, color: '#9ca3af' }}>Urgent folder — coming soon</div>} />
          <Route path="/icv" element={<div style={{ padding: 40, color: '#9ca3af' }}>ICV Tracker — coming soon</div>} />
        </Routes>
      </div>
    </div>
  )
}