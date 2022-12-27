import { AsyncLocalStorage } from 'node:async_hooks';

export const storage = new AsyncLocalStorage();

export function logWithId(msg) {
  const id = storage.getStore();
  console.log(JSON.stringify({ id: id ?? '-', msg }));
}