import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('a origem local permitida usa a porta real da aplicação', async () => {
  const env = await read('.env.example')
  assert.match(env, /CORS_ORIGIN="?http:\/\/localhost:8443"?/)
  assert.doesNotMatch(env, /localhost:5174/)
})

test('as métricas globais persistem os dados de audiência', async () => {
  const [schema, route] = await Promise.all([read('prisma/schema.prisma'), read('server/src/routes/metrics.ts')])
  assert.match(schema, /audienceData\s+Json\?/)
  assert.match(route, /audienceData/)
})

test('o dashboard não contém os valores demonstrativos mapeados', async () => {
  const metrics = await read('src/pages/Metricas.tsx')
  for (const fakeValue of ['28400', 'Julho 2026', 'Como aumentar conversão B2B', "['17%'", '>62<span', '>48<span']) {
    assert.ok(!metrics.includes(fakeValue), `valor demonstrativo ainda presente: ${fakeValue}`)
  }
})

test('operações remotas de posts não rodam dentro do atualizador de estado', async () => {
  const app = await read('src/App.tsx')
  assert.match(app, /const next=update\(previous\)/)
  assert.doesNotMatch(app, /setPostsState\(\(previous\)=>\{[\s\S]*?api\.posts/)
})

test('configuração do Vite usa APIs atuais do Node e import attributes', async () => {
  const vite = await read('vite.config.ts')
  assert.match(vite, /with \{ type: 'json' \}/)
  assert.match(vite, /import\.meta\.dirname/)
  assert.doesNotMatch(vite, /__dirname/)
})
