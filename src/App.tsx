import { useEffect, useState } from 'react'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'
import Monitoramento from './pages/Monitoramento'
import Biblioteca from './pages/Biblioteca'
import Metricas from './pages/Metricas'
import Login, { ChangePasswordScreen } from './pages/Login'
import type { Post, AppUser } from './data'
import { api } from './api'
import citiLogoWhite from './assets/citi-logo-white.png'
import LiquidBackground from './components/LiquidBackground'
import { mapApiPost, mapApiUser, toApiPost } from './features/app/mappers'

export type Profile = 'gerente' | 'analista'
export type Module = 'monitoramento' | 'biblioteca' | 'metricas'
export type Channel = 'todos' | 'instagram' | 'linkedin' | 'site' | 'email'

export default function App() {
  const [users, setUsers] = useState<AppUser[]>([])
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null)
  const [changingPw, setChangingPw] = useState(false)
  const [changingPwVoluntary, setChangingPwVoluntary] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeModule, setActiveModule] = useState<Module>('monitoramento')
  const [channel, setChannel] = useState<Channel>('todos')
  const [posts, setPostsState] = useState<Post[]>([])

  async function loadPrivateData(user: AppUser) {
    if (user.role === 'gerente') setUsers((await api.users.list()).map(mapApiUser))
    setPostsState((await api.posts.list()).map(mapApiPost))
  }

  function setPosts(update:(previous:Post[])=>Post[]){setPostsState((previous)=>{const next=update(previous);const before=new Map(previous.map((post)=>[post.id,post]));const after=new Map(next.map((post)=>[post.id,post]));for(const post of previous)if(!after.has(post.id))api.posts.remove(post.id).catch(console.error);for(const post of next){const old=before.get(post.id);if(!old){api.posts.create(toApiPost(post)).then((created)=>setPostsState((current)=>current.map((item)=>item.id===post.id?mapApiPost(created):item))).catch(console.error)}else if(old!==post)api.posts.update(post.id,toApiPost(post)).then((updated)=>setPostsState((current)=>current.map((item)=>item.id===post.id?mapApiPost(updated):item))).catch(console.error)}return next})}

  useEffect(() => { if (api.hasToken) api.me().then((raw) => { const user=mapApiUser(raw); setCurrentUser(user); if(user.mustChangePassword){setChangingPw(true)} else loadPrivateData(user) }).catch(()=>api.setToken(null)) }, [])

  async function authenticate(email: string, password: string) {
    const result=await api.login(email,password); api.setToken(result.token); return mapApiUser(result.user)
  }

  async function forgotPassword(email: string) { await api.forgotPassword(email) }
  async function verifyResetCode(email: string, code: string) { return (await api.verifyCode(email, code)).resetToken }
  async function resetPassword(resetToken: string, newPassword: string) { await api.resetPassword(resetToken, newPassword) }

  function handleLogin(user: AppUser) {
    setCurrentUser(user)
    if (user.mustChangePassword) { setChangingPw(true); setChangingPwVoluntary(false) }
    else loadPrivateData(user)
  }

  async function handleChangePassword(currentPw: string, newPw: string) {
    await api.changePassword(currentPw,newPw)
    setUsers((prev) => prev.map((u) => u.id === currentUser!.id ? { ...u, password: '', mustChangePassword: false } : u))
    setCurrentUser((u) => u ? { ...u, password: newPw, mustChangePassword: false } : null)
    setChangingPw(false)
    if(currentUser) loadPrivateData({...currentUser,mustChangePassword:false})
  }

  function handleLogout() {
    api.logout().catch(()=>undefined); api.setToken(null)
    setCurrentUser(null)
    setChangingPw(false)
    setSidebarOpen(false)
  }

  function handleSetModule(m: Module) {
    setActiveModule(m)
    setSidebarOpen(false)
  }

  if (!currentUser) return <Login users={users} onLogin={handleLogin} authenticate={authenticate} forgotPassword={forgotPassword} verifyCode={verifyResetCode} resetPassword={resetPassword} />
  if (changingPw) return <ChangePasswordScreen user={currentUser} onSave={handleChangePassword} onBack={changingPwVoluntary ? () => setChangingPw(false) : undefined} />

  const isManager = currentUser.role === 'gerente'
  const profile: Profile = currentUser.role

  return (
    <div className="internal-app app-shell flex h-screen overflow-hidden bg-[#101010] relative">
      <LiquidBackground interactive={false} className="internal-liquid-background" />

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
        <div className="mobile-topbar flex-shrink-0 flex items-center gap-3 px-4 bg-[#17171A] md:hidden"
          style={{ height: 52, borderBottom: '1.5px solid rgba(255,255,255,0.1)' }}>
          <button onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl hover:bg-[rgba(255,255,255,0.08)] transition-colors flex-shrink-0"
            aria-label="Abrir menu">
            <Menu size={20} className="text-[#8A8A9A]" />
          </button>
          <div className="flex items-center gap-2">
            <img className="mobile-brand-logo" src={citiLogoWhite} alt="CITi" />
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
            <Monitoramento profile={profile} isManager={isManager} channel={channel} setChannel={setChannel} currentUserId={currentUser.id} />
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
