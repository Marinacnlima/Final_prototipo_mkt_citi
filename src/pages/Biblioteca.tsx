import { useState, useMemo } from 'react'
import {
  BookOpen, FileText, MessageSquare, Download, Star, Copy, Check,
  ChevronLeft, ChevronRight, Hash, Eye, Plus, Edit2, Trash2, X, Search,
} from 'lucide-react'
import type { Channel } from '../App'
import type { ChannelType, Prompt, Material, Post } from '../data'
import { materialsData, promptsData } from '../data'

// ─── Shared ────────────────────────────────────────────────────────────────

const CH: Record<ChannelType, { label: string; color: string; bg: string; dot: string }> = {
  instagram: { label: 'Instagram', color: '#BE185D', bg: '#FDF2F8', dot: '#EC4899' },
  linkedin: { label: 'LinkedIn', color: '#1E40AF', bg: '#EFF6FF', dot: '#3B82F6' },
  site: { label: 'Site', color: '#6D28D9', bg: '#F5F3FF', dot: '#7C3AED' },
  email: { label: 'Email', color: '#92400E', bg: '#FFFBEB', dot: '#F59E0B' },
}

function ChannelBadge({ ch }: { ch: ChannelType }) {
  const c = CH[ch]
  return (
    <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: c.bg, color: c.color }}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ background: c.dot }} />
      {c.label}
    </span>
  )
}

function ChannelFilter({ channel, setChannel }: { channel: Channel; setChannel: (c: Channel) => void }) {
  const opts: { id: Channel; label: string }[] = [
    { id: 'todos', label: 'Todos' }, { id: 'instagram', label: 'Instagram' },
    { id: 'linkedin', label: 'LinkedIn' }, { id: 'site', label: 'Site' }, { id: 'email', label: 'Email' },
  ]
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {opts.map((o) => {
        const active = channel === o.id
        const c = o.id !== 'todos' ? CH[o.id as ChannelType] : null
        return (
          <button key={o.id} onClick={() => setChannel(o.id)} className="text-xs px-3 py-1.5 rounded-full font-medium transition-all"
            style={active ? { background: c ? c.dot : '#6366F1', color: '#fff' } : { background: '#F1F5F9', color: '#64748B' }}>
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

type Tab = 'posts' | 'materiais' | 'prompts'

function TabNav({ active, setTab }: { active: Tab; setTab: (t: Tab) => void }) {
  const tabs = [
    { id: 'posts' as Tab, label: 'Posts', icon: <Eye size={14} /> },
    { id: 'materiais' as Tab, label: 'Materiais Ricos', icon: <FileText size={14} /> },
    { id: 'prompts' as Tab, label: 'Prompts', icon: <MessageSquare size={14} /> },
  ]
  return (
    <div className="flex gap-1">
      {tabs.map((t) => (
        <button key={t.id} onClick={() => setTab(t.id)} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all"
          style={active === t.id ? { background: '#EEF2FF', color: '#4F46E5' } : { color: '#64748B', background: 'transparent' }}>
          {t.icon}{t.label}
        </button>
      ))}
    </div>
  )
}

function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className={`bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden ${wide ? 'w-full max-w-2xl' : 'w-full max-w-md'}`}
        style={{ margin: 16 }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: '1px solid #F1F5F9' }}>
          <h3 className="font-semibold text-slate-800" style={{ fontFamily: "'DM Sans', sans-serif" }}>{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  )
}

function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      {children}
    </div>
  )
}

function Inp({ value, onChange, placeholder, type = 'text', as }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string; as?: 'textarea' }) {
  const cls = "w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
  if (as === 'textarea') return <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cls} rows={4} />
  return <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cls} />
}

// ─── Posts ─────────────────────────────────────────────────────────────────

interface PostFormData {
  title: string; channel: ChannelType; campaign: string
  images: string; caption: string
  publishedAt: string; validUntil: string
  reach: string; impressions: string; engagement: string; saves: string; profileVisits: string
}

function PostModal({ initial, onSave, onClose }: {
  initial?: Post
  onSave: (post: Post) => void
  onClose: () => void
}) {
  const [form, setForm] = useState<PostFormData>({
    title: initial?.title ?? '',
    channel: initial?.channel ?? 'instagram',
    campaign: initial?.campaign ?? '',
    images: initial?.images.join('\n') ?? '',
    caption: initial?.caption ?? '',
    publishedAt: initial?.publishedAt ?? '',
    validUntil: initial?.validUntil ?? '',
    reach: String(initial?.insights.reach ?? ''),
    impressions: String(initial?.insights.impressions ?? ''),
    engagement: String(initial?.insights.engagement ?? ''),
    saves: String(initial?.insights.saves ?? ''),
    profileVisits: String(initial?.insights.profileVisits ?? ''),
  })

  function save() {
    if (!form.title.trim()) return
    const images = form.images.split('\n').map((s) => s.trim()).filter(Boolean)
    const post: Post = {
      id: initial?.id ?? Date.now(),
      title: form.title, channel: form.channel, campaign: form.campaign,
      images: images.length ? images : ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop&auto=format'],
      caption: form.caption, publishedAt: form.publishedAt, validUntil: form.validUntil,
      insights: {
        reach: parseInt(form.reach) || 0, impressions: parseInt(form.impressions) || 0,
        engagement: parseInt(form.engagement) || 0, saves: parseInt(form.saves) || 0,
        profileVisits: parseInt(form.profileVisits) || 0,
      },
    }
    onSave(post); onClose()
  }

  const channels: ChannelType[] = ['instagram', 'linkedin', 'site', 'email']

  return (
    <Modal title={initial ? 'Editar post' : 'Novo post'} onClose={onClose} wide>
      <div className="px-6 py-4 space-y-4">
        <FormRow label="Título *">
          <Inp value={form.title} onChange={(v) => setForm((f) => ({ ...f, title: v }))} placeholder="Título do post" />
        </FormRow>
        <FormRow label="Canal">
          <div className="flex gap-2 flex-wrap">
            {channels.map((ch) => (
              <button key={ch} onClick={() => setForm((f) => ({ ...f, channel: ch }))} className="text-xs px-3 py-1.5 rounded-full font-medium transition-all"
                style={form.channel === ch ? { background: CH[ch].dot, color: '#fff' } : { background: CH[ch].bg, color: CH[ch].color }}>
                {CH[ch].label}
              </button>
            ))}
          </div>
        </FormRow>
        <FormRow label="Campanha">
          <Inp value={form.campaign} onChange={(v) => setForm((f) => ({ ...f, campaign: v }))} placeholder="Ex: Lançamento Produto Q3" />
        </FormRow>
        <FormRow label="URLs das imagens (uma por linha)">
          <Inp as="textarea" value={form.images} onChange={(v) => setForm((f) => ({ ...f, images: v }))} placeholder="https://..." />
        </FormRow>
        <FormRow label="Legenda / Texto">
          <Inp as="textarea" value={form.caption} onChange={(v) => setForm((f) => ({ ...f, caption: v }))} placeholder="Texto do post..." />
        </FormRow>
        <div className="grid grid-cols-2 gap-4">
          <FormRow label="Data de publicação">
            <Inp type="date" value={form.publishedAt} onChange={(v) => setForm((f) => ({ ...f, publishedAt: v }))} />
          </FormRow>
          <FormRow label="Válido até">
            <Inp type="date" value={form.validUntil} onChange={(v) => setForm((f) => ({ ...f, validUntil: v }))} />
          </FormRow>
        </div>
        <div className="pt-2" style={{ borderTop: '1px solid #F1F5F9' }}>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Insights</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {([['reach', 'Alcance'], ['impressions', 'Impressões'], ['engagement', 'Engajamento'], ['saves', 'Saves'], ['profileVisits', 'Visitas perfil']] as [keyof PostFormData, string][]).map(([k, l]) => (
              <FormRow key={k} label={l}>
                <Inp type="number" value={form[k] as string} onChange={(v) => setForm((f) => ({ ...f, [k]: v }))} placeholder="0" />
              </FormRow>
            ))}
          </div>
        </div>
      </div>
      <div className="px-6 py-4 flex gap-3" style={{ borderTop: '1px solid #F1F5F9' }}>
        <button onClick={save} className="px-5 py-2 rounded-xl text-sm font-medium text-white hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #6366F1, #818CF8)' }}>
          {initial ? 'Salvar alterações' : 'Criar post'}
        </button>
        <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100">Cancelar</button>
      </div>
    </Modal>
  )
}

function PostsView({ channel, posts, setPosts }: { channel: Channel; posts: Post[]; setPosts: (fn: (prev: Post[]) => Post[]) => void }) {
  const [slides, setSlides] = useState<Record<number, number>>({})
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})
  const [modal, setModal] = useState<{ post?: Post } | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const filtered = channel === 'todos' ? posts : posts.filter((p) => p.channel === channel)

  function setSlide(id: number, idx: number) { setSlides((s) => ({ ...s, [id]: idx })) }
  function toggleExpand(id: number) { setExpanded((e) => ({ ...e, [id]: !e[id] })) }

  function savePost(post: Post) {
    setPosts((prev) => {
      const idx = prev.findIndex((p) => p.id === post.id)
      if (idx >= 0) return prev.map((p, i) => i === idx ? post : p)
      return [...prev, post]
    })
  }

  function deletePost(id: number) {
    setPosts((prev) => prev.filter((p) => p.id !== id))
    setDeleteId(null)
  }

  return (
    <div className="h-full overflow-auto p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">{filtered.length} post{filtered.length !== 1 ? 's' : ''}</p>
        <button onClick={() => setModal({})} className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl text-white hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #6366F1, #818CF8)' }}>
          <Plus size={15} /> Adicionar post
        </button>
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {filtered.map((post) => {
          const slide = slides[post.id] ?? 0
          const isExpanded = expanded[post.id]
          const caption = isExpanded ? post.caption : post.caption.slice(0, 120) + (post.caption.length > 120 ? '…' : '')
          return (
            <div key={post.id} className="bg-white rounded-2xl overflow-hidden flex flex-col group"
              style={{ border: '1.5px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <div className="relative" style={{ background: '#F8FAFC', aspectRatio: '1/1' }}>
                <img src={post.images[slide]} alt={post.title} className="w-full h-full object-cover" />
                {post.images.length > 1 && (
                  <>
                    <button onClick={() => setSlide(post.id, Math.max(0, slide - 1))} disabled={slide === 0}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center">
                      <ChevronLeft size={14} />
                    </button>
                    <button onClick={() => setSlide(post.id, Math.min(post.images.length - 1, slide + 1))} disabled={slide === post.images.length - 1}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center">
                      <ChevronRight size={14} />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {post.images.map((_, i) => (
                        <button key={i} onClick={() => setSlide(post.id, i)} className="rounded-full transition-all"
                          style={{ width: i === slide ? 16 : 6, height: 6, background: i === slide ? '#fff' : 'rgba(255,255,255,0.5)' }} />
                      ))}
                    </div>
                  </>
                )}
                <div className="absolute top-2 left-2"><ChannelBadge ch={post.channel} /></div>
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setModal({ post })} className="w-7 h-7 rounded-lg bg-white/90 flex items-center justify-center text-indigo-600 hover:bg-white shadow-sm">
                    <Edit2 size={12} />
                  </button>
                  <button onClick={() => setDeleteId(post.id)} className="w-7 h-7 rounded-lg bg-white/90 flex items-center justify-center text-red-500 hover:bg-white shadow-sm">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400">{post.campaign}</span>
                  <span className="text-xs text-slate-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    até {post.validUntil.slice(5).split('-').reverse().join('/')}
                  </span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line flex-1">{caption}</p>
                {post.caption.length > 120 && (
                  <button onClick={() => toggleExpand(post.id)} className="text-xs text-indigo-500 hover:text-indigo-700 mt-1 text-left">
                    {isExpanded ? 'Ver menos' : 'Ver mais'}
                  </button>
                )}
                <div className="mt-4 pt-3 grid grid-cols-3 gap-2 text-center" style={{ borderTop: '1px solid #F1F5F9' }}>
                  {[
                    { label: 'Alcance', value: post.insights.reach },
                    { label: 'Engajamento', value: post.insights.engagement },
                    { label: 'Saves', value: post.insights.saves },
                  ].map((kpi) => (
                    <div key={kpi.label}>
                      <div className="text-sm font-semibold text-slate-800" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{kpi.value.toLocaleString('pt-BR')}</div>
                      <div className="text-xs text-slate-400">{kpi.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && <div className="col-span-full text-center py-16 text-slate-400">Nenhum post neste canal</div>}
      </div>

      {modal && <PostModal initial={modal.post} onSave={savePost} onClose={() => setModal(null)} />}

      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <p className="font-semibold text-slate-800 mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>Apagar post?</p>
            <p className="text-sm text-slate-500 mb-4">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-2">
              <button onClick={() => deletePost(deleteId)} className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600">Apagar</button>
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Materials ─────────────────────────────────────────────────────────────

const matTypeStyle = {
  ebook: { label: 'Ebook', bg: '#EEF2FF', color: '#4338CA' },
  newsletter: { label: 'Newsletter', bg: '#FFF7ED', color: '#C2410C' },
  case: { label: 'Case', bg: '#F0FDF4', color: '#15803D' },
}

interface MatForm {
  type: 'ebook' | 'newsletter' | 'case'
  title: string; description: string; cover: string; downloads: string
}

function MaterialModal({ initial, onSave, onClose }: { initial?: Material; onSave: (m: Material) => void; onClose: () => void }) {
  const [form, setForm] = useState<MatForm>({
    type: initial?.type ?? 'ebook',
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    cover: initial?.cover ?? '',
    downloads: String(initial?.downloads ?? '0'),
  })

  function save() {
    if (!form.title.trim()) return
    onSave({
      id: initial?.id ?? Date.now(),
      type: form.type, title: form.title, description: form.description,
      cover: form.cover || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=250&fit=crop&auto=format',
      downloads: parseInt(form.downloads) || 0,
      createdAt: initial?.createdAt ?? new Date().toISOString().slice(0, 10),
    })
    onClose()
  }

  return (
    <Modal title={initial ? 'Editar material' : 'Novo material'} onClose={onClose}>
      <div className="px-6 py-4 space-y-4">
        <FormRow label="Tipo">
          <div className="flex gap-2">
            {(['ebook', 'newsletter', 'case'] as const).map((t) => {
              const s = matTypeStyle[t]
              return (
                <button key={t} onClick={() => setForm((f) => ({ ...f, type: t }))} className="flex-1 text-xs py-2 rounded-lg font-medium transition-all"
                  style={form.type === t ? { background: s.color, color: '#fff' } : { background: s.bg, color: s.color }}>
                  {s.label}
                </button>
              )
            })}
          </div>
        </FormRow>
        <FormRow label="Título *">
          <Inp value={form.title} onChange={(v) => setForm((f) => ({ ...f, title: v }))} placeholder="Título do material" />
        </FormRow>
        <FormRow label="Descrição">
          <Inp value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} placeholder="Breve descrição..." />
        </FormRow>
        <FormRow label="URL da capa">
          <Inp value={form.cover} onChange={(v) => setForm((f) => ({ ...f, cover: v }))} placeholder="https://..." />
        </FormRow>
        <FormRow label="Downloads">
          <Inp type="number" value={form.downloads} onChange={(v) => setForm((f) => ({ ...f, downloads: v }))} placeholder="0" />
        </FormRow>
      </div>
      <div className="px-6 py-4 flex gap-3" style={{ borderTop: '1px solid #F1F5F9' }}>
        <button onClick={save} className="px-5 py-2 rounded-xl text-sm font-medium text-white hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #6366F1, #818CF8)' }}>
          {initial ? 'Salvar' : 'Criar material'}
        </button>
        <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100">Cancelar</button>
      </div>
    </Modal>
  )
}

function MaterialsView() {
  const [materials, setMaterials] = useState<Material[]>(materialsData)
  const [typeFilter, setTypeFilter] = useState<'todos' | 'ebook' | 'newsletter' | 'case'>('todos')
  const [modal, setModal] = useState<{ mat?: Material } | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const filtered = typeFilter === 'todos' ? materials : materials.filter((m) => m.type === typeFilter)

  function saveMaterial(mat: Material) {
    setMaterials((prev) => {
      const idx = prev.findIndex((m) => m.id === mat.id)
      if (idx >= 0) return prev.map((m, i) => i === idx ? mat : m)
      return [...prev, mat]
    })
  }

  function deleteMaterial(id: number) {
    setMaterials((prev) => prev.filter((m) => m.id !== id))
    setDeleteId(null)
  }

  return (
    <div className="h-full overflow-auto p-5">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div className="flex gap-2">
            {(['todos', 'ebook', 'newsletter', 'case'] as const).map((t) => {
              const s = t !== 'todos' ? matTypeStyle[t] : null
              return (
                <button key={t} onClick={() => setTypeFilter(t)} className="text-xs px-3 py-1.5 rounded-full font-medium capitalize transition-all"
                  style={typeFilter === t ? { background: s ? s.color : '#6366F1', color: '#fff' } : { background: '#F1F5F9', color: '#64748B' }}>
                  {t === 'todos' ? 'Todos' : matTypeStyle[t].label}
                </button>
              )
            })}
          </div>
          <button onClick={() => setModal({})} className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl text-white hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #6366F1, #818CF8)' }}>
            <Plus size={15} /> Adicionar
          </button>
        </div>

        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {filtered.map((mat) => {
            const s = matTypeStyle[mat.type]
            return (
              <div key={mat.id} className="bg-white rounded-2xl overflow-hidden flex flex-col group"
                style={{ border: '1.5px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <div className="relative" style={{ height: 140, background: '#F8FAFC' }}>
                  <img src={mat.cover} alt={mat.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.3))' }} />
                  <span className="absolute top-3 left-3 text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setModal({ mat })} className="w-7 h-7 rounded-lg bg-white/90 flex items-center justify-center text-indigo-600 hover:bg-white shadow-sm">
                      <Edit2 size={12} />
                    </button>
                    <button onClick={() => setDeleteId(mat.id)} className="w-7 h-7 rounded-lg bg-white/90 flex items-center justify-center text-red-500 hover:bg-white shadow-sm">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-sm font-semibold text-slate-800 mb-1 leading-snug" style={{ fontFamily: "'DM Sans', sans-serif" }}>{mat.title}</h3>
                  <p className="text-xs text-slate-500 flex-1">{mat.description}</p>
                  <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid #F1F5F9' }}>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Download size={11} />
                      <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{mat.downloads.toLocaleString('pt-BR')}</span>
                    </div>
                    <button className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium hover:opacity-80"
                      style={{ background: '#EEF2FF', color: '#4338CA' }}>
                      <Download size={11} /> Baixar
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {modal && <MaterialModal initial={modal.mat} onSave={saveMaterial} onClose={() => setModal(null)} />}
        {deleteId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDeleteId(null)}>
            <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <p className="font-semibold text-slate-800 mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>Apagar material?</p>
              <p className="text-sm text-slate-500 mb-4">Esta ação não pode ser desfeita.</p>
              <div className="flex gap-2">
                <button onClick={() => deleteMaterial(deleteId)} className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-500">Apagar</button>
                <button onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100">Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Prompts ───────────────────────────────────────────────────────────────

const catStyle: Record<string, { bg: string; color: string }> = {
  Instagram: { bg: '#FDF2F8', color: '#BE185D' },
  LinkedIn: { bg: '#EFF6FF', color: '#1E40AF' },
  Email: { bg: '#FFFBEB', color: '#92400E' },
  Carrossel: { bg: '#FFF7ED', color: '#C2410C' },
  Site: { bg: '#F5F3FF', color: '#6D28D9' },
}

function getCatStyle(cat: string) {
  return catStyle[cat] ?? { bg: '#F1F5F9', color: '#64748B' }
}

interface PromptFormData {
  category: string; title: string; content: string; tags: string
}

function PromptModal({ initial, onSave, onClose }: { initial?: Prompt; onSave: (p: Prompt) => void; onClose: () => void }) {
  const [form, setForm] = useState<PromptFormData>({
    category: initial?.category ?? 'Instagram',
    title: initial?.title ?? '',
    content: initial?.content ?? '',
    tags: initial?.tags.join(', ') ?? '',
  })

  const cats = ['Instagram', 'LinkedIn', 'Email', 'Carrossel', 'Site']

  function save() {
    if (!form.title.trim()) return
    onSave({
      id: initial?.id ?? Date.now(),
      category: form.category, title: form.title, content: form.content,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      favorited: initial?.favorited ?? false,
      usageCount: initial?.usageCount ?? 0,
    })
    onClose()
  }

  return (
    <Modal title={initial ? 'Editar prompt' : 'Novo prompt'} onClose={onClose} wide>
      <div className="px-6 py-4 space-y-4">
        <FormRow label="Categoria">
          <div className="flex gap-2 flex-wrap">
            {cats.map((c) => {
              const s = getCatStyle(c)
              return (
                <button key={c} onClick={() => setForm((f) => ({ ...f, category: c }))} className="text-xs px-3 py-1.5 rounded-full font-medium transition-all"
                  style={form.category === c ? { background: s.color, color: '#fff' } : { background: s.bg, color: s.color }}>
                  {c}
                </button>
              )
            })}
          </div>
        </FormRow>
        <FormRow label="Título *">
          <Inp value={form.title} onChange={(v) => setForm((f) => ({ ...f, title: v }))} placeholder="Ex: Caption engajante com CTA" />
        </FormRow>
        <FormRow label="Conteúdo do prompt *">
          <textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            placeholder="Escreva o prompt aqui..." rows={8}
            className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-400 font-mono"
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }} />
        </FormRow>
        <FormRow label="Tags (separadas por vírgula)">
          <Inp value={form.tags} onChange={(v) => setForm((f) => ({ ...f, tags: v }))} placeholder="caption, cta, engajamento" />
        </FormRow>
      </div>
      <div className="px-6 py-4 flex gap-3" style={{ borderTop: '1px solid #F1F5F9' }}>
        <button onClick={save} className="px-5 py-2 rounded-xl text-sm font-medium text-white hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #6366F1, #818CF8)' }}>
          {initial ? 'Salvar alterações' : 'Criar prompt'}
        </button>
        <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100">Cancelar</button>
      </div>
    </Modal>
  )
}

function PromptsView() {
  const [prompts, setPrompts] = useState<Prompt[]>(promptsData)
  const [catFilter, setCatFilter] = useState('Todos')
  const [search, setSearch] = useState('')
  const [onlyFav, setOnlyFav] = useState(false)
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})
  const [copied, setCopied] = useState<number | null>(null)
  const [modal, setModal] = useState<{ prompt?: Prompt } | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const categories = useMemo(() => ['Todos', ...Array.from(new Set(prompts.map((p) => p.category)))], [prompts])

  const filtered = useMemo(() => prompts.filter((p) => {
    if (catFilter !== 'Todos' && p.category !== catFilter) return false
    if (onlyFav && !p.favorited) return false
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.content.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }), [prompts, catFilter, onlyFav, search])

  function toggleFav(id: number) {
    setPrompts((prev) => prev.map((p) => p.id === id ? { ...p, favorited: !p.favorited } : p))
  }

  function copyPrompt(id: number, content: string) {
    navigator.clipboard.writeText(content).catch(() => {})
    setCopied(id); setTimeout(() => setCopied(null), 2000)
  }

  function savePrompt(p: Prompt) {
    setPrompts((prev) => {
      const idx = prev.findIndex((x) => x.id === p.id)
      if (idx >= 0) return prev.map((x, i) => i === idx ? p : x)
      return [...prev, p]
    })
  }

  function deletePrompt(id: number) {
    setPrompts((prev) => prev.filter((p) => p.id !== id))
    setDeleteId(null)
  }

  return (
    <div className="h-full overflow-auto p-5">
      <div className="max-w-4xl mx-auto">
        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1 min-w-48" style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0' }}>
            <Search size={14} className="text-slate-400 flex-shrink-0" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar prompts..."
              className="flex-1 text-sm bg-transparent focus:outline-none text-slate-700 placeholder-slate-400" />
            {search && <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600"><X size={13} /></button>}
          </div>

          {/* Favorites toggle */}
          <button onClick={() => setOnlyFav((f) => !f)} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-medium transition-all"
            style={onlyFav ? { background: '#FFF7ED', color: '#C2410C', border: '1.5px solid #FDE68A' } : { background: '#F8FAFC', color: '#64748B', border: '1.5px solid #E2E8F0' }}>
            <Star size={13} style={{ fill: onlyFav ? '#F59E0B' : 'none', color: onlyFav ? '#F59E0B' : '#CBD5E1' }} />
            Favoritos · {prompts.filter((p) => p.favorited).length}
          </button>

          {/* Add button */}
          <button onClick={() => setModal({})} className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl text-white hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #6366F1, #818CF8)' }}>
            <Plus size={15} /> Novo prompt
          </button>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {categories.map((cat) => {
            const s = cat !== 'Todos' ? getCatStyle(cat) : null
            return (
              <button key={cat} onClick={() => setCatFilter(cat)} className="text-xs px-3 py-1.5 rounded-full font-medium transition-all"
                style={catFilter === cat ? { background: s ? s.color : '#6366F1', color: '#fff' } : { background: '#F1F5F9', color: '#64748B' }}>
                {cat}
              </button>
            )
          })}
        </div>

        <div className="space-y-3">
          {filtered.map((prompt) => {
            const s = getCatStyle(prompt.category)
            const isExp = expanded[prompt.id]
            return (
              <div key={prompt.id} className="bg-white rounded-xl overflow-hidden group"
                style={{ border: '1.5px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: s.bg, color: s.color }}>{prompt.category}</span>
                        <span className="text-xs text-slate-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>usado {prompt.usageCount}×</span>
                      </div>
                      <h3 className="text-sm font-semibold text-slate-800" style={{ fontFamily: "'DM Sans', sans-serif" }}>{prompt.title}</h3>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => setModal({ prompt })} className="p-1.5 rounded-lg text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 opacity-0 group-hover:opacity-100 transition-all">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => setDeleteId(prompt.id)} className="p-1.5 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all">
                        <Trash2 size={13} />
                      </button>
                      <button onClick={() => toggleFav(prompt.id)} className="p-1.5 rounded-lg transition-colors hover:bg-slate-50">
                        <Star size={16} style={{ fill: prompt.favorited ? '#F59E0B' : 'none', color: prompt.favorited ? '#F59E0B' : '#CBD5E1' }} />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 rounded-lg p-3 cursor-pointer" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', fontFamily: "'JetBrains Mono', monospace" }}
                    onClick={() => setExpanded((e) => ({ ...e, [prompt.id]: !e[prompt.id] }))}>
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                      {isExp ? prompt.content : prompt.content.slice(0, 100) + (prompt.content.length > 100 ? '…' : '')}
                      {prompt.content.length > 100 && <span className="text-indigo-400 ml-1">{isExp ? ' ▲' : ' ▼'}</span>}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex gap-1.5 flex-wrap">
                      {prompt.tags.map((tag) => (
                        <span key={tag} className="flex items-center gap-0.5 text-xs px-2 py-0.5 rounded-full" style={{ background: '#F1F5F9', color: '#64748B' }}>
                          <Hash size={9} />{tag}
                        </span>
                      ))}
                    </div>
                    <button onClick={() => copyPrompt(prompt.id, prompt.content)} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium hover:opacity-80"
                      style={copied === prompt.id ? { background: '#F0FDF4', color: '#15803D' } : { background: '#EEF2FF', color: '#4338CA' }}>
                      {copied === prompt.id ? <><Check size={11} /> Copiado!</> : <><Copy size={11} /> Copiar</>}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              {search ? `Nenhum resultado para "${search}"` : 'Nenhum prompt encontrado'}
            </div>
          )}
        </div>

        {modal && <PromptModal initial={modal.prompt} onSave={savePrompt} onClose={() => setModal(null)} />}
        {deleteId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDeleteId(null)}>
            <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <p className="font-semibold text-slate-800 mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>Apagar prompt?</p>
              <p className="text-sm text-slate-500 mb-4">Esta ação não pode ser desfeita.</p>
              <div className="flex gap-2">
                <button onClick={() => deletePrompt(deleteId)} className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-500">Apagar</button>
                <button onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100">Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────

interface Props {
  channel: Channel
  setChannel: (c: Channel) => void
  posts: Post[]
  setPosts: (fn: (prev: Post[]) => Post[]) => void
  isManager?: boolean
}

export default function Biblioteca({ channel, setChannel, posts, setPosts }: Props) {
  const [tab, setTab] = useState<Tab>('posts')

  return (
    <div className="flex flex-col h-full">
      <header className="bg-white flex-shrink-0" style={{ borderBottom: '1.5px solid #E2E8F0' }}>
        <div className="px-4 md:px-6 pt-4 md:pt-5 pb-0 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
          <div>
            <h1 className="text-lg md:text-xl font-semibold text-slate-900 leading-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>Biblioteca</h1>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5 hidden sm:block">Posts publicados, materiais ricos e biblioteca de prompts</p>
          </div>
          {tab === 'posts' && <ChannelFilter channel={channel} setChannel={setChannel} />}
        </div>
        <div className="px-4 md:px-6 pt-2 md:pt-3 pb-0 overflow-x-auto">
          <TabNav active={tab} setTab={setTab} />
        </div>
      </header>
      <div className="flex-1 overflow-hidden">
        {tab === 'posts' && <PostsView channel={channel} posts={posts} setPosts={setPosts} />}
        {tab === 'materiais' && <MaterialsView />}
        {tab === 'prompts' && <PromptsView />}
      </div>
    </div>
  )
}
