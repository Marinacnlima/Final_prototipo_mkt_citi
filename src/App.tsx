import { useState } from 'react'
import { Menu } from 'lucide-react'
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
    <div className="app-shell flex h-screen overflow-hidden bg-[#101010] relative">

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
        <div className="flex-shrink-0 flex items-center gap-3 px-4 bg-[#17171A] md:hidden"
          style={{ height: 52, borderBottom: '1.5px solid rgba(255,255,255,0.1)' }}>
          <button onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl hover:bg-[rgba(255,255,255,0.08)] transition-colors flex-shrink-0"
            aria-label="Abrir menu">
            <Menu size={20} className="text-[#8A8A9A]" />
          </button>
          <div className="flex items-center gap-2">
            <div className="brand-wordmark !text-lg"><span>CITi</span></div>
            <span className="text-[#6F6F7B] text-xs">Marketing Intelligence</span>
          </div>
          <div className="flex-1" />
          <div className="flex items-center justify-center rounded-full text-white text-xs font-bold flex-shrink-0"
            style={{ width: 28, height: 28, background: currentUser.color }}>
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
