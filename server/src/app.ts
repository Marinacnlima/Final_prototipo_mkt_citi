import express from 'express'
import cors from 'cors'
import path from 'node:path'
import { config } from './config.js'
import { errorHandler } from './http.js'
import { authRouter, usersRouter } from './routes/auth-users.js'
import { kanbanRouter, calendarRouter } from './routes/kanban-calendar.js'
import { campaignsRouter, engagementRouter } from './routes/campaigns-engagement.js'
import { libraryRouter } from './routes/library.js'
import { metricsRouter } from './routes/metrics.js'
import { googleRouter } from './routes/google-accounts.js'

export const app=express()
app.disable('x-powered-by')
app.use(cors({origin:config.CORS_ORIGIN.split(',').map((origin)=>origin.trim()),credentials:false}))
app.use(express.json({limit:'2mb'}))
app.get('/health',(_req,res)=>res.json({ok:true}))
app.use(`/${config.UPLOAD_DIR}`,express.static(path.resolve(process.cwd(),config.UPLOAD_DIR)))
app.use('/api/v1/auth',authRouter)
app.use('/api/v1/users',usersRouter)
app.use('/api/v1/kanban',kanbanRouter)
app.use('/api/v1/calendar',calendarRouter)
app.use('/api/v1/campaigns',campaignsRouter)
app.use('/api/v1/engagement',engagementRouter)
app.use('/api/v1/library',libraryRouter)
app.use('/api/v1/metrics',metricsRouter)
app.use('/api/v1/google',googleRouter)
app.use((_req,res)=>res.status(404).json({error:{code:'NOT_FOUND',message:'Rota não encontrada'}}))
app.use(errorHandler)
