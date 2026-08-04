import { useState } from 'react'
import { Menu, Sparkles } from 'lucide-react'
import Sidebar from './Sidebar'
import Monitoramento from './pages/Monitoramento'
import Biblioteca from './pages/Biblioteca'
import Metricas from './pages/Metricas'
import Login, { ChangePasswordScreen } from './pages/Login'
import { postsData, initialUsers } from './data'
import type { Post, AppUser } from './data'

export type Profile = 'gerente' | 'analista'
export type Module = 'monitoramento' | 'biblioteca' | 'metricas'
export type Channel = 'todos' | 'instagram' | 'linkedin' | 'site' | 'email'

export default function App() {
  const [users, setUsers] = useState<AppUser[]>(initialUsers)
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null)
  const [changingPw, setChangingPw] = useState(false)
  const [changingPwVoluntary, setChangingPwVoluntary] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeModule, setActiveModule] = useState<Module>('monitoramento')
  const [channel, setChannel] = useState<Channel>('todos')
  const [posts, setPosts] = useState<Post[]>(postsData)

  function handleLogin(user: AppUser) {
    setCurrentUser(user)
    if (user.mustChangePassword) { setChangingPw(true); setChangingPwVoluntary(false) }
  }

  function handleChangePassword(newPw: string) {
    setUsers((prev) => prev.map((u) => u.id === currentUser!.id ? { ...u, password: newPw, mustChangePassword: false } : u))
    setCurrentUser((u) => u ? { ...u, password: newPw, mustChangePassword: false } : null)
    setChangingPw(false)
  }

  function handleLogout() {
    setCurrentUser(null)
    setChangingPw(false)
    setSidebarOpen(false)
  }

  function handleSetModule(m: Module) {
    setActiveModule(m)
    setSidebarOpen(false)
  }

  if (!currentUser) return <Login users={users} onLogin={handleLogin} />
  if (changingPw) return <ChangePasswordScreen user={currentUser} onSave={handleChangePassword} onBack={changingPwVoluntary ? () => setChangingPw(false) : undefined} />

  const isManager = currentUser.role === 'gerente'
  const profile: Profile = currentUser.role

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 relative">

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <Sidebar
        currentUser={currentUser}
        users={users}
        setUsers={setUsers}
        activeModule={activeModule}
        setModule={handleSetModule}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
        onChangePassword={() => { setChangingPw(true); setChangingPwVoluntary(true) }}
      />

      {/* Main content */}
      <div className="flex-1 min-w-0 overflow-hidden flex flex-col">

        {/* Mobile top bar */}
        <div className="flex-shrink-0 flex items-center gap-3 px-4 bg-white md:hidden"
          style={{ height: 52, borderBottom: '1.5px solid #E2E8F0' }}>
          <button onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors flex-shrink-0"
            aria-label="Abrir menu">
            <Menu size={20} className="text-slate-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center rounded-lg flex-shrink-0"
              style={{ width: 26, height: 26, background: 'linear-gradient(135deg, #6366F1, #818CF8)' }}>
              <Sparkles size={12} className="text-white" />
            </div>
            <span className="font-semibold text-slate-800 text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>MarketOps</span>
          </div>
          <div className="flex-1" />
          <div className="flex items-center justify-center rounded-full text-white text-xs font-bold flex-shrink-0"
            style={{ width: 28, height: 28, background: currentUser.color, fontFamily: "'DM Sans', sans-serif" }}>
            {currentUser.initials}
          </div>
        </div>

        {/* Module content */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {activeModule === 'monitoramento' && (
            <Monitoramento profile={profile} isManager={isManager} channel={channel} setChannel={setChannel} />
          )}
          {activeModule === 'biblioteca' && (
            <Biblioteca channel={channel} setChannel={setChannel} posts={posts} setPosts={setPosts} isManager={isManager} />
          )}
          {activeModule === 'metricas' && (
            <Metricas channel={channel} setChannel={setChannel} posts={posts} />
          )}
        </div>
      </div>
    </div>
  )
}
