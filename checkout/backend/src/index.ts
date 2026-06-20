import cluster from 'node:cluster';
import { availableParallelism } from 'node:os';
import { CellShop } from './data/data.ts';


const numCPUs = availableParallelism();

if (cluster.isPrimary && process.env.CLUSTER === 'true') {
  const cellShop = new CellShop();
  // Aqui eu uso o ipc para alterar a memoria apenas no processo master
  // Processo filhos se comunicam com o pai e o pai atualiza a memoria compartilhada, e depois envia para os filhos a nova memoria compartilhada. Assim lidando com a concorrencia
  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
    import ('./server.js')
      // Aqui eu uso o eventEmiiter para construir uma aplicação baseada em eventos, onde o processo filho pode emitir eventos para o processo master, e o processo master pode ouvir esses eventos e atualizar a memória compartilhada.
      // Em caso de o cluster estiver desaivado, a memória sera apenas em 1 processo.

    
}