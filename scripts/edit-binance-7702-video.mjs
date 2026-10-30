import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { constants, createReadStream } from 'node:fs';
import fs from 'node:fs/promises';
import { createServer } from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = path.join(ROOT, 'docs');
const HTML = path.join(DOCS, 'binance-7702-video.html');
const CURRENT = path.join(DOCS, 'binance-7702-video.mp4');
const ORIGINAL = path.join(DOCS, 'binance-7702-video.original-290s.mp4');
const OUTPUT = path.join(DOCS, 'binance-7702-video.1.2x.mp4');
const WIDTH = 1920;
const HEIGHT = 1080;
const STRIP = 112;
const INPUT_FRAMES = 8700;
const OUTPUT_FRAMES = 7250;
const SECONDS = OUTPUT_FRAMES / 30;
const SAMPLES = 11600000;
const FFMPEG = process.env.FFMPEG || '/opt/homebrew/bin/ffmpeg';
const FFPROBE = process.env.FFPROBE || '/opt/homebrew/bin/ffprobe';
const MODULE = process.env.PLAYWRIGHT_MODULE || path.join(os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
const CHROMIUM = process.env.CHROMIUM_EXECUTABLE || path.join(os.homedir(), 'Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell');
const TIMES = [0, 27.9, 28.1, 77.9, 130.1, 139.4, 171.9, 212.1, 269.9, 289.9];
const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
const json = (value) => JSON.stringify(value, null, 2) + '\n';
const exists = (file) => fs.access(file).then(() => true, () => false);
const children = new Set();
let stopped = false;

function options(argv) {
  const opts = { checkOnly: false, overwrite: false, workers: 4, help: false, reuseStrips: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--check-only') opts.checkOnly = true;
    else if (argv[i] === '--overwrite') opts.overwrite = true;
    else if (argv[i] === '--help') opts.help = true;
    else if (argv[i] === '--workers') opts.workers = Number(argv[++i]);
    else if (argv[i] === '--reuse-strips') { assert(argv[i + 1], '--reuse-strips requires a prior run directory'); opts.reuseStrips = path.resolve(argv[++i]); }
    else throw new Error(`Unknown argument: ${argv[i]}`);
  }
  assert(Number.isInteger(opts.workers) && opts.workers >= 1 && opts.workers <= 4, '--workers must be 1–4');
  return opts;
}

function command(bin, args, logfile) {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] });
    children.add(child);
    const stdout = [];
    const stderr = [];
    const timer = setTimeout(() => child.kill('SIGTERM'), 30 * 60_000);
    child.stdout.on('data', (chunk) => stdout.push(chunk));
    child.stderr.on('data', (chunk) => stderr.push(chunk));
    child.on('error', (error) => { clearTimeout(timer); children.delete(child); reject(error); });
    child.on('close', async (code, signal) => {
      clearTimeout(timer);
      children.delete(child);
      const out = Buffer.concat(stdout).toString();
      const err = Buffer.concat(stderr).toString();
      try {
        if (logfile) await fs.writeFile(logfile, json({ bin, args }) + out + '\n' + err);
        if (code !== 0) throw new Error(`${bin} failed (${code ?? signal}): ${err.slice(-3000)}`);
        resolve(out);
      } catch (error) { reject(error); }
    });
  });
}

async function probe(file) {
  return JSON.parse(await command(FFPROBE, ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', file]));
}

async function serveDocs() {
  const base = await fs.realpath(DOCS);
  const assets = new Map();
  const types = { '.html': 'text/html; charset=utf-8', '.jpg': 'image/jpeg', '.png': 'image/png' };
  const server = createServer(async (request, response) => {
    try {
      if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405).end(); return; }
      const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
      if (pathname === '/favicon.ico') { response.writeHead(204).end(); return; }
      if (pathname.split('/').some((part) => part.startsWith('.'))) { response.writeHead(404).end(); return; }
      const file = await fs.realpath(path.join(base, pathname));
      if (!file.startsWith(base + path.sep) || !types[path.extname(file)]) { response.writeHead(404).end(); return; }
      const bytes = await fs.readFile(file);
      const hash = digest(bytes);
      if (assets.has(file)) assert.equal(assets.get(file), hash, `Asset changed: ${file}`);
      assets.set(file, hash);
      response.writeHead(200, { 'Content-Type': types[path.extname(file)], 'Content-Length': bytes.length, 'Cache-Control': 'no-store' });
      if (request.method === 'HEAD') response.end();
      else createReadStream(file).on('error', () => response.destroy()).pipe(response);
    } catch { response.writeHead(404).end(); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  return { server, assets, url: `http://127.0.0.1:${server.address().port}/binance-7702-video.html?record=1` };
}

async function loadPage(browser, url, errors) {
  const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1, reducedMotion: 'no-preference', colorScheme: 'dark' });
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((image) => image.decode()));
    const stage = document.querySelector('#stage').getBoundingClientRect();
    if (stage.width !== 1920 || stage.height !== 1080 || devicePixelRatio !== 1) throw new Error('Unexpected recording geometry');
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) throw new Error('Reduced motion is enabled');
    if (document.querySelector('.scene-art figcaption')) throw new Error('A visible AI caption remains');
    if ([...document.querySelectorAll('.scene-art img')].some((image) => getComputedStyle(image).clipPath === 'none')) throw new Error('Artwork corner mask is missing');
  });
  return page;
}

async function screenshot(page, seconds, file, full = false) {
  assert(!stopped, 'Interrupted');
  await page.evaluate((t) => window.__renderAt(t), seconds);
  return page.screenshot({ path: file, type: 'png', animations: 'allow', caret: 'hide', scale: 'css', clip: { x: 0, y: 0, width: WIDTH, height: full ? HEIGHT : STRIP } });
}

async function validate(file, run) {
  const data = await probe(file);
  const video = data.streams.find((stream) => stream.codec_type === 'video');
  const audio = data.streams.find((stream) => stream.codec_type === 'audio');
  assert.equal(data.streams.length, 2);
  assert.deepEqual([video.width, video.height, video.avg_frame_rate, Number(video.nb_frames)], [WIDTH, HEIGHT, '30/1', OUTPUT_FRAMES]);
  assert.equal(video.codec_name, 'h264');
  assert.equal(video.pix_fmt, 'yuv420p');
  assert(Math.abs(Number(video.duration) - SECONDS) < 0.00001);
  assert.equal(audio.codec_name, 'aac');
  assert.deepEqual([audio.sample_rate, audio.channels], ['48000', 2]);
  assert(Math.abs(Number(audio.duration) - SECONDS) < 1 / 48000 + 0.000001);
  assert(Math.abs(Number(data.format.duration) - SECONDS) < 0.05);
  const frames = JSON.parse(await command(FFPROBE, ['-v', 'error', '-select_streams', 'v:0', '-show_frames', '-show_entries', 'frame=pts,duration', '-of', 'json', file]));
  assert.equal(frames.frames.length, OUTPUT_FRAMES);
  const [num, den] = video.time_base.split('/').map(BigInt);
  for (const [i, frame] of frames.frames.entries()) {
    assert.equal(BigInt(frame.pts) * num * 30n, BigInt(i) * den, `PTS at ${i}`);
    assert.equal(BigInt(frame.duration) * num * 30n, den, `Frame duration at ${i}`);
  }
  await command(FFMPEG, ['-v', 'error', '-xerror', '-i', file, '-map', '0:v:0', '-map', '0:a:0', '-f', 'null', '-'], path.join(run, 'decode.log'));
  await fs.writeFile(path.join(run, 'ffprobe.json'), json(data));
  await fs.writeFile(path.join(run, 'frame-pts.json'), json(frames));
  return { width: WIDTH, height: HEIGHT, frames: OUTPUT_FRAMES, fps: '30/1', videoSeconds: video.duration, audioSeconds: audio.duration, containerSeconds: data.format.duration, audioPitchPreserved: true, continuousPTS: true, fullDecodePassed: true };
}

async function main() {
  const opts = options(process.argv.slice(2));
  if (opts.help) { console.log('node scripts/edit-binance-7702-video.mjs [--check-only] [--workers 1-4] [--overwrite] [--reuse-strips prior-run-directory]\nCreates a clean 1.2x edit, preserving original-290s.mp4. Captures only the top 112 pixels; all 8700 source timestamps are preserved until synchronized retiming. Reuse requires matching HTML/source hashes and all 8700 strips.'); return; }
  assert(opts.checkOnly || opts.overwrite || !await exists(OUTPUT), 'Edited output exists; use --overwrite');
  const input = await exists(ORIGINAL) ? ORIGINAL : CURRENT;
  const source = await probe(input);
  const video = source.streams.find((stream) => stream.codec_type === 'video');
  assert.deepEqual([video.width, video.height, video.avg_frame_rate, Number(video.nb_frames), Number(video.duration)], [WIDTH, HEIGHT, '30/1', INPUT_FRAMES, 290]);
  assert(source.streams.some((stream) => stream.codec_type === 'audio'), 'Narrated source has no audio');
  const run = await fs.mkdtemp(path.join(os.tmpdir(), 'binance-7702-edit-'));
  const candidate = path.join(DOCS, `.binance-7702-edit-${randomUUID()}.mp4`);
  const manifest = { status: 'running', runDir: run, startedAt: new Date().toISOString(), input, inputSHA256: digest(await fs.readFile(input)), htmlSHA256: digest(await fs.readFile(HTML)), speed: '6/5', audioFilter: 'atempo=1.2', inputFrames: INPUT_FRAMES, outputFrames: OUTPUT_FRAMES, patch: { x: 0, y: 0, width: WIDTH, height: STRIP, inputTime: 'i / 30' }, checkOnly: opts.checkOnly };
  console.log(json({ runDir: run, checkOnly: opts.checkOnly }));
  let browser;
  let serving;
  const errors = [];
  const stop = () => { stopped = true; for (const child of children) child.kill('SIGTERM'); void browser?.close(); };
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
  try {
    const api = await import(pathToFileURL(MODULE).href);
    await fs.access(CHROMIUM);
    browser = await api.chromium.launch({ executablePath: CHROMIUM, headless: true, args: ['--force-color-profile=srgb'] });
    serving = await serveDocs();
    const page = await loadPage(browser, serving.url, errors);
    manifest.qc = [];
    for (const t of TIMES) {
      const file = path.join(run, `clean-${t.toFixed(3)}.png`);
      const bytes = await screenshot(page, t, file, true);
      if (t === 139.4) assert.equal(await page.locator('#gapTimer').innerText(), '3:24');
      const first = digest(await screenshot(page, t));
      await screenshot(page, 0);
      assert.equal(digest(await screenshot(page, t)), first, `Top strip is nondeterministic at ${t}`);
      manifest.qc.push({ sourceTime: t, outputFrame: Math.round(t * 25), outputTime: Math.round(t * 25) / 30, cleanFrame: file, sha256: digest(bytes) });
    }
    await page.close();
    if (!opts.checkOnly) {
      const strips = path.join(opts.reuseStrips || run, 'strips');
      if (opts.reuseStrips) {
        const previous = JSON.parse(await fs.readFile(path.join(opts.reuseStrips, 'edit-manifest.json'), 'utf8'));
        assert.equal(previous.htmlSHA256, manifest.htmlSHA256, 'Reused strips have different HTML');
        assert.equal(previous.inputSHA256, manifest.inputSHA256, 'Reused strips have different source video');
        assert.deepEqual(previous.patch, manifest.patch, 'Reused strips have a different geometry/clock');
        manifest.reusedCapture = { runDir: opts.reuseStrips, manifestSHA256: digest(await fs.readFile(path.join(opts.reuseStrips, 'edit-manifest.json'))) };
      } else {
      await fs.mkdir(strips);
      let count = 0;
      await Promise.all(Array.from({ length: opts.workers }, async (_, worker) => {
        const page = await loadPage(browser, serving.url, errors);
        try {
          const begin = Math.floor(worker * INPUT_FRAMES / opts.workers);
          const end = Math.floor((worker + 1) * INPUT_FRAMES / opts.workers);
          for (let i = begin; i < end; i++) {
            await screenshot(page, i / 30, path.join(strips, `${String(i).padStart(5, '0')}.png`));
            if (++count % 600 === 0 || count === INPUT_FRAMES) console.log(`top strips ${count}/${INPUT_FRAMES}`);
          }
        } finally { await page.close(); }
      }));
      }
      const stripFiles = (await fs.readdir(strips)).sort();
      assert.deepEqual(stripFiles, Array.from({ length: INPUT_FRAMES }, (_, i) => `${String(i).padStart(5, '0')}.png`));
      assert.equal(digest(await fs.readFile(HTML)), manifest.htmlSHA256, 'HTML changed during capture');
      assert.deepEqual(errors, []);
      for (const [file, hash] of serving.assets) assert.equal(digest(await fs.readFile(file)), hash, `Asset changed: ${file}`);
      const filters = '[0:v]setpts=PTS-STARTPTS[base];[1:v]setpts=PTS-STARTPTS[strip];[base][strip]overlay=x=0:y=0:shortest=1:eof_action=endall,setpts=PTS*5/6,fps=30:round=near,tpad=stop_mode=clone:stop=2,trim=end_frame=7250,setpts=N/(30*TB)[v];[0:a]atempo=1.2,aresample=48000,apad=whole_len=11600000,atrim=end_sample=11600000,asetpts=PTS-STARTPTS[a]';
      manifest.eofFrameAlignment = 'Hold the last visual after fps conversion, then trim to exactly 7250 frames. Initial strict validation rejected 7249 frames; one final visual frame completes the 30fps duration.';
      await command(FFMPEG, ['-hide_banner', '-nostdin', '-y', '-i', input, '-framerate', '30', '-start_number', '0', '-i', path.join(strips, '%05d.png'), '-filter_complex', filters, '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-ac', '2', '-fps_mode:v', 'passthrough', '-frames:v', '7250', '-video_track_timescale', '90000', '-movflags', '+faststart', candidate], path.join(run, 'encode.log'));
      manifest.validation = await validate(candidate, run);
      assert.equal(digest(await fs.readFile(input)), manifest.inputSHA256, 'Source movie changed');
      if (!await exists(ORIGINAL)) await fs.copyFile(input, ORIGINAL, constants.COPYFILE_EXCL);
      manifest.outputSHA256 = digest(await fs.readFile(candidate));
      if (opts.overwrite) await fs.rename(candidate, OUTPUT);
      else { await fs.link(candidate, OUTPUT); await fs.unlink(candidate); }
      const replacement = path.join(DOCS, `.binance-7702-current-${randomUUID()}.mp4`);
      try { await fs.copyFile(OUTPUT, replacement, constants.COPYFILE_EXCL); await fs.rename(replacement, CURRENT); }
      finally { await fs.unlink(replacement).catch(() => {}); }
      const select = manifest.qc.map(({ outputFrame }) => `eq(n\\,${outputFrame})`).join('+');
      await command(FFMPEG, ['-v', 'error', '-y', '-i', OUTPUT, '-vf', `select=${select}`, '-fps_mode', 'passthrough', path.join(run, 'edited-%02d.png')], path.join(run, 'extract.log'));
      manifest.outputs = [OUTPUT, CURRENT, ORIGINAL];
    }
    manifest.status = 'passed';
    manifest.completedAt = new Date().toISOString();
    manifest.assetsSHA256 = Object.fromEntries(serving.assets);
    console.log(json({ status: manifest.status, runDir: run, validation: manifest.validation, outputs: manifest.outputs }));
  } catch (error) {
    manifest.status = 'failed';
    manifest.error = error.stack || String(error);
    throw error;
  } finally {
    await fs.writeFile(path.join(run, 'edit-manifest.json'), json(manifest));
    await fs.unlink(candidate).catch(() => {});
    process.removeListener('SIGINT', stop);
    process.removeListener('SIGTERM', stop);
    await browser?.close();
    if (serving) await new Promise((resolve) => serving.server.close(resolve));
  }
}

main().catch((error) => { console.error(error.stack || error); process.exitCode = 1; });
