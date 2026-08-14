import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Menu, LayoutDashboard, BookOpen, BarChart2 } from 'lucide-react'
import type { Module } from './App'

interface Props {
  activeModule: Module
  setModule: (m: Module) => void
}

const navItems: { id: Module; label: string; Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }> }[] = [
  { id: 'monitoramento', label: 'Monitoramento', Icon: LayoutDashboard },
  { id: 'biblioteca', label: 'Biblioteca', Icon: BookOpen },
  { id: 'metricas', label: 'Métricas', Icon: BarChart2 },
]

const BTN_SIZE = 44
const EDGE_MARGIN = 12
const STORAGE_KEY = 'citi-hubspot-topbar-pos'
const DRAG_THRESHOLD = 6

function defaultPos() {
  return { x: EDGE_MARGIN, y: window.innerHeight - BTN_SIZE - EDGE_MARGIN }
}

function clampPos(x: number, y: number) {
  const maxX = window.innerWidth - BTN_SIZE - EDGE_MARGIN
  const maxY = window.innerHeight - BTN_SIZE - EDGE_MARGIN
  return { x: Math.min(Math.max(x, EDGE_MARGIN), Math.max(maxX, EDGE_MARGIN)), y: Math.min(Math.max(y, EDGE_MARGIN), Math.max(maxY, EDGE_MARGIN)) }
}

export default function TopBar({ activeModule, setModule }: Props) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return clampPos(JSON.parse(saved).x, JSON.parse(saved).y)
    } catch { /* ignore */ }
    return defaultPos()
  })
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({})
  const ref = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)
  const draggedRef = useRef(false)
  const dragStart = useRef({ px: 0, py: 0, bx: 0, by: 0 })

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  useEffect(() => {
    function onResize() { setPos((p) => clampPos(p.x, p.y)) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  function onPointerDown(e: React.PointerEvent) {
    if (e.button !== 0 && e.pointerType === 'mouse') return
    draggingRef.current = true
    draggedRef.current = false
    dragStart.current = { px: e.clientX, py: e.clientY, bx: pos.x, by: pos.y }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!draggingRef.current) return
    const dx = e.clientX - dragStart.current.px
    const dy = e.clientY - dragStart.current.py
    if (!draggedRef.current && Math.hypot(dx, dy) < DRAG_THRESHOLD) return
    draggedRef.current = true
    setPos(clampPos(dragStart.current.bx + dx, dragStart.current.by + dy))
  }

  function onPointerUp() {
    if (!draggingRef.current) return
    draggingRef.current = false
    if (draggedRef.current) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(pos)) } catch { /* ignore */ }
    }
  }

  function onButtonClick() {
    if (draggedRef.current) { draggedRef.current = false; return }
    setOpen((o) => !o)
  }

  useLayoutEffect(() => {
    if (!open) return
    const btnRect = ref.current?.getBoundingClientRect()
    const menu = menuRef.current
    if (!btnRect || !menu) return
    const menuW = menu.offsetWidth
    const menuH = menu.offsetHeight
    const centerX = btnRect.left + btnRect.width / 2
    const centerY = btnRect.top + btnRect.height / 2
    const openRight = centerX < window.innerWidth / 2
    const openDown = centerY < window.innerHeight / 2

    let left = openRight ? btnRect.left : btnRect.right - menuW
    let top = openDown ? btnRect.bottom + 8 : btnRect.top - menuH - 8

    left = Math.min(Math.max(left, EDGE_MARGIN), window.innerWidth - menuW - EDGE_MARGIN)
    top = Math.min(Math.max(top, EDGE_MARGIN), window.innerHeight - menuH - EDGE_MARGIN)

    setMenuStyle({ position: 'fixed', left, top })
  }, [open, pos])

  return (
    <div ref={ref} className="fixed z-40" style={{ left: pos.x, top: pos.y, zIndex: 40, touchAction: 'none' }}>
      <button
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={onButtonClick}
        aria-haspopup="menu" aria-expanded={open} aria-label="Navegar entre módulos"
        className="flex items-center justify-center rounded-full transition-all hover:opacity-90"
        style={{ width: BTN_SIZE, height: BTN_SIZE, background: 'rgba(18,18,20,.9)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(16px)', boxShadow: open ? '0 0 0 3px rgba(125,26,215,0.28)' : 'none', cursor: 'grab' }}>
        <Menu size={20} style={{ color: open ? '#7D1AD7' : '#8A8A9A' }} />
      </button>
      {open && (
        <div ref={menuRef} role="menu" className="w-56 rounded-2xl overflow-hidden shadow-2xl"
          style={{ ...menuStyle, background: '#17171A', border: '1px solid rgba(255,255,255,0.08)' }}>
          {navItems.map(({ id, label, Icon }) => {
            const active = activeModule === id
            return (
              <button key={id} role="menuitem" onClick={() => { setModule(id); setOpen(false) }}
                className="w-full flex items-center gap-2.5 px-4 py-3.5 text-left transition-all hover:bg-white/10"
                style={active ? { background: 'rgba(125,26,215,0.12)' } : undefined}>
                <Icon size={18} style={{ color: active ? '#B69AEF' : '#6F6F7B' }} />
                <span className="text-sm font-medium" style={{ color: active ? '#F0F0F5' : '#8A8A9A' }}>{label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
