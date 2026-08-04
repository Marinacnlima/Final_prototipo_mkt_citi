import { useState } from 'react'
import { Eye, EyeOff, Sparkles, Lock, Mail, ShieldCheck, ArrowLeft } from 'lucide-react'
import type { AppUser } from '../data'

// ─── Change Password ────────────────────────────────────────────────────────

interface ChangePwProps {
  user: AppUser
  onSave: (newPw: string) => void
  onBack?: () => void
}

export function ChangePasswordScreen({ user, onSave, onBack }: ChangePwProps) {
  const [pw, setPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (pw.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); return }
    if (pw !== confirm) { setError('As senhas não coincidem.'); return }
    onSave(pw)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #EEF2FF 0%, #F8FAFC 100%)' }}>
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="flex items-center justify-center rounded-xl flex-shrink-0" style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #6366F1, #818CF8)' }}>
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900" style={{ fontFamily: "'DM Sans', sans-serif" }}>MarketOps</div>
            <div className="text-xs text-slate-400">Gestão de Marketing</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8" style={{ border: '1.5px solid #E2E8F0' }}>
          <div className="flex items-start gap-3 mb-5">
            {onBack && (
              <button onClick={onBack} className="flex-shrink-0 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors mt-0.5" aria-label="Voltar">
                <ArrowLeft size={16} />
              </button>
            )}
            <div className="p-2.5 rounded-xl flex-shrink-0" style={{ background: '#EEF2FF' }}>
              <ShieldCheck size={20} className="text-indigo-500" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-slate-800" style={{ fontFamily: "'DM Sans', sans-serif" }}>Criar nova senha</h1>
              <p className="text-xs text-slate-500">Olá, {user.name.split(' ')[0]}! Defina sua senha de acesso.</p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Nova senha</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type={showPw ? 'text' : 'password'} value={pw} onChange={(e) => setPw(e.target.value)} required minLength={6}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full text-sm pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
                <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Confirmar senha</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type={showPw ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)} required
                  placeholder="Repita a nova senha"
                  className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500 rounded-lg px-3 py-2" style={{ background: '#FEF2F2' }}>{error}</p>
            )}

            <button type="submit" className="w-full py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #6366F1, #818CF8)' }}>
              Salvar e entrar
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

// ─── Login ─────────────────────────────────────────────────────────────────

interface LoginProps {
  users: AppUser[]
  onLogin: (user: AppUser) => void
}

export default function Login({ users, onLogin }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password)
      if (!user) {
        setError('E-mail ou senha incorretos.')
        setLoading(false)
        return
      }
      setError('')
      onLogin(user)
    }, 400)
  }

  function fillDemo(u: AppUser) {
    setEmail(u.email)
    setPassword(u.password)
    setError('')
  }

  const demoManager = users.find((u) => u.role === 'gerente')
  const demoAnalysts = users.filter((u) => u.role === 'analista').slice(0, 3)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
      style={{ background: 'linear-gradient(135deg, #EEF2FF 0%, #F8FAFC 60%, #F0FDF4 100%)' }}>

      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex items-center justify-center rounded-2xl flex-shrink-0"
          style={{ width: 48, height: 48, background: 'linear-gradient(135deg, #6366F1 0%, #818CF8 100%)', boxShadow: '0 8px 24px rgba(99,102,241,0.35)' }}>
          <Sparkles size={22} className="text-white" />
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'DM Sans', sans-serif" }}>MarketOps</div>
          <div className="text-sm text-slate-400">Gestão de Marketing</div>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden" style={{ border: '1.5px solid #E2E8F0' }}>
        {/* Card header stripe */}
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #6366F1, #818CF8, #A5B4FC)' }} />

        <div className="p-7">
          <h1 className="text-lg font-semibold text-slate-800 mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Bem-vindo de volta
          </h1>
          <p className="text-sm text-slate-500 mb-6">Acesse com seu e-mail e senha</p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">E-mail</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError('') }} required
                  placeholder="seu@email.com" autoComplete="email"
                  className="w-full text-sm pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-colors" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Senha</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => { setPassword(e.target.value); setError('') }} required
                  placeholder="••••••••" autoComplete="current-password"
                  className="w-full text-sm pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-colors" />
                <button type="button" onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-red-600" style={{ background: '#FEF2F2', border: '1px solid #FCA5A5' }}>
                <span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #6366F1, #818CF8)', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        </div>

        {/* Demo accounts */}
        <div className="px-7 pb-6" style={{ borderTop: '1px solid #F1F5F9' }}>
          <p className="text-xs text-slate-400 mt-4 mb-3 font-medium">Contas para demonstração — clique para preencher</p>
          <div className="space-y-2">
            {demoManager && (
              <button onClick={() => fillDemo(demoManager)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-indigo-50 transition-colors text-left group"
                style={{ border: '1.5px solid #E2E8F0' }}>
                <div className="flex items-center justify-center rounded-full text-white text-xs font-bold flex-shrink-0"
                  style={{ width: 28, height: 28, background: demoManager.color, fontFamily: "'DM Sans', sans-serif" }}>
                  {demoManager.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-700">{demoManager.name}</div>
                  <div className="text-xs text-slate-400 truncate">{demoManager.email}</div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0" style={{ background: '#EEF2FF', color: '#4F46E5' }}>Gerente</span>
              </button>
            )}
            {demoAnalysts.map((u) => (
              <button key={u.id} onClick={() => fillDemo(u)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left group"
                style={{ border: '1.5px solid #E2E8F0' }}>
                <div className="flex items-center justify-center rounded-full text-white text-xs font-bold flex-shrink-0"
                  style={{ width: 28, height: 28, background: u.color, fontFamily: "'DM Sans', sans-serif" }}>
                  {u.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-700">{u.name}</div>
                  <div className="text-xs text-slate-400 truncate">{u.email}</div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {u.mustChangePassword && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ background: '#FFFBEB', color: '#B45309' }}>1º acesso</span>
                  )}
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#F0FDF4', color: '#15803D' }}>Analista</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-6 text-xs text-slate-400">MarketOps v1.0 · Beta interno</p>
    </div>
  )
}
