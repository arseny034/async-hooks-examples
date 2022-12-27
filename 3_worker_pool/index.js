import os from 'node:os';
import WorkerPool from './worker_pool/WorkerPool.js';
import WorkerPoolTask from './worker_pool/WorkerPoolTask.js';
import AsyncWorkerPoolTask from './worker_pool/AsyncWorkerPoolTask.js';
import { storage, logWithId } from '../2_request_id/storage.js';

// Replace AsyncWorkerPoolTask with WorkerPoolTask to see the difference
const pool = new WorkerPool(os.cpus().length, WorkerPoolTask);

let finished = 0;

for (let i = 0; i < 10; i++) {
  storage.run(i, () => {
    pool.runTask({ a: 42, b: 100 }, (err, result) => {
      logWithId(`counter=${i}; result=${result}`);
      if (++finished === 10)
        pool.close();
    });
  });
}