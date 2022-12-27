import async_hooks from 'node:async_hooks';

const traceMap = new Map();

const hook = async_hooks.createHook({
  init(asyncId, type, triggerAsyncId) {
    const parentStackTrace = traceMap.get(triggerAsyncId) ?? '';
    const currentStackTrace = {};
    Error.captureStackTrace(currentStackTrace);
    traceMap.set(asyncId, `[${type}] ${currentStackTrace.stack}\n${parentStackTrace}`);
  },
  destroy(asyncId) {
    traceMap.delete(asyncId);
  },
});

hook.enable();

export default function extendStacktrace(error) {
  error.stack += '\n' + traceMap.get(async_hooks.executionAsyncId()) ?? '';
  return error;
}