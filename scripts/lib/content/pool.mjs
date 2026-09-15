import os from 'node:os';
import path from 'node:path';
import { Worker } from 'node:worker_threads';

import { ROOT } from './paths.mjs';

const WORKER_PATH = path.join(ROOT, 'scripts/lib/content/compile-worker.mjs');

export function resolveWorkerCount(requested) {
  const cpus = os.availableParallelism?.() ?? os.cpus().length ?? 2;
  const fallback = Math.min(4, Math.max(2, cpus - 1));
  const count = Number.isFinite(requested) && requested > 0 ? Math.floor(requested) : fallback;
  return Math.max(1, Math.min(8, count));
}

// Bounded worker pool: at most `workerCount` markdown compiles run at once, so
// peak memory stays flat no matter how many posts are queued.
export async function runCompileJobs(jobs, { workerCount, onResult }) {
  if (jobs.length === 0) return;

  const size = Math.min(resolveWorkerCount(workerCount), jobs.length);
  const workers = [];
  let dispatched = 0;
  let inFlight = 0;
  let failure = null;
  let done = false;

  await new Promise((resolve, reject) => {
    const finish = () => {
      if (done) return;
      done = true;
      Promise.all(workers.map((worker) => worker.terminate())).then(() => {
        if (failure) reject(failure);
        else resolve();
      }, reject);
    };

    const pump = (worker) => {
      if (!failure && dispatched < jobs.length) {
        worker.postMessage({ ...jobs[dispatched], id: dispatched });
        dispatched += 1;
        inFlight += 1;
        return;
      }

      if (inFlight === 0) finish();
    };

    for (let i = 0; i < size; i += 1) {
      const worker = new Worker(WORKER_PATH);
      workers.push(worker);

      worker.on('message', (result) => {
        inFlight -= 1;

        if (result.ok) {
          onResult(jobs[result.id], result.data);
        } else {
          failure = failure ?? new Error(`Failed to compile ${jobs[result.id].filePath}\n${result.error}`);
        }

        pump(worker);
      });

      worker.on('error', (error) => {
        failure = failure ?? error;
        finish();
      });
    }

    for (const worker of workers) pump(worker);
  });
}
