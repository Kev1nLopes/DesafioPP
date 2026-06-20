import { EventEmitter } from 'node:events';

export const myEmitter: EventEmitter | null =
  process.env.CLUSTER !== 'true' ? new EventEmitter() : null;


  