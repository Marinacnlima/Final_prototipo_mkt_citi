import { lazy, Suspense, useEffect, useState } from 'react'
import TopBar from './TopBar'
import SettingsMenu from './SettingsMenu'
import Login, { ChangePasswordScreen } from './pages/Login'
import type { Post, AppUser } from './data'
import { api } from './api'
import LiquidBackground from './components/LiquidBackground'

// Carregados sob demanda (cada um só quando o módulo correspondente é aberto pela primeira vez) para não
// jogar Recharts e o código dos 3 módulos inteiros no bundle inicial.
const Monitoramento = lazy(() => import('./pages/Monitoramento'))
const Biblioteca = lazy(() => import('./pages/Biblioteca'))
const Metricas = lazy(() => import('./pages/Metricas'))

export type Profile = 'gerente' | 'analista'
export type Module = 'monitoramento' | 'biblioteca' | 'metricas'
export type Channel = 'todos' | 'instagram' | 'linkedin' | 'site' | 'email'

export default function App() {
  const [users, setUsers] = useState<AppUser[]>([])
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null)
  const [changingPw, setChangingPw] = useState(false)
  const [changingPwVoluntary, setChangingPwVoluntary] = useState(false)
  const [activeModule, setActiveModule] = useState<Module>('monitoramento')
  const [channel, setChannel] = useState<Channel>('todos')
  const [posts, setPostsState] = useState<Post[]>([])

  const mapUser = (user: any): AppUser => ({ id: user.id, name: user.nomeCompleto, initials: user.nomeCompleto.split(/\s+/).slice(0,2).map((part:string)=>part[0]).join('').toUpperCase(), color: user.perfil === 'GERENTE' ? '#7D1AD7' : '#507AE6', email: user.email, password: '', role: user.perfil === 'GERENTE' ? 'gerente' : 'analista', mustChangePassword: user.primeiroAcesso })
  const mapPost = (post: any): Post => ({ id: post.id, title: post.titulo, channel: post.canal.toLowerCase(), campaign: post.campanhaNome ?? '', images: post.imagens.map((image:any)=>({url:image.url,tipo:image.tipo==='VIDEO'?'video':'imagem'})), linkUrl: post.linkUrl ?? undefined, ctr: post.ctr ?? undefined, profileVisits: post.visitasPerfil ?? undefined, caption: post.conteudo, format: ({REELS:'reel',CARROSSEL:'carousel',POST_ESTATICO:'static',STORIES:'story',PDF_DOCUMENTO:'document',TEXTO_IMAGEM:'static',VIDEO:'video',ARTIGO_NEWSLETTER:'article',ENQUETE:'poll'} as any)[post.formato] ?? 'static', insights: { likes: post.curtidas, reach: post.alcance, impressions: post.impressoes, engagement: post.engajamento, saves: post.saves, shares: post.compartilhamentos, comments: post.comentarios }, publishedAt: post.dataPublicacao?.slice(0,10), validUntil: post.dataLimite?.slice(0,10) ?? '' })

  async function loadPrivateData(user: AppUser) {
    if (user.role === 'gerente') setUsers((await api.users.list()).map(mapUser))
    setPostsState((await api.posts.list()).map(mapPost))
  }

  const toApiPost=(post:Post)=>({canal:post.channel.toUpperCase(),titulo:post.title,conteudo:post.caption,formato:({reel:'REELS',carousel:'CARROSSEL',static:'POST_ESTATICO',story:'STORIES',document:'PDF_DOCUMENTO',video:'VIDEO',article:'ARTIGO_NEWSLETTER',poll:'ENQUETE'} as any)[post.format],dataPublicacao:post.publishedAt||new Date().toISOString(),dataLimite:post.validUntil||null,imagens:post.images.map((image)=>({url:image.url,tipo:image.tipo==='video'?'VIDEO':'IMAGEM'})),linkUrl:post.linkUrl||null,alcance:post.insights.reach,impressoes:post.insights.impressions,engajamento:post.insights.engagement,curtidas:post.insights.likes,comentarios:post.insights.comments,saves:post.insights.saves,compartilhamentos:post.insights.shares,...(post.channel==='linkedin'?{ctr:post.ctr??0}:{visitasPerfil:post.profileVisits??0})})
  function setPosts(update:(previous:Post[])=>Post[]){
    // As chamadas de API ficam fora do atualizador funcional do setState — em React.StrictMode (ativo em
    // main.tsx), esse atualizador pode ser invocado duas vezes em desenvolvimento, o que duplicaria as
    // requisições create/update/delete se elas estivessem dentro dele.
    const previous=posts
    const next=update(previous)
    setPostsState(next)
    const before=new Map(previous.map((post)=>[post.id,post]))
    const after=new Map(next.map((post)=>[post.id,post]))
    for(const post of previous)if(!after.has(post.id))api.posts.remove(post.id).catch(console.error)
    for(const post of next){
      const old=before.get(post.id)
      if(!old){api.posts.create(toApiPost(post)).then((created)=>setPostsState((current)=>current.map((item)=>item.id===post.id?mapPost(created):item))).catch(console.error)}
      else if(old!==post)api.posts.update(post.id,toApiPost(post)).then((updated)=>setPostsState((current)=>current.map((item)=>item.id===post.id?mapPost(updated):item))).catch(console.error)
    }
  }

  useEffect(() => { if (api.hasToken) api.me().then((raw) => { const user=mapUser(raw); setCurrentUser(user); if(user.mustChangePassword){setChangingPw(true)} else loadPrivateData(user) }).catch(()=>api.setToken(null)) }, [])

  async function authenticate(email: string, password: string) {
    const result=await api.login(email,password); api.setToken(result.token); return mapUser(result.user)
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
  }

  if (!currentUser) return <Login users={users} onLogin={handleLogin} authenticate={authenticate} forgotPassword={forgotPassword} verifyCode={verifyResetCode} resetPassword={resetPassword} />
  if (changingPw) return <ChangePasswordScreen user={currentUser} onSave={handleChangePassword} onBack={changingPwVoluntary ? () => setChangingPw(false) : handleLogout} />

  const isManager = currentUser.role === 'gerente'
  const profile: Profile = currentUser.role

  return (
    <div className="internal-app app-shell h-screen overflow-hidden bg-[#101010] relative">
      <LiquidBackground interactive={false} className="internal-liquid-background" />

      <TopBar activeModule={activeModule} setModule={setActiveModule} />
      <SettingsMenu
        currentUser={currentUser}
        users={users}
        setUsers={setUsers}
        isManager={isManager}
        onLogout={handleLogout}
        onChangePassword={() => { setChangingPw(true); setChangingPwVoluntary(true) }}
      />

      {/* Module content */}
      <div className="absolute inset-0">
        <div className="h-full overflow-hidden">
          <Suspense fallback={<div className="h-full flex items-center justify-center text-sm text-[#8A8A9A]">Carregando…</div>}>
            {activeModule === 'monitoramento' && (
              <Monitoramento profile={profile} isManager={isManager} channel={channel} setChannel={setChannel} currentUserId={currentUser.id} />
            )}
            {activeModule === 'biblioteca' && (
              <Biblioteca channel={channel} setChannel={setChannel} posts={posts} setPosts={setPosts} isManager={isManager} />
            )}
            {activeModule === 'metricas' && (
              <Metricas channel={channel} setChannel={setChannel} posts={posts} />
            )}
          </Suspense>
        </div>
      </div>
    </div>
  )
}
