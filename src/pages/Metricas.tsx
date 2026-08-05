import { useState, useMemo } from 'react'
import {
  BarChart2, TrendingUp, Users, Globe,
  Plus, X, Edit2, Check, Info, ArrowUp, ArrowDown, Trash2,
} from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts'
import type { Channel } from '../App'
import type { ChannelType, Post, CustomMetric } from '../data'
import { defaultMetrics, mqlData, getWeekLabel } from '../data'

// ─── Tab nav ──────────────────────────────────────────────────────────────

type Tab = 'dashboard' | 'inserir' | 'mql'

function TabNav({ active, setTab }: { active: Tab; setTab: (t: Tab) => void }) {
  const tabs = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: <BarChart2 size={14} /> },
    { id: 'inserir' as Tab, label: 'Inserir Métricas', icon: <Plus size={14} /> },
    { id: 'mql' as Tab, label: 'MQL Ideal', icon: <Users size={14} /> },
  ]
  return (
    <div className="flex gap-1">
      {tabs.map((t) => (
        <button key={t.id} onClick={() => setTab(t.id)} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all"
          style={active === t.id ? { background: 'rgba(0,229,200,0.08)', color: '#00B39E' } : { color: '#8A8A9A', background: 'transparent' }}>
          {t.icon}{t.label}
        </button>
      ))}
    </div>
  )
}

function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className={`bg-[#111118] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden ${wide ? 'w-full max-w-2xl' : 'w-full max-w-md'}`}
        style={{ margin: 16 }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="font-semibold text-[#F0F0F5]">{title}</h3>
          <button onClick={onClose} className="text-[#555566] hover:text-[#8A8A9A]"><X size={18} /></button>
        </div>
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  )
}

function KpiCard({ label, value, sub, delta, color, icon }: { label: string; value: string | number; sub?: string; delta?: number; color: string; icon: React.ReactNode }) {
  return (
    <div className="bg-[#111118] rounded-2xl p-5" style={{ border: '1.5px solid rgba(255,255,255,0.1)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-[#8A8A9A] mb-1">{label}</p>
          <p className="text-2xl font-bold text-[#F0F0F5]" style={{ color }}>
            {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
          </p>
          {sub && <p className="text-xs text-[#555566] mt-0.5">{sub}</p>}
        </div>
        <div className="p-2 rounded-xl flex-shrink-0" style={{ background: color + '18' }}>
          <span style={{ color }}>{icon}</span>
        </div>
      </div>
      {delta !== undefined && (
        <div className="mt-2 flex items-center gap-1 text-xs">
          {delta >= 0 ? (
            <><ArrowUp size={11} className="text-[#00C853]" /><span className="text-[#00C853] font-medium">+{delta}%</span></>
          ) : (
            <><ArrowDown size={11} className="text-[#FF5252]" /><span className="text-[#FF5252] font-medium">{delta}%</span></>
          )}
          <span className="text-[#555566]">vs mês anterior</span>
        </div>
      )}
    </div>
  )
}

// ─── Dashboard ─────────────────────────────────────────────────────────────

const channelDist = [
  { name: 'Instagram', value: 45, color: '#E1306C' },
  { name: 'LinkedIn', value: 30, color: '#0A66C2' },
  { name: 'Email', value: 15, color: '#FFB300' },
  { name: 'Site', value: 10, color: '#00C853' },
]

function Dashboard({ posts, metrics, mql }: {
  posts: Post[]
  metrics: CustomMetric[]
  mql: typeof mqlData
}) {
  // Compute weekly reach from posts (auto-calculated)
  const weeklyReach = useMemo(() => {
    const buckets: Record<string, { Instagram: number; LinkedIn: number }> = {
      'Sem 1': { Instagram: 0, LinkedIn: 0 },
      'Sem 2': { Instagram: 0, LinkedIn: 0 },
      'Sem 3': { Instagram: 0, LinkedIn: 0 },
      'Sem 4': { Instagram: 0, LinkedIn: 0 },
    }
    posts.forEach((post) => {
      const week = getWeekLabel(post.publishedAt)
      if (!buckets[week]) return
      if (post.channel === 'instagram') buckets[week].Instagram += post.insights.reach
      else if (post.channel === 'linkedin') buckets[week].LinkedIn += post.insights.reach
    })
    return Object.entries(buckets).map(([week, data]) => ({ week, ...data }))
  }, [posts])

  const igReach = posts.filter((p) => p.channel === 'instagram').reduce((a, p) => a + p.insights.reach, 0)
  const liImpressions = posts.filter((p) => p.channel === 'linkedin').reduce((a, p) => a + p.insights.impressions, 0)
  const igEngRate = posts.filter((p) => p.channel === 'instagram').length > 0
    ? (posts.filter((p) => p.channel === 'instagram').reduce((a, p) => a + p.insights.engagement, 0) / igReach * 100).toFixed(1)
    : '0'

  return (
    <div className="h-full overflow-auto p-5">
      <div className="max-w-5xl mx-auto space-y-5">
        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <KpiCard label="Alcance Instagram" value={igReach} sub="soma posts publicados" delta={14} color="#E1306C" icon={<TrendingUp size={18} />} />
          <KpiCard label="Impressões LinkedIn" value={liImpressions} sub="soma posts publicados" delta={8.2} color="#0A66C2" icon={<Globe size={18} />} />
          <KpiCard label="Taxa de Engajamento IG" value={`${igEngRate}%`} sub="eng / alcance × 100" delta={0.3} color="#00C853" icon={<BarChart2 size={18} />} />
          <KpiCard label="MQLs este mês" value={mql.monthlyMQLs} sub={`Taxa MQL→SQL: ${mql.mqlToSQLRate}%`} delta={12} color="#00E5C8" icon={<Users size={18} />} />
        </div>

        {/* Custom metrics */}
        {metrics.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-[#F0F0F5] mb-3">Métricas personalizadas</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {metrics.map((m) => (
                <div key={m.id} className="bg-[#111118] rounded-xl p-4" style={{ border: '1.5px solid rgba(255,255,255,0.1)' }}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-xs text-[#8A8A9A] leading-snug flex-1">{m.name}</p>
                    <div className="w-2 h-2 rounded-full flex-shrink-0 mt-0.5" style={{ background: m.color }} />
                  </div>
                  <p className="text-xl font-bold" style={{ color: m.color }}>
                    {typeof m.value === 'number' ? m.value.toLocaleString('pt-BR') : m.value}
                    <span className="text-sm font-normal ml-1 text-[#555566]">{m.unit}</span>
                  </p>
                  <p className="text-xs text-[#555566] mt-1 leading-snug">{m.formula}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weekly reach chart — auto-calculated */}
        <div className="bg-[#111118] rounded-2xl p-5" style={{ border: '1.5px solid rgba(255,255,255,0.1)' }}>
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-sm font-semibold text-[#F0F0F5]">
              Alcance semanal — calculado automaticamente pelos posts
            </h3>
            <div className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,229,200,0.08)', color: '#00B39E' }}>
              <Check size={10} /> auto
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weeklyReach} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="igGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E1306C" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#E1306C" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="liGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0A66C2" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0A66C2" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#555566' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#555566' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#111118', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12, color: '#F0F0F5' }}
                formatter={(v) => Number(v ?? 0).toLocaleString('pt-BR')} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#8A8A9A' }} />
              <Area type="monotone" dataKey="Instagram" stroke="#E1306C" strokeWidth={2} fill="url(#igGrad)" />
              <Area type="monotone" dataKey="LinkedIn" stroke="#0A66C2" strokeWidth={2} fill="url(#liGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Channel mix + post breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#111118] rounded-2xl p-5" style={{ border: '1.5px solid rgba(255,255,255,0.1)' }}>
            <h3 className="text-sm font-semibold text-[#F0F0F5] mb-4">Mix de canais</h3>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={channelDist} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                  {channelDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: '#111118', fontSize: 12, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#F0F0F5' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {channelDist.map((c) => (
                <div key={c.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ background: c.color }} />
                    <span className="text-[#8A8A9A]">{c.name}</span>
                  </div>
                  <span style={{ color: '#8A8A9A' }}>{c.value}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 bg-[#111118] rounded-2xl p-5" style={{ border: '1.5px solid rgba(255,255,255,0.1)' }}>
            <h3 className="text-sm font-semibold text-[#F0F0F5] mb-4">Alcance por post (julho)</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={posts.slice(0, 6).map((p) => ({ name: p.title.slice(0, 20) + '…', reach: p.insights.reach, channel: p.channel }))}
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#555566' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#555566' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#111118', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12, color: '#F0F0F5' }}
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  formatter={(v) => Number(v ?? 0).toLocaleString('pt-BR')} />
                <Bar dataKey="reach" name="Alcance" radius={[4, 4, 0, 0]}
                  fill="#00E5C8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Custom Metrics (Inserir) ─────────────────────────────────────────────

const METRIC_COLORS = ['#00E5C8', '#E1306C', '#0A66C2', '#00C853', '#FFB300', '#40C4FF', '#FF5252', '#00B39E']
const CH_LABELS: Record<ChannelType, string> = { instagram: 'Instagram', linkedin: 'LinkedIn', site: 'Site', email: 'Email' }

interface MetricForm {
  name: string; value: string; unit: string; formula: string; channel: ChannelType | ''; color: string
}

function MetricModal({ initial, onSave, onClose }: { initial?: CustomMetric; onSave: (m: CustomMetric) => void; onClose: () => void }) {
  const [form, setForm] = useState<MetricForm>({
    name: initial?.name ?? '', value: String(initial?.value ?? ''),
    unit: initial?.unit ?? '%', formula: initial?.formula ?? '',
    channel: initial?.channel ?? '', color: initial?.color ?? '#00E5C8',
  })

  function save() {
    if (!form.name.trim()) return
    onSave({
      id: initial?.id ?? `m-${Date.now()}`,
      name: form.name, value: parseFloat(form.value) || 0,
      unit: form.unit, formula: form.formula,
      channel: form.channel ? form.channel as ChannelType : undefined,
      color: form.color,
    })
    onClose()
  }

  return (
    <Modal title={initial ? 'Editar métrica' : 'Nova métrica'} onClose={onClose} wide>
      <div className="px-6 py-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-[#8A8A9A] mb-1">Nome da métrica *</label>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ex: Taxa de Engajamento IG"
              className="w-full text-sm px-3 py-2 rounded-lg border border-[rgba(255,255,255,0.1)] focus:outline-none focus:border-[#00E5C8]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#8A8A9A] mb-1">Valor atual</label>
            <input type="number" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} placeholder="0"
              className="w-full text-sm px-3 py-2 rounded-lg border border-[rgba(255,255,255,0.1)] focus:outline-none focus:border-[#00E5C8]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#8A8A9A] mb-1">Unidade</label>
            <input value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} placeholder="%, leads, sessões…"
              className="w-full text-sm px-3 py-2 rounded-lg border border-[rgba(255,255,255,0.1)] focus:outline-none focus:border-[#00E5C8]" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-[#8A8A9A] mb-1">Regra de cálculo / fórmula</label>
            <textarea value={form.formula} onChange={(e) => setForm((f) => ({ ...f, formula: e.target.value }))} rows={3}
              placeholder="Ex: (Curtidas + Comentários + Saves) / Alcance × 100"
              className="w-full text-sm px-3 py-2 rounded-lg border border-[rgba(255,255,255,0.1)] focus:outline-none focus:border-[#00E5C8] resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#8A8A9A] mb-1">Canal (opcional)</label>
            <select value={form.channel} onChange={(e) => setForm((f) => ({ ...f, channel: e.target.value as ChannelType | '' }))}
              className="w-full text-sm px-3 py-2 rounded-lg border border-[rgba(255,255,255,0.1)] focus:outline-none focus:border-[#00E5C8] bg-[#111118]">
              <option value="">Todos</option>
              {(['instagram', 'linkedin', 'site', 'email'] as ChannelType[]).map((ch) => (
                <option key={ch} value={ch}>{CH_LABELS[ch]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#8A8A9A] mb-1">Cor</label>
            <div className="flex gap-2 flex-wrap">
              {METRIC_COLORS.map((c) => (
                <button key={c} onClick={() => setForm((f) => ({ ...f, color: c }))}
                  className="w-6 h-6 rounded-full transition-all"
                  style={{ background: c, outline: form.color === c ? `3px solid ${c}` : 'none', outlineOffset: 2 }} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="px-6 py-4 flex gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={save} className="px-5 py-2 rounded-xl text-sm font-medium text-white hover:opacity-90 btn-glow"
          style={{ background: 'linear-gradient(135deg, #00E5C8, #00FFD9)' }}>
          {initial ? 'Salvar' : 'Criar métrica'}
        </button>
        <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium text-[#8A8A9A] hover:bg-[rgba(255,255,255,0.08)]">Cancelar</button>
      </div>
    </Modal>
  )
}

function InsertMetrics({ metrics, setMetrics }: { metrics: CustomMetric[]; setMetrics: (fn: (prev: CustomMetric[]) => CustomMetric[]) => void }) {
  const [modal, setModal] = useState<{ metric?: CustomMetric } | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editVal, setEditVal] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  function saveMetric(m: CustomMetric) {
    setMetrics((prev) => {
      const idx = prev.findIndex((x) => x.id === m.id)
      if (idx >= 0) return prev.map((x, i) => i === idx ? m : x)
      return [...prev, m]
    })
  }

  function deleteMetric(id: string) {
    setMetrics((prev) => prev.filter((m) => m.id !== id))
    setDeleteId(null)
  }

  function commitValueEdit(id: string) {
    setMetrics((prev) => prev.map((m) => m.id === id ? { ...m, value: parseFloat(editVal) || 0 } : m))
    setEditingId(null)
  }

  return (
    <div className="h-full overflow-auto p-5">
      <div className="max-w-3xl mx-auto">
        <div
          className="rounded-xl p-4 mb-5 flex items-start gap-3"
          style={{ background: 'rgba(0,229,200,0.08)', border: '1px solid #00E5C8' }}>
          <Info size={16} className="text-[#00E5C8] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[#00E5C8]">
            Gerencie métricas personalizadas com regras de cálculo. Cada métrica tem um valor (inserido manualmente) e uma fórmula que documenta como ela é calculada.
            O alcance semanal no dashboard é calculado automaticamente a partir dos posts da Biblioteca.
          </p>
        </div>

        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-[#F0F0F5]">
            Métricas personalizadas ({metrics.length})
          </h3>
          <button onClick={() => setModal({})} className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl text-white hover:opacity-90 btn-glow"
            style={{ background: 'linear-gradient(135deg, #00E5C8, #00FFD9)' }}>
            <Plus size={15} /> Nova métrica
          </button>
        </div>

        <div className="space-y-3">
          {metrics.map((m) => (
            <div key={m.id} className="bg-[#111118] rounded-xl overflow-hidden group"
              style={{ border: '1.5px solid rgba(255,255,255,0.1)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-3 h-3 rounded-full flex-shrink-0 mt-1" style={{ background: m.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-[#F0F0F5]">{m.name}</p>
                        {m.channel && (
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: '#8A8A9A' }}>{CH_LABELS[m.channel]}</span>
                        )}
                      </div>
                      <p className="text-xs text-[#8A8A9A]">{m.formula}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {editingId === m.id ? (
                      <div className="flex items-center gap-1">
                        <input type="number" value={editVal} onChange={(e) => setEditVal(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') commitValueEdit(m.id); if (e.key === 'Escape') setEditingId(null) }}
                          className="w-20 text-sm px-2 py-1 rounded border border-[rgba(0,229,200,0.3)] focus:outline-none text-center" autoFocus />
                        <button onClick={() => commitValueEdit(m.id)} className="text-[#00C853] hover:text-[#00C853]"><Check size={14} /></button>
                        <button onClick={() => setEditingId(null)} className="text-[#555566] hover:text-[#8A8A9A]"><X size={14} /></button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditingId(m.id); setEditVal(String(m.value)) }}
                        className="text-lg font-bold cursor-pointer hover:opacity-70 transition-opacity"
                        style={{ color: m.color }}>
                        {m.value.toLocaleString('pt-BR')} <span className="text-sm font-normal text-[#555566]">{m.unit}</span>
                      </button>
                    )}
                    <button onClick={() => setModal({ metric: m })} className="p-1.5 rounded-lg text-[#555566] hover:text-[#00E5C8] hover:bg-[rgba(0,229,200,0.08)] opacity-0 group-hover:opacity-100 transition-all">
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => setDeleteId(m.id)} className="p-1.5 rounded-lg text-[#555566] hover:text-[#FF5252] hover:bg-[rgba(255,82,82,0.12)] opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {metrics.length === 0 && (
            <div className="text-center py-12 text-[#555566]">Nenhuma métrica. Clique em "Nova métrica" para começar.</div>
          )}
        </div>

        {modal && <MetricModal initial={modal.metric} onSave={saveMetric} onClose={() => setModal(null)} />}
        {deleteId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDeleteId(null)}>
            <div className="bg-[#111118] rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <p className="font-semibold text-[#F0F0F5] mb-1">Apagar métrica?</p>
              <p className="text-sm text-[#8A8A9A] mb-4">Esta ação não pode ser desfeita.</p>
              <div className="flex gap-2">
                <button onClick={() => deleteMetric(deleteId)} className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-[#FF5252]">Apagar</button>
                <button onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-xl text-sm font-medium text-[#8A8A9A] hover:bg-[rgba(255,255,255,0.08)]">Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── MQL Ideal ─────────────────────────────────────────────────────────────

type MQLState = typeof mqlData

function MQLView({ mql, setMql }: { mql: MQLState; setMql: (fn: (prev: MQLState) => MQLState) => void }) {
  const [editMode, setEditMode] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newBehavior, setNewBehavior] = useState('')
  const [newIndustry, setNewIndustry] = useState('')

  function removeItem<K extends 'jobTitles' | 'behaviors' | 'industries'>(key: K, idx: number) {
    setMql((m) => ({ ...m, [key]: (m[key] as string[]).filter((_, i) => i !== idx) }))
  }

  function addItem(key: 'jobTitles' | 'behaviors' | 'industries', val: string) {
    if (!val.trim()) return
    setMql((m) => ({ ...m, [key]: [...(m[key] as string[]), val.trim()] }))
  }

  return (
    <div className="h-full overflow-auto p-5">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-[#F0F0F5]">Definição do MQL Ideal</h2>
            <p className="text-sm text-[#8A8A9A] mt-0.5">Critérios de qualificação e conversão</p>
          </div>
          <button onClick={() => setEditMode((e) => !e)} className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl transition-all"
            style={editMode ? { background: '#00C853', color: '#fff' } : { background: 'rgba(0,229,200,0.08)', color: '#00B39E' }}>
            {editMode ? <><Check size={15} /> Salvar</> : <><Edit2 size={15} /> Editar</>}
          </button>
        </div>

        {/* Editable stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          {[
            { label: 'MQLs este mês', key: 'monthlyMQLs' as keyof MQLState, color: '#00E5C8', suffix: '' },
            { label: 'Taxa MQL → SQL', key: 'mqlToSQLRate' as keyof MQLState, color: '#00C853', suffix: '%' },
            { label: 'Score mínimo', key: 'score' as keyof MQLState, color: '#FFB300', suffix: '/100' },
          ].map((kpi) => (
            <div key={kpi.key} className="bg-[#111118] rounded-xl p-4" style={{ border: '1.5px solid rgba(255,255,255,0.1)' }}>
              <p className="text-xs font-medium text-[#8A8A9A] mb-2">{kpi.label}</p>
              {editMode ? (
                <input type="number" value={mql[kpi.key] as number}
                  onChange={(e) => setMql((m) => ({ ...m, [kpi.key]: Number(e.target.value) }))}
                  className="text-2xl font-bold w-full focus:outline-none bg-transparent border-b-2 border-[rgba(0,229,200,0.3)]"
                  style={{ color: kpi.color }} />
              ) : (
                <div className="text-2xl font-bold" style={{ color: kpi.color }}>
                  {mql[kpi.key] as number}{kpi.suffix}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Job titles */}
          <div className="bg-[#111118] rounded-2xl p-5" style={{ border: '1.5px solid rgba(255,255,255,0.1)' }}>
            <h3 className="text-sm font-semibold text-[#F0F0F5] mb-3">Cargos-alvo</h3>
            <div className="flex flex-wrap gap-2">
              {mql.jobTitles.map((t, i) => (
                <span key={i} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium" style={{ background: 'rgba(0,229,200,0.08)', color: '#00B39E' }}>
                  {t}
                  {editMode && <button onClick={() => removeItem('jobTitles', i)} className="hover:opacity-70"><X size={10} /></button>}
                </span>
              ))}
            </div>
            {editMode && (
              <div className="flex gap-2 mt-3">
                <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Novo cargo..." className="flex-1 text-xs px-2 py-1.5 rounded-lg border border-[rgba(255,255,255,0.1)] focus:outline-none focus:border-[#00E5C8]"
                  onKeyDown={(e) => { if (e.key === 'Enter') { addItem('jobTitles', newTitle); setNewTitle('') } }} />
                <button onClick={() => { addItem('jobTitles', newTitle); setNewTitle('') }} className="text-xs px-2 py-1.5 rounded-lg bg-[rgba(0,229,200,0.15)] text-[#00E5C8]"><Plus size={12} /></button>
              </div>
            )}
          </div>

          {/* Industries */}
          <div className="bg-[#111118] rounded-2xl p-5" style={{ border: '1.5px solid rgba(255,255,255,0.1)' }}>
            <h3 className="text-sm font-semibold text-[#F0F0F5] mb-3">Segmentos</h3>
            <div className="flex flex-wrap gap-2">
              {mql.industries.map((ind, i) => (
                <span key={i} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium" style={{ background: 'rgba(0,200,83,0.15)', color: '#00C853' }}>
                  {ind}
                  {editMode && <button onClick={() => removeItem('industries', i)} className="hover:opacity-70"><X size={10} /></button>}
                </span>
              ))}
            </div>
            {editMode && (
              <div className="flex gap-2 mt-3">
                <input value={newIndustry} onChange={(e) => setNewIndustry(e.target.value)}
                  placeholder="Nova indústria..." className="flex-1 text-xs px-2 py-1.5 rounded-lg border border-[rgba(255,255,255,0.1)] focus:outline-none focus:border-[#00E5C8]"
                  onKeyDown={(e) => { if (e.key === 'Enter') { addItem('industries', newIndustry); setNewIndustry('') } }} />
                <button onClick={() => { addItem('industries', newIndustry); setNewIndustry('') }} className="text-xs px-2 py-1.5 rounded-lg bg-[rgba(0,200,83,0.15)] text-[#00C853]"><Plus size={12} /></button>
              </div>
            )}
          </div>

          {/* Company size */}
          <div className="bg-[#111118] rounded-2xl p-5" style={{ border: '1.5px solid rgba(255,255,255,0.1)' }}>
            <h3 className="text-sm font-semibold text-[#F0F0F5] mb-3">Tamanho da empresa</h3>
            {editMode ? (
              <input value={mql.companySize} onChange={(e) => setMql((m) => ({ ...m, companySize: e.target.value }))}
                className="w-full text-sm px-3 py-2 rounded-lg border border-[rgba(255,255,255,0.1)] focus:outline-none focus:border-[#00E5C8]" />
            ) : (
              <span className="text-sm px-3 py-1.5 rounded-full font-medium inline-block" style={{ background: 'rgba(255,179,0,0.15)', color: '#FFB300' }}>{mql.companySize}</span>
            )}
          </div>

          {/* Behaviors */}
          <div className="bg-[#111118] rounded-2xl p-5" style={{ border: '1.5px solid rgba(255,255,255,0.1)' }}>
            <h3 className="text-sm font-semibold text-[#F0F0F5] mb-3">Comportamentos qualificadores</h3>
            <div className="space-y-1.5">
              {mql.behaviors.map((beh, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded-lg" style={{ background: '#1A1A25' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00E5C8] flex-shrink-0" />
                    <span className="text-xs text-[#F0F0F5]">{beh}</span>
                  </div>
                  {editMode && <button onClick={() => removeItem('behaviors', i)} className="text-[#555566] hover:text-[#FF5252]"><X size={13} /></button>}
                </div>
              ))}
            </div>
            {editMode && (
              <div className="flex gap-2 mt-2">
                <input value={newBehavior} onChange={(e) => setNewBehavior(e.target.value)}
                  placeholder="Novo comportamento..." className="flex-1 text-xs px-2 py-1.5 rounded-lg border border-[rgba(255,255,255,0.1)] focus:outline-none focus:border-[#00E5C8]"
                  onKeyDown={(e) => { if (e.key === 'Enter') { addItem('behaviors', newBehavior); setNewBehavior('') } }} />
                <button onClick={() => { addItem('behaviors', newBehavior); setNewBehavior('') }} className="text-xs px-2 py-1.5 rounded-lg bg-[rgba(0,229,200,0.15)] text-[#00E5C8]"><Plus size={12} /></button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


// ─── Main ─────────────────────────────────────────────────────────────────

interface Props {
  channel: Channel
  setChannel: (c: Channel) => void
  posts: Post[]
}

export default function Metricas({ channel, setChannel, posts }: Props) {
  const [tab, setTab] = useState<Tab>('dashboard')
  const [metrics, setMetrics] = useState<CustomMetric[]>(defaultMetrics)
  const [mql, setMql] = useState(mqlData)

  return (
    <div className="flex flex-col h-full">
      <header className="bg-[#111118] flex-shrink-0" style={{ borderBottom: '1.5px solid rgba(255,255,255,0.1)' }}>
        <div className="px-4 md:px-6 pt-4 md:pt-5 pb-0">
          <h1 className="text-lg md:text-xl font-semibold text-[#F0F0F5] leading-tight">Métricas</h1>
          <p className="text-xs md:text-sm text-[#8A8A9A] mt-0.5">Dashboard consolidado · Julho 2026</p>
        </div>
        <div className="px-4 md:px-6 pt-2 md:pt-3 pb-0 overflow-x-auto">
          <TabNav active={tab} setTab={setTab} />
        </div>
      </header>
      <div className="flex-1 overflow-hidden">
        {tab === 'dashboard' && <Dashboard posts={posts} metrics={metrics} mql={mql} />}
        {tab === 'inserir' && <InsertMetrics metrics={metrics} setMetrics={setMetrics} />}
        {tab === 'mql' && <MQLView mql={mql} setMql={setMql} />}
      </div>
    </div>
  )
}
