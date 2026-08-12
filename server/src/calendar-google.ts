import { google } from 'googleapis'
import { config } from './config.js'

const googleReady = Boolean(config.GMAIL_CLIENT_ID && config.GMAIL_CLIENT_SECRET && config.GMAIL_REFRESH_TOKEN)

const oauth2Client = new google.auth.OAuth2(config.GMAIL_CLIENT_ID, config.GMAIL_CLIENT_SECRET)
if (googleReady) oauth2Client.setCredentials({ refresh_token: config.GMAIL_REFRESH_TOKEN })
const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

const TIME_ZONE = 'America/Sao_Paulo'

function addMinutes(hhmm: string, minutes: number): string {
  const [h, m] = hhmm.split(':').map(Number)
  const total = (h * 60 + m + minutes + 1440) % 1440
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

interface GoogleEventInput {
  titulo: string
  dataISO: string // YYYY-MM-DD
  horario: string // HH:MM
  horarioFim?: string | null
  attendeeEmails: string[]
}

function toRequestBody(input: GoogleEventInput) {
  const endTime = input.horarioFim ?? addMinutes(input.horario, 30)
  return {
    summary: input.titulo,
    start: { dateTime: `${input.dataISO}T${input.horario}:00`, timeZone: TIME_ZONE },
    end: { dateTime: `${input.dataISO}T${endTime}:00`, timeZone: TIME_ZONE },
    attendees: input.attendeeEmails.map((email) => ({ email })),
  }
}

export async function createGoogleEvent(input: GoogleEventInput): Promise<string | null> {
  if (!googleReady) return null
  try {
    const res = await calendar.events.insert({ calendarId: 'primary', sendUpdates: 'all', requestBody: toRequestBody(input) })
    return res.data.id ?? null
  } catch (error) {
    console.error('[calendar-google] Falha ao criar evento no Google Calendar:', error instanceof Error ? error.message : error)
    return null
  }
}

export async function updateGoogleEvent(googleEventId: string, input: GoogleEventInput): Promise<void> {
  if (!googleReady) return
  try {
    await calendar.events.update({ calendarId: 'primary', eventId: googleEventId, sendUpdates: 'all', requestBody: toRequestBody(input) })
  } catch (error) {
    console.error('[calendar-google] Falha ao atualizar evento no Google Calendar:', error instanceof Error ? error.message : error)
  }
}

export async function deleteGoogleEvent(googleEventId: string): Promise<void> {
  if (!googleReady) return
  try {
    await calendar.events.delete({ calendarId: 'primary', eventId: googleEventId, sendUpdates: 'all' })
  } catch (error) {
    console.error('[calendar-google] Falha ao apagar evento no Google Calendar:', error instanceof Error ? error.message : error)
  }
}
