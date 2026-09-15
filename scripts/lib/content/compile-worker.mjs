import fs from 'node:fs/promises';
import { parentPort } from 'node:worker_threads';

import { artifactHtmlPath, artifactJsonPath } from './paths.mjs';
import { compilePostFile } from './markdown.mjs';

if (!parentPort) {
  throw new Error('compile-worker must be run as a worker thread');
}

parentPort.on('message', async (job) => {
  if (job.type === 'shutdown') {
    parentPort.close();
    return;
  }

  try {
    const { html, toc } = await compilePostFile(job.filePath);

    await Promise.all([
      fs.writeFile(artifactHtmlPath(job.artifact), html, 'utf8'),
      fs.writeFile(
        artifactJsonPath(job.artifact),
        JSON.stringify({ slug: job.slug, toc }),
        'utf8'
      )
    ]);

    parentPort.postMessage({ ok: true, id: job.id });
  } catch (error) {
    parentPort.postMessage({ ok: false, id: job.id, error: String(error?.stack || error) });
  }
});
