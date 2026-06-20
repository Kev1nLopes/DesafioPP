import Fastify from 'fastify'

const app = Fastify()

app.get('/', async () => {
  return { hello: 'world' }
})

app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server is running at ${address}`)
})