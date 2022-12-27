import { createServer } from 'node:http';
import { storage, logWithId } from './storage.js';

let reqId = 0;

const server = createServer((req, res) => {
  storage.run(reqId++, () => {
    logWithId('start');

    setImmediate(() => {
      logWithId('finish');
      res.end();
    });
  });
});

server.listen(8080);