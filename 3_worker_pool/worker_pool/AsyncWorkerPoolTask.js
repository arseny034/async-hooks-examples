import { AsyncResource } from 'node:async_hooks';

export default class AsyncWorkerPoolTask extends AsyncResource {
  constructor(callback) {
    super('AsyncWorkerPoolTask');
    this.callback = callback;
  }

  done(err, result) {
    this.runInAsyncScope(this.callback, null, err, result);
    this.emitDestroy();  // `TaskInfo`s are used only once.
  }
}