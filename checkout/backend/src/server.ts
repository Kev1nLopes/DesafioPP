import Fastify from 'fastify'
import { CellShop } from './data/data.ts';

const app = Fastify()


app.register(import('./routes/routes.ts'));


if(process.env.CLUSTER !== 'true') {
    const { EventEmitter } = await import('node:events');

    const cellShop = new CellShop();
    const myEmitter = new EventEmitter();


}

app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server is running at ${address}`)
})