import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../prisma.js'
import { ApiError, asyncRoute } from '../http.js'
import { authenticate, managerOnly } from '../auth.js'

const campaignBodyBase = z.object({ nome: z.string().trim().min(1), status: z.enum(['ATIVA','PLANEJADA','ENCERRADA']), objetivo: z.string().trim().min(1), publico: z.string().trim().min(1), dataInicio: z.coerce.date(), dataFim: z.coerce.date(), alcanceMeta: z.number().int().min(0), interacoesMeta: z.number().int().min(0), canais: z.array(z.enum(['INSTAGRAM','LINKEDIN','SITE','EMAIL'])).min(1) })
// .partial() não é suportado em schemas com .refine() (Zod v4) — o PATCH usa campaignBodyBase.partial() e valida a ordem das datas manualmente após o parse
const campaignBody = campaignBodyBase.refine((value) => value.dataFim >= value.dataInicio, { message: 'dataFim deve ser posterior à dataInicio' })
const campaignInclude = { canais: true, metricasDiarias: { orderBy: { data: 'asc' as const } } } as const
const serializeCampaign = (campaign: any) => {
  const alcanceAtual = campaign.metricasDiarias.reduce((sum: number, metric: any) => sum + metric.alcance, 0)
  const interacoesAtual = campaign.metricasDiarias.reduce((sum: number, metric: any) => sum + metric.interacoes, 0)
  const end = Math.min(Date.now(), new Date(campaign.dataFim).getTime())
  return { ...campaign, canais: campaign.canais.map((entry: any) => entry.canal), alcanceAtual, interacoesAtual, progressoAlcance: campaign.alcanceMeta ? Math.min(1, alcanceAtual / campaign.alcanceMeta) : 0, progressoInteracoes: campaign.interacoesMeta ? Math.min(1, interacoesAtual / campaign.interacoesMeta) : 0, diasNoAr: Math.max(0, Math.floor((end - new Date(campaign.dataInicio).getTime()) / 86400000)), totalRegistrosMetricas: campaign.metricasDiarias.length }
}

export const campaignsRouter = Router(); campaignsRouter.use(authenticate)
campaignsRouter.get('/', asyncRoute(async (req, res) => {
  const q = z.object({ ordenar: z.enum(['alcance','interacao']).optional(), canal: z.enum(['INSTAGRAM','LINKEDIN','SITE','EMAIL']).optional() }).parse(req.query)
  let rows = (await prisma.campaign.findMany({ where: q.canal ? { canais: { some: { canal: q.canal } } } : {}, include: campaignInclude, orderBy: { dataInicio: 'desc' } })).map(serializeCampaign)
  if (q.ordenar === 'alcance') rows.sort((a,b) => b.alcanceAtual-a.alcanceAtual); if (q.ordenar === 'interacao') rows.sort((a,b) => b.interacoesAtual-a.interacoesAtual)
  res.json(rows)
}))
campaignsRouter.post('/', asyncRoute(async (req, res) => { const body=campaignBody.parse(req.body); const {canais,...data}=body; const row=await prisma.campaign.create({data:{...data,canais:{create:canais.map((canal)=>({canal}))}},include:campaignInclude}); res.status(201).json(serializeCampaign(row)) }))
campaignsRouter.patch('/:id', asyncRoute(async (req,res)=>{ const current=await prisma.campaign.findUnique({where:{id:String(req.params.id)}}); if(!current) throw new ApiError(404,'NOT_FOUND'); const body=campaignBodyBase.partial().parse(req.body); const dataInicio=body.dataInicio??current.dataInicio; const dataFim=body.dataFim??current.dataFim; if(dataFim<dataInicio) throw new ApiError(422,'INVALID_DATE_RANGE','dataFim deve ser posterior à dataInicio'); const {canais,...data}=body; const row=await prisma.$transaction(async(tx)=>{if(canais){await tx.campaignChannel.deleteMany({where:{campaignId:String(req.params.id)}});await tx.campaignChannel.createMany({data:canais.map((canal)=>({campaignId:String(req.params.id),canal}))})}return tx.campaign.update({where:{id:String(req.params.id)},data,include:campaignInclude})});res.json(serializeCampaign(row)) }))
campaignsRouter.delete('/:id',asyncRoute(async(req,res)=>{await prisma.campaign.delete({where:{id:String(req.params.id)}});res.status(204).send()}))
campaignsRouter.get('/:id/metrics',asyncRoute(async(req,res)=>res.json(await prisma.campaignDailyMetric.findMany({where:{campaignId:String(req.params.id)},orderBy:{data:'asc'}}))))
campaignsRouter.post('/:id/metrics',asyncRoute(async(req,res)=>{if(!await prisma.campaign.findUnique({where:{id:String(req.params.id)}}))throw new ApiError(404,'NOT_FOUND');const body=z.object({data:z.coerce.date(),alcance:z.number().int().min(0),interacoes:z.number().int().min(0)}).parse(req.body);const metric=await prisma.campaignDailyMetric.upsert({where:{campaignId_data:{campaignId:String(req.params.id),data:body.data}},create:{campaignId:String(req.params.id),...body},update:{alcance:body.alcance,interacoes:body.interacoes}});res.status(201).json(metric)}))
campaignsRouter.delete('/:id/metrics/:metricId',asyncRoute(async(req,res)=>{await prisma.campaignDailyMetric.delete({where:{id:String(req.params.metricId)}});res.status(204).send()}))

export const engagementRouter = Router(); engagementRouter.use(authenticate,managerOnly)
const monthBounds=(period:string)=>{if(!/^\d{4}-\d{2}$/.test(period))throw new ApiError(422,'INVALID_PERIOD');const start=new Date(`${period}-01T00:00:00.000Z`);const end=new Date(Date.UTC(start.getUTCFullYear(),start.getUTCMonth()+1,1));return{start,end}}
engagementRouter.get('/',asyncRoute(async(req,res)=>{const period=z.string().default(new Date().toISOString().slice(0,7)).parse(req.query.periodo);const {start,end}=monthBounds(period);const users=await prisma.user.findMany({where:{ativo:true,perfil:'ANALISTA'},include:{engajamentos:{where:{periodo:period}},atribuicoes:{where:{task:{OR:[{dataEntrega:{gte:start,lt:end}},{dataEntrega:null,createdAt:{gte:start,lt:end}}]}},include:{task:{include:{coluna:true}}}}}});const membros=users.map((user)=>{const manual=user.engajamentos[0];const graded=user.atribuicoes.map((a)=>a.nota).filter((n):n is number=>n!==null);return{userId:user.id,nome:user.nomeCompleto,cargo:user.cargo,compromisso:manual?.compromisso??null,presenca:manual?.presenca??null,observacoes:manual?.observacoes??null,qualidade:graded.length?Math.round(graded.reduce((a,b)=>a+b,0)/graded.length*10)/10:null,tasksTotal:user.atribuicoes.length,tasksConcluidas:user.atribuicoes.filter((a)=>a.task.coluna.isDone).length}});const average=(key:'compromisso'|'presenca'|'qualidade')=>{const values=membros.map((m)=>m[key]).filter((v):v is number=>v!==null);return values.length?Math.round(values.reduce((a,b)=>a+b,0)/values.length*10)/10:null};res.json({periodo:period,medias:{compromisso:average('compromisso'),qualidade:average('qualidade'),presenca:average('presenca')},membros})}))
engagementRouter.put('/:userId',asyncRoute(async(req,res)=>{const periodo=z.string().parse(req.query.periodo);monthBounds(periodo);const body=z.object({compromisso:z.number().min(0).max(5).nullable().optional(),presenca:z.number().min(0).max(5).nullable().optional(),observacoes:z.string().nullable().optional()}).parse(req.body);res.json(await prisma.teamEngagement.upsert({where:{userId_periodo:{userId:String(req.params.userId),periodo}},create:{userId:String(req.params.userId),periodo,...body},update:body}))}))
