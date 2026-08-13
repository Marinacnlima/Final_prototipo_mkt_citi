import { useEffect, useRef, useState } from 'react'
import { LayoutDashboard, BookOpen, BarChart2 } from 'lucide-react'
import type { Module } from './App'
import type { AppUser } from './data'
import citiLogoWhite from './assets/citi-logo-white.png'

interface Props {
  currentUser: AppUser
  activeModule: Module
  setModule: (m: Module) => void
}

const navItems: { id: Module; label: string; Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }> }[] = [
  { id: 'monitoramento', label: 'Monitoramento', Icon: LayoutDashboard },
  { id: 'biblioteca', label: 'Biblioteca', Icon: BookOpen },
  { id: 'metricas', label: 'Métricas', Icon: BarChart2 },
]

function HubSpotMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="3.2" fill="#00E5C8" />
      <circle cx="12" cy="4" r="2" fill="#00E5C8" fillOpacity="0.85" />
      <circle cx="19.2" cy="16" r="2" fill="#00E5C8" fillOpacity="0.85" />
      <circle cx="4.8" cy="16" r="2" fill="#00E5C8" fillOpacity="0.85" />
      <path d="M12 7V9.4M16.9 14.6L14.4 13.1M7.1 14.6L9.6 13.1" stroke="#00E5C8" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

export default function TopBar({ currentUser, activeModule, setModule }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div ref={ref} className="fixed top-3 right-3 sm:top-4 sm:right-4 z-40 flex flex-col items-end gap-2" style={{ zIndex: 40 }}>
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
        style={{ background: 'rgba(18,18,20,.88)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)' }}>
        <img src={citiLogoWhite} alt="CITi" className="h-3.5 sm:h-4 w-auto" />
        <span className="w-px h-3.5" style={{ background: 'rgba(255,255,255,0.15)' }} />
        <HubSpotMark />
        <span className="text-xs font-semibold tracking-wide hidden sm:inline" style={{ color: '#F0F0F5' }}>HubSpot</span>
      </div>

      <div className="relative">
        <button onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open} aria-label="Navegar entre módulos"
          className="flex items-center justify-center rounded-full text-white font-bold text-xs transition-all hover:opacity-90"
          style={{ width: 36, height: 36, background: currentUser.color, boxShadow: open ? '0 0 0 3px rgba(125,26,215,0.28)' : 'none' }}>
          {currentUser.initials}
        </button>
        {open && (
          <div role="menu" className="absolute right-0 top-full mt-2 w-52 rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: '#17171A', border: '1px solid rgba(255,255,255,0.08)' }}>
            {navItems.map(({ id, label, Icon }) => {
              const active = activeModule === id
              return (
                <button key={id} role="menuitem" onClick={() => { setModule(id); setOpen(false) }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-left transition-all hover:bg-white/10"
                  style={active ? { background: 'rgba(125,26,215,0.12)' } : undefined}>
                  <Icon size={16} style={{ color: active ? '#B69AEF' : '#6F6F7B' }} />
                  <span className="text-sm font-medium" style={{ color: active ? '#F0F0F5' : '#8A8A9A' }}>{label}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
