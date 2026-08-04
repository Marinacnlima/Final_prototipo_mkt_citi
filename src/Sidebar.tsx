import { useState } from 'react'
import {
  LayoutDashboard, BookOpen, BarChart2, ChevronRight, Sparkles,
  LogOut, Users, Plus, X, Eye, EyeOff, KeyRound, ChevronDown, Trash2,
} from 'lucide-react'
import type { Module } from './App'
import type { AppUser } from './data'

interface Props {
  currentUser: AppUser
  users: AppUser[]
  setUsers: React.Dispatch<React.SetStateAction<AppUser[]>>
  activeModule: Module
  setModule: (m: Module) => void
  open: boolean
  onClose: () => void
  onLogout: () => void
  onChangePassword: () => void
}

const navItems: { id: Module; label: string; desc: string; Icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }> }[] = [
  { id: 'monitoramento', label: 'Monitoramento', desc: 'Kanban · Campanhas · Time', Icon: LayoutDashboard },
  { id: 'biblioteca', label: 'Biblioteca', desc: 'Posts · Materiais · Prompts', Icon: BookOpen },
  { id: 'metricas', label: 'Métricas', desc: 'Dashboard · KPIs', Icon: BarChart2 },
]

// ─── User Management Modal ─────────────────────────────────────────────────

interface UserModalProps {
  users: AppUser[]
  setUsers: React.Dispatch<React.SetStateAction<AppUser[]>>
  currentUserId: number
  onClose: () => void
}

function UserManagementModal({ users, setUsers, currentUserId, onClose }: UserModalProps) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', role: 'analista' as 'gerente' | 'analista', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)

  function deleteUser(id: number) {
    setUsers((prev) => prev.filter((u) => u.id !== id))
    setDeleteConfirmId(null)
  }

  function saveUser() {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError('Preencha todos os campos.')
      return
    }
    if (users.find((u) => u.email.toLowerCase() === form.email.toLowerCase())) {
      setError('E-mail já cadastrado.')
      return
    }
    const initials = form.name.trim().split(' ').filter(Boolean).map((w) => w[0].toUpperCase()).slice(0, 2).join('')
    const colors = ['#6366F1', '#10B981', '#F59E0B', '#EC4899', '#3B82F6', '#8B5CF6', '#14B8A6']
    const color = colors[users.length % colors.length]
    const newUser: AppUser = {
      id: Date.now(),
      name: form.name.trim(),
      initials,
      color,
      email: form.email.trim(),
      password: form.password,
      role: form.role,
      mustChangePassword: true,
    }
    setUsers((prev) => [...prev, newUser])
    setForm({ name: '', email: '', role: 'analista', password: '' })
    setShowForm(false)
    setError('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-0 sm:px-4"
      onClick={onClose}>
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden"
        style={{ maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #F1F5F9' }}>
          <div className="flex items-center gap-2">
            <Users size={16} className="text-indigo-500" />
            <h2 className="font-semibold text-slate-800" style={{ fontFamily: "'DM Sans', sans-serif" }}>Gerenciar usuários</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 64px)' }}>
          {/* User list */}
          <div className="px-6 py-4 space-y-2">
            {users.map((u) => {
              const isSelf = u.id === currentUserId
              const isConfirming = deleteConfirmId === u.id
              return (
                <div key={u.id}>
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <div className="flex items-center justify-center rounded-full text-white text-xs font-bold flex-shrink-0"
                      style={{ width: 32, height: 32, background: u.color, fontFamily: "'DM Sans', sans-serif" }}>
                      {u.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800 truncate">{u.name}{isSelf && <span className="ml-1.5 text-xs text-slate-400">(você)</span>}</div>
                      <div className="text-xs text-slate-400 truncate">{u.email}</div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {u.mustChangePassword && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full hidden sm:block" style={{ background: '#FFFBEB', color: '#B45309' }}>1º acesso</span>
                      )}
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={u.role === 'gerente' ? { background: '#EEF2FF', color: '#4F46E5' } : { background: '#F0FDF4', color: '#15803D' }}>
                        {u.role === 'gerente' ? 'Gerente' : 'Analista'}
                      </span>
                      {!isSelf && (
                        <button onClick={() => setDeleteConfirmId(u.id)}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 transition-all"
                          title="Apagar usuário">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                  {isConfirming && (
                    <div className="mt-1 px-3 py-2.5 rounded-xl flex items-center justify-between gap-3" style={{ background: '#FEF2F2', border: '1px solid #FCA5A5' }}>
                      <p className="text-xs text-red-700 flex-1">Apagar <strong>{u.name}</strong> permanentemente?</p>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button onClick={() => deleteUser(u.id)} className="text-xs px-2.5 py-1 rounded-lg font-medium text-white bg-red-500 hover:bg-red-600">Apagar</button>
                        <button onClick={() => setDeleteConfirmId(null)} className="text-xs px-2.5 py-1 rounded-lg font-medium text-slate-600 hover:bg-slate-100">Cancelar</button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Add user form toggle */}
          <div className="px-6 pb-2">
            <button onClick={() => { setShowForm((s) => !s); setError('') }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={showForm ? { background: '#F1F5F9', color: '#64748B' } : { background: 'linear-gradient(135deg, #6366F1, #818CF8)', color: '#fff' }}>
              {showForm ? <><ChevronDown size={15} /> Cancelar</> : <><Plus size={15} /> Novo usuário</>}
            </button>
          </div>

          {/* Add user form */}
          {showForm && (
            <div className="px-6 pb-6 space-y-3">
              <div className="pt-3" style={{ borderTop: '1px solid #F1F5F9' }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Nome completo *</label>
                    <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="João Silva"
                      className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">E-mail *</label>
                    <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="joao@empresa.com"
                      className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Perfil *</label>
                    <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as 'gerente' | 'analista' }))}
                      className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400 bg-white">
                      <option value="analista">Analista</option>
                      <option value="gerente">Gerente</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Senha inicial *</label>
                    <div className="relative">
                      <input type={showPw ? 'text' : 'password'} value={form.password}
                        onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                        placeholder="••••••"
                        className="w-full text-sm px-3 py-2 pr-9 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400" />
                      <button type="button" onClick={() => setShowPw((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                  </div>
                </div>

                {error && <p className="text-xs text-red-500 mt-2 px-1">{error}</p>}

                <button onClick={saveUser}
                  className="mt-4 w-full py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                  style={{ background: 'linear-gradient(135deg, #6366F1, #818CF8)' }}>
                  Criar conta
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Sidebar ───────────────────────────────────────────────────────────────

export default function Sidebar({ currentUser, users, setUsers, activeModule, setModule, open, onClose, onLogout, onChangePassword }: Props) {
  const [userModalOpen, setUserModalOpen] = useState(false)
  const isManager = currentUser.role === 'gerente'

  return (
    <>
      {/* Sidebar panel */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-40 flex flex-col flex-shrink-0',
          'transition-transform duration-300 ease-in-out',
          'md:relative md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        style={{ width: 256, background: '#0D1117', borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Logo + close button */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center rounded-xl flex-shrink-0"
              style={{ width: 34, height: 34, background: 'linear-gradient(135deg, #6366F1 0%, #818CF8 100%)' }}>
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <div className="text-white font-semibold text-sm tracking-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>MarketOps</div>
              <div className="text-xs" style={{ color: '#4B5563' }}>Gestão de Marketing</div>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <X size={16} className="text-slate-400" />
          </button>
        </div>

        {/* Current user */}
        <div className="px-4 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center rounded-full text-white font-bold text-xs flex-shrink-0"
              style={{ width: 36, height: 36, background: currentUser.color, fontFamily: "'DM Sans', sans-serif" }}>
              {currentUser.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate" style={{ color: '#E5E7EB', fontFamily: "'DM Sans', sans-serif" }}>{currentUser.name}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={isManager ? { background: 'rgba(99,102,241,0.25)', color: '#A5B4FC' } : { background: 'rgba(16,185,129,0.2)', color: '#6EE7B7' }}>
                  {isManager ? 'Gerente' : 'Analista'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto">
          <p className="text-xs font-medium uppercase tracking-widest mb-2 px-2" style={{ color: '#374151' }}>Módulos</p>
          <div className="space-y-0.5">
            {navItems.map(({ id, label, desc, Icon }) => {
              const active = activeModule === id
              return (
                <button key={id} onClick={() => setModule(id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                  style={active
                    ? { background: 'rgba(99,102,241,0.18)', borderLeft: '2px solid #6366F1' }
                    : { background: 'transparent', borderLeft: '2px solid transparent' }}>
                  <Icon size={17} className="flex-shrink-0" style={{ color: active ? '#818CF8' : '#4B5563' }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium leading-tight" style={{ color: active ? '#E5E7EB' : '#9CA3AF', fontFamily: "'DM Sans', sans-serif" }}>
                      {label}
                    </div>
                    <div className="text-xs truncate mt-0.5" style={{ color: active ? '#6366F1' : '#374151' }}>{desc}</div>
                  </div>
                  {active && <ChevronRight size={12} style={{ color: '#6366F1', flexShrink: 0 }} />}
                </button>
              )
            })}
          </div>
        </nav>

        {/* Footer actions */}
        <div className="px-3 py-3 space-y-1" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          {isManager && (
            <button onClick={() => setUserModalOpen(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all hover:bg-white/10">
              <Users size={15} style={{ color: '#6B7280' }} />
              <span className="text-sm" style={{ color: '#9CA3AF' }}>Gerenciar usuários</span>
            </button>
          )}
          <button onClick={onChangePassword}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all hover:bg-white/10">
            <KeyRound size={15} style={{ color: '#6B7280' }} />
            <span className="text-sm" style={{ color: '#9CA3AF' }}>Alterar senha</span>
          </button>
          <button onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all hover:bg-red-500/15 group">
            <LogOut size={15} style={{ color: '#6B7280' }} className="group-hover:text-red-400" />
            <span className="text-sm group-hover:text-red-400 transition-colors" style={{ color: '#9CA3AF' }}>Sair</span>
          </button>
          <div className="pt-1 text-center">
            <span className="text-xs" style={{ color: '#374151', fontFamily: "'JetBrains Mono', monospace" }}>v1.0.0 · Beta interno</span>
          </div>
        </div>
      </aside>

      {/* User management modal */}
      {userModalOpen && (
        <UserManagementModal users={users} setUsers={setUsers} currentUserId={currentUser.id} onClose={() => setUserModalOpen(false)} />
      )}
    </>
  )
}
