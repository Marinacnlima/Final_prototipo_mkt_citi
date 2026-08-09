import { useState } from 'react'
import { Eye, EyeOff, Lock, Mail, ShieldCheck, ArrowLeft, ArrowRight, Check } from 'lucide-react'
import type { AppUser } from '../data'
import citiLogo from '../assets/citi-logo-white.png'
import LiquidBackground from '../components/LiquidBackground'

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
    <div className="login-scene min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, rgba(125,26,215,0.08) 0%, #202024 100%)' }}>
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div>
            <div className="brand-wordmark !text-3xl text-center"><span>CITi</span></div>
            <div className="text-[10px] uppercase tracking-[.2em] text-[#6F6F7B]">Marketing Intelligence</div>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-8" style={{ border: '1.5px solid rgba(255,255,255,0.1)' }}>
          <div className="flex items-start gap-3 mb-5">
            {onBack && (
              <button onClick={onBack} className="flex-shrink-0 p-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.08)] text-[#555566] hover:text-[#8A8A9A] transition-colors mt-0.5" aria-label="Voltar">
                <ArrowLeft size={16} />
              </button>
            )}
            <div className="p-2.5 rounded-xl flex-shrink-0" style={{ background: 'rgba(125,26,215,0.08)' }}>
              <ShieldCheck size={20} className="text-[#7D1AD7]" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-[#F0F0F5]">Criar nova senha</h1>
              <p className="text-xs text-[#8A8A9A]">Olá, {user.name.split(' ')[0]}! Defina sua senha de acesso.</p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#8A8A9A] mb-1">Nova senha</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555566]" />
                <input type={showPw ? 'text' : 'password'} value={pw} onChange={(e) => setPw(e.target.value)} required minLength={6}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full text-sm pl-9 pr-10 py-2.5 rounded-xl border border-[rgba(255,255,255,0.1)] focus:outline-none focus:border-[#7D1AD7] focus:ring-2 focus:ring-[rgba(125,26,215,0.1)]" />
                <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555566] hover:text-[#8A8A9A]">
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8A8A9A] mb-1">Confirmar senha</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555566]" />
                <input type={showPw ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)} required
                  placeholder="Repita a nova senha"
                  className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-[rgba(255,255,255,0.1)] focus:outline-none focus:border-[#7D1AD7] focus:ring-2 focus:ring-[rgba(125,26,215,0.1)]" />
              </div>
            </div>

            {error && (
              <p className="text-xs text-[#FF5252] rounded-lg px-3 py-2" style={{ background: 'rgba(255,82,82,0.15)' }}>{error}</p>
            )}

            <button type="submit" className="w-full py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity btn-glow"
              style={{ background: 'linear-gradient(135deg, #7D1AD7, #50E678)' }}>
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
  authenticate?: (email: string, password: string) => Promise<AppUser>
}

export default function Login({ users, onLogin, authenticate }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const user = authenticate ? await authenticate(email, password) : users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password)
      if (!user) {
        setError('E-mail ou senha incorretos.')
        setLoading(false)
        return
      }
      setError('')
      onLogin(user)
    } catch {
      setError('E-mail ou senha incorretos.')
    } finally { setLoading(false) }
  }

  function fillDemo(u: AppUser) {
    setEmail(u.email)
    setPassword(u.password)
    setError('')
  }

  const demoManager = users.find((u) => u.role === 'gerente')
  return (
    <main className="original-login min-h-screen">
      <LiquidBackground />
      <div className="original-login__aurora" aria-hidden="true" />
      <img className="original-login__logo" src={citiLogo} alt="CITi" />
      <section className="original-login__hero">
        <div className="original-login__eyebrow"><span />Liquid Intelligence</div>
        <h1>Estratégia em<br /><strong className="original-login__movement">Movimento.</strong></h1>
        <p>Dados, conteúdo e performance conectados em uma única<br className="hidden xl:block" /> experiência de marketing.</p>
        <div className="original-login__pillars" aria-label="Pilares da plataforma">
          <div><b>01</b><span>Visão integrada</span></div>
          <div><b>02</b><span>Decisões ágeis</span></div>
          <div><b>03</b><span>Impacto real</span></div>
        </div>
      </section>

      <section className="original-login__panel" aria-label="Área de acesso">
        <div className="original-login__panel-glow" aria-hidden="true" />
        <div className="original-login__panel-heading">
          <div>
            <span>Área restrita</span>
            <h2>Bem-vindo de<br />volta</h2>
            <p>Entre para continuar sua jornada.</p>
          </div>
          <div className="original-login__lock"><Lock size={19} /></div>
        </div>

        <form onSubmit={submit} className="original-login__form">
            <div>
              <label>E-mail corporativo</label>
              <div className="relative">
                <Mail size={15} />
                <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError('') }} required
                  placeholder="nome@citi.org.br" autoComplete="email" />
              </div>
            </div>

            <div>
              <label>Senha</label>
              <div className="relative">
                <Lock size={15} />
                <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => { setPassword(e.target.value); setError('') }} required
                  placeholder="Digite sua senha" autoComplete="current-password" />
                <button type="button" onClick={() => setShowPw((s) => !s)}
                  className="original-login__eye" aria-label={showPw ? 'Ocultar senha' : 'Mostrar senha'}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="original-login__error">{error}</div>
            )}

            <button type="submit" disabled={loading}
              className="original-login__submit">
              <span>{loading ? 'Entrando…' : 'Entrar na plataforma'}</span><ArrowRight size={19} />
            </button>
        </form>

        {demoManager && (
          <button type="button" className="original-login__demo" onClick={() => fillDemo(demoManager)}>
            <span className="original-login__demo-check"><Check size={12} /></span>
            <span><b>Explorar demonstração</b><small>Preencher acesso de gerente</small></span>
            <ArrowRight size={15} />
          </button>
        )}
      </section>

      <footer>CITi © 2026 <span>•</span> Tecnologia que transforma</footer>
    </main>
  )
}
