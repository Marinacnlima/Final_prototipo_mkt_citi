import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import multer from 'multer'
import type { Request } from 'express'
import { config } from './config.js'
import { ApiError } from './http.js'

const MATERIAL_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
])

function storage(subdir: string) {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      const dir = path.resolve(process.cwd(), config.UPLOAD_DIR, subdir)
      fs.mkdirSync(dir, { recursive: true })
      cb(null, dir)
    },
    filename: (_req, file, cb) => cb(null, `${crypto.randomUUID()}${path.extname(file.originalname)}`),
  })
}

export const materialUpload = multer({
  storage: storage('materials'),
  limits: { fileSize: config.MAX_UPLOAD_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!MATERIAL_MIME_TYPES.has(file.mimetype)) return cb(new ApiError(415, 'UNSUPPORTED_FILE_TYPE', 'Tipo de arquivo não suportado. Envie PDF, DOC, DOCX, PPT, PPTX, XLS ou XLSX.'))
    cb(null, true)
  },
})

export const mediaUpload = multer({
  storage: storage('posts'),
  limits: { fileSize: config.MAX_UPLOAD_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!/^(image|video)\//.test(file.mimetype)) return cb(new ApiError(415, 'UNSUPPORTED_FILE_TYPE', 'Tipo de arquivo não suportado. Envie uma imagem ou um vídeo.'))
    cb(null, true)
  },
})

export const mediaTipoFromMime = (mimetype: string): 'IMAGEM' | 'VIDEO' => mimetype.startsWith('video/') ? 'VIDEO' : 'IMAGEM'
export const publicFileUrl = (req: Request, subdir: string, filename: string) => `${req.protocol}://${req.get('host')}/${config.UPLOAD_DIR}/${subdir}/${filename}`
