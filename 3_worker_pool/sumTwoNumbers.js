import { parentPort } from 'node:worker_threads';

parentPort.on('message', (input) => {
  parentPort.postMessage(input.a + input.b);
});