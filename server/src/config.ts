import 'dotenv/config'
import { z } from 'zod'

export const config = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('8h'),
  PORT: z.coerce.number().int().positive().default(3001),
  CORS_ORIGIN: z.string().default('http://localhost:8443'),
  SENDGRID_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().default('no-reply@marketops.local'),
  EMAIL_FROM_NAME: z.string().default('CITi MarketOps'),
  RESET_CODE_TTL_MINUTES: z.coerce.number().int().positive().default(15),
  UPLOAD_DIR: z.string().default('uploads'),
  MAX_UPLOAD_MB: z.coerce.number().int().positive().default(20),
}).parse(process.env)
