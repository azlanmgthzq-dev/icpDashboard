import { NavLink } from 'react-router-dom'
import { useState } from 'react'

const NAV = [
    { to: '/', label: 'Contracts Overall', icon: 'M3 3h7v7H3V3zm8 0h7v7h-7V3zM3 11h7v7H3v-7zm8 0h7v7h-7v-7z' },
    { to: '/contracts', label: 'Contracts Details', icon: 'M4 4h16v2H4V4zm0 5h16v2H4V9zm0 5h10v2H4v-2z' },
    { to: '/gantt', label: 'Gantt', icon: 'M3 3h4v4H3zm6 0h10v2H9zm0 5h10v2H9zm-6 0h4v4H3zm6 5h6v2H9zM3 13h4v4H3z' },
    { to: '/urgent', label: 'Urgent folder', icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5', urgent: true },
    { to: '/icv', label: 'ICV Tracker', icon: 'M12 2a10 10 0 100 20A10 10 0 0012 2zm1 14H11v-2h2v2zm0-4H11V6h2v6z' },
]

export default function Sidebar({ urgentCount = 0 }) {
    const [isOpen, setIsOpen] = useState(true)

    return (
        <div style={{
            width: isOpen ? 220 : 64, minHeight: '100vh', background: '#f9fafb',
            borderRight: '0.5px solid #e5e7eb', padding: isOpen ? '20px 12px' : '20px 8px',
            display: 'flex', flexDirection: 'column', flexShrink: 0,
            transition: 'width 0.2s', position: 'relative'
        }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'absolute', right: -12, top: 24, width: 24, height: 24,
                    background: '#fff', border: '1px solid #e5e7eb', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', zIndex: 10, color: '#374151', padding: 0
                }}
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d={isOpen ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} />
                </svg>
            </button>

            <div style={{
                paddingBottom: 16, borderBottom: '0.5px solid #e5e7eb', marginBottom: 12,
                overflow: 'hidden', whiteSpace: 'nowrap', display: 'flex', justifyContent: isOpen ? 'flex-start' : 'center'
            }}>
                {isOpen ? (
                    <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>
                            Global Turbine Asia
                        </div>
                        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                            ICP Dashboard
                        </div>
                    </div>
                ) : (
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>
                        GTA
                    </div>
                )}
            </div>

            <nav style={{ flex: 1 }}>
                {NAV.map(item => (
                    <NavLink key={item.to} to={item.to} end={item.to === '/'}
                        title={!isOpen ? item.label : undefined}
                        style={({ isActive }) => ({
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '8px 10px', borderRadius: 8, marginBottom: 2,
                            fontSize: 13, textDecoration: 'none', transition: 'background 0.15s',
                            background: isActive ? '#EBF3FB' : 'transparent',
                            color: isActive ? '#185FA5' : '#374151',
                            fontWeight: isActive ? 500 : 400,
                            justifyContent: isOpen ? 'flex-start' : 'center',
                            position: 'relative'
                        })}>
                        <svg width="15" height="15" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" strokeWidth="1.8"
                            style={{ flexShrink: 0 }}>
                            <path d={item.icon} />
                        </svg>
                        {isOpen && <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden' }}>{item.label}</span>}
                        {item.urgent && urgentCount > 0 && (
                            isOpen ? (
                                <span style={{
                                    background: '#E24B4A', color: '#fff',
                                    fontSize: 10, padding: '1px 6px', borderRadius: 10
                                }}>
                                    {urgentCount}
                                </span>
                            ) : (
                                <span style={{
                                    position: 'absolute', top: 4, right: 4,
                                    width: 8, height: 8, background: '#E24B4A', borderRadius: '50%'
                                }} />
                            )
                        )}
                    </NavLink>
                ))}
            </nav>

            {isOpen && (
                <div style={{
                    borderTop: '0.5px solid #e5e7eb', paddingTop: 12,
                    fontSize: 11, color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden'
                }}>
                    GTA · ICP Management v1.0
                </div>
            )}
        </div>
    )
}