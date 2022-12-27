import { createConnection } from 'node:net';
import extendStacktrace from './extendStacktrace.js';

function connect() {
  const socket = createConnection(12345);
  socket.on('error', (err) => {
    console.error(extendStacktrace(err));
  });
}

connect();