import 'dotenv/config'
import { z } from 'zod'

export const config = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('8h'),
  PORT: z.coerce.number().int().positive().default(3001),
  CORS_ORIGIN: z.string().default('http://localhost:8443'),
  GMAIL_CLIENT_ID: z.string().optional(),
  GMAIL_CLIENT_SECRET: z.string().optional(),
  GMAIL_REFRESH_TOKEN: z.string().optional(),
  GMAIL_SENDER: z.string().email().optional(),
  EMAIL_FROM_NAME: z.string().default('CITi HubSpot'),
  GOOGLE_OAUTH_REDIRECT_URI: z.string().default('http://localhost:3001/api/v1/google/callback'),
  FRONTEND_URL: z.string().default('http://localhost:5174'),
  RESET_CODE_TTL_MINUTES: z.coerce.number().int().positive().default(15),
  UPLOAD_DIR: z.string().default('uploads'),
  MAX_UPLOAD_MB: z.coerce.number().int().positive().default(20),
}).parse(process.env)
