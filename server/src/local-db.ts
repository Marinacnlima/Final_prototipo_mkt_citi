import EmbeddedPostgres from 'embedded-postgres'

const database = new EmbeddedPostgres({
  databaseDir: '.marketops-db',
  user: 'marketops',
  password: 'marketops',
  port: 5432,
  persistent: true,
  initdbFlags: ['--locale=C', '--encoding=UTF8'],
  onLog: () => undefined,
})

async function stop() {
  await database.stop().catch(() => undefined)
  process.exit(0)
}

process.once('SIGINT', stop)
process.once('SIGTERM', stop)

async function main() {
  await database.initialise()
  await database.start()
  await database.createDatabase('marketops').catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error)
    if (!message.toLowerCase().includes('already exists')) throw error
  })
  console.log('PostgreSQL local pronto em 127.0.0.1:5432')
  await new Promise(() => undefined)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
