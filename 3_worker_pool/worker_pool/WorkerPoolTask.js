export default class WorkerPoolTask {
  constructor(callback) {
    this.callback = callback;
  }

  done(err, result) {
    this.callback(err, result);
  }
}