import { EventEmitter } from 'node:events';
import { Worker } from 'node:worker_threads';

const kTaskInfo = Symbol('kTaskInfo');
const kWorkerFreedEvent = Symbol('kWorkerFreedEvent');

export default class WorkerPool extends EventEmitter {
  constructor(numThreads, taskClass) {
    super();

    this.numThreads = numThreads;
    this.taskClass = taskClass;
    this.workers = [];
    this.freeWorkers = [];
    this.tasks = [];

    for (let i = 0; i < numThreads; i++) {
      this.addNewWorker();
    }

    // Any time the kWorkerFreedEvent is emitted, dispatch
    // the next task pending in the queue, if any.
    this.on(kWorkerFreedEvent, () => {
      if (this.tasks.length > 0) {
        const { task, callback } = this.tasks.shift();
        this.runTask(task, callback);
      }
    });
  }

  addNewWorker() {
    const worker = new Worker(new URL('../sumTwoNumbers.js', import.meta.url));

    worker.on('message', (result) => {
      // In case of success: Call the callback that was passed to `runTask`,
      // remove the `TaskInfo` associated with the Worker, and mark it as free
      // again.
      worker[kTaskInfo].done(null, result);
      worker[kTaskInfo] = null;
      this.freeWorkers.push(worker);
      this.emit(kWorkerFreedEvent);
    });

    worker.on('error', (err) => {
      // In case of an uncaught exception: Call the callback that was passed to
      // `runTask` with the error.
      if (worker[kTaskInfo]) {
        worker[kTaskInfo].done(err, null);
      }
      else {
        this.emit('error', err);
      }

      // Remove the worker from the list and start a new Worker to replace the
      // current one.
      this.workers.splice(this.workers.indexOf(worker), 1);
      this.addNewWorker();
    });

    this.workers.push(worker);
    this.freeWorkers.push(worker);
    this.emit(kWorkerFreedEvent);
  }

  runTask(input, callback) {
    if (this.freeWorkers.length === 0) {
      // No free threads, wait until a worker thread becomes free.
      this.tasks.push({ task: input, callback });
      return;
    }

    const worker = this.freeWorkers.pop();
    worker[kTaskInfo] = new this.taskClass(callback);
    worker.postMessage(input);
  }

  close() {
    for (const worker of this.workers) {
      worker.terminate();
    }
  }
}