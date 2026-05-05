import { NavLink } from 'react-router-dom'
import { useState } from 'react'

const NAV = [
    { to: '/', label: 'Overview', icon: 'M3 3h7v7H3V3zm8 0h7v7h-7V3zM3 11h7v7H3v-7zm8 0h7v7h-7v-7z' },
    { to: '/contracts', label: 'Contract Details', icon: 'M4 4h16v2H4V4zm0 5h16v2H4V9zm0 5h10v2H4v-2z' },
    { to: '/gantt', label: 'Gantt Chart', icon: 'M3 3h4v4H3zm6 0h10v2H9zm0 5h10v2H9zm-6 0h4v4H3zm6 5h6v2H9zM3 13h4v4H3z' },
    { to: '/urgent', label: 'Urgent Folder', icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5', urgent: true },
    { to: '/icv', label: 'ICV Tracker', icon: 'M12 2a10 10 0 100 20A10 10 0 0012 2zm1 14H11v-2h2v2zm0-4H11V6h2v6z' },
]

export default function Sidebar({ urgentCount = 0 }) {
    const [isOpen, setIsOpen] = useState(true)

    return (
        <div style={{
            width: isOpen ? 230 : 68,
            minHeight: '100vh',
            background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            padding: isOpen ? '24px 14px' : '24px 10px',
            display: 'flex', flexDirection: 'column', flexShrink: 0,
            transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
            position: 'relative',
            boxShadow: '4px 0 24px rgba(0,0,0,0.18)',
        }}>

            {/* Toggle button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'absolute', right: -13, top: 26,
                    width: 26, height: 26,
                    background: '#1e40af',
                    border: '2px solid #3b82f6',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', zIndex: 10, color: '#fff', padding: 0,
                    boxShadow: '0 2px 8px rgba(59,130,246,0.4)',
                    transition: 'background 0.2s, transform 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#2563eb'}
                onMouseLeave={e => e.currentTarget.style.background = '#1e40af'}
            >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d={isOpen ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} />
                </svg>
            </button>

            {/* Brand */}
            <div style={{
                paddingBottom: 18,
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                marginBottom: 16,
                overflow: 'hidden', whiteSpace: 'nowrap',
                display: 'flex', alignItems: 'center',
                gap: 10,
                justifyContent: isOpen ? 'flex-start' : 'center'
            }}>
                {/* Logo mark */}
                <img
                    src="/logoicp.jpeg"
                    alt="ICP Logo"
                    style={{
                        width: 38, height: 38,
                        borderRadius: 9,
                        objectFit: 'cover',
                        flexShrink: 0,
                        boxShadow: '0 2px 10px rgba(0,0,0,0.35)',
                        border: '1px solid rgba(255,255,255,0.12)',
                    }}
                />
                {isOpen && (
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 13.5, color: '#f1f5f9', letterSpacing: '0.01em' }}>
                            Global Turbine Asia
                        </div>
                        <div style={{ fontSize: 10.5, color: '#64748b', marginTop: 1, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                            ICP Dashboard
                        </div>
                    </div>
                )}
            </div>

            {/* Section label */}
            {isOpen && (
                <div style={{
                    fontSize: 9.5, color: '#475569', fontWeight: 600,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    marginBottom: 8, paddingLeft: 10
                }}>
                    Navigation
                </div>
            )}

            {/* Nav links */}
            <nav style={{ flex: 1 }}>
                {NAV.map(item => (
                    <NavLink key={item.to} to={item.to} end={item.to === '/'}
                        title={!isOpen ? item.label : undefined}
                        style={({ isActive }) => ({
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: isOpen ? '9px 12px' : '10px',
                            borderRadius: 10, marginBottom: 3,
                            fontSize: 13, textDecoration: 'none',
                            transition: 'all 0.15s ease',
                            background: isActive
                                ? 'linear-gradient(90deg, rgba(59,130,246,0.22) 0%, rgba(59,130,246,0.08) 100%)'
                                : 'transparent',
                            color: isActive ? '#93c5fd' : '#94a3b8',
                            fontWeight: isActive ? 600 : 400,
                            justifyContent: isOpen ? 'flex-start' : 'center',
                            position: 'relative',
                            borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                        })}
                        onMouseEnter={e => {
                            if (!e.currentTarget.classList.contains('active')) {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                                e.currentTarget.style.color = '#cbd5e1'
                            }
                        }}
                        onMouseLeave={e => {
                            if (!e.currentTarget.classList.contains('active')) {
                                e.currentTarget.style.background = 'transparent'
                                e.currentTarget.style.color = '#94a3b8'
                            }
                        }}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" strokeWidth="1.8"
                            style={{ flexShrink: 0 }}>
                            <path d={item.icon} />
                        </svg>
                        {isOpen && <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden' }}>{item.label}</span>}
                        {item.urgent && urgentCount > 0 && (
                            isOpen ? (
                                <span style={{
                                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                    color: '#fff',
                                    fontSize: 9.5, fontWeight: 700,
                                    padding: '2px 7px', borderRadius: 12,
                                    boxShadow: '0 1px 4px rgba(239,68,68,0.4)'
                                }}>
                                    {urgentCount}
                                </span>
                            ) : (
                                <span style={{
                                    position: 'absolute', top: 5, right: 5,
                                    width: 7, height: 7, background: '#ef4444', borderRadius: '50%',
                                    boxShadow: '0 0 0 2px rgba(239,68,68,0.3)'
                                }} />
                            )
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            {isOpen && (
                <div style={{
                    borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 14,
                    display: 'flex', alignItems: 'center', gap: 9
                }}>
                    <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #334155, #1e293b)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </div>
                    <div>
                        <div style={{ fontSize: 11.5, color: '#94a3b8', fontWeight: 500 }}>GTA Admin</div>
                        <div style={{ fontSize: 10, color: '#475569', marginTop: 1 }}>v1.0 · ICP Management</div>
                    </div>
                </div>
            )}
            {!isOpen && (
                <div style={{
                    borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 14,
                    display: 'flex', justifyContent: 'center'
                }}>
                    <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #334155, #1e293b)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </div>
                </div>
            )}
        </div>
    )
}