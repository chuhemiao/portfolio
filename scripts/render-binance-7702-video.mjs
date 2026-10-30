import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { createServer } from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = path.join(ROOT, 'docs/binance-7702-video.html');
const SCRIPT = path.join(ROOT, 'docs/binance-7702-video-script.md');
const OUTPUT = path.join(ROOT, 'docs/binance-7702-video.silent.mp4');
const FPS = 30;
const FRAMES = 8700;
const SECONDS = 290;
const WIDTH = 1920;
const HEIGHT = 1080;
const DURATIONS = [28, 50, 52, 42, 40, 28, 30, 20];
const STARTS = [0, 28, 78, 130, 172, 212, 240, 270];
const MODULE = process.env.PLAYWRIGHT_MODULE || path.join(os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const FFPROBE = process.env.FFPROBE || 'ffprobe';
const mimeTypes = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.mp4': 'video/mp4', '.webm': 'video/webm', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.m4a': 'audio/mp4', '.ogg': 'audio/ogg' };

function options(argv) {
  const result = { checkOnly: false, overwrite: false, workers: 2, help: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--check-only') result.checkOnly = true;
    else if (arg === '--overwrite') result.overwrite = true;
    else if (arg === '--help' || arg === '-h') result.help = true;
    else if (arg === '--workers') result.workers = Number(argv[++i]);
    else if (/^--workers=?\d+$/.test(arg)) result.workers = Number(arg.replace(/^--workers=?/, ''));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  assert(Number.isInteger(result.workers) && result.workers >= 1 && result.workers <= 4, '--workers must be an integer from 1 to 4');
  return result;
}

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const json = (value) => JSON.stringify(value, null, 2) + '\n';
const exists = (file) => fs.access(file).then(() => true, () => false);
const children = new Set();
let interrupted = false;

function command(bin, args, { logfile, timeout = 30 * 60_000 } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] });
    children.add(child);
    const stdout = [];
    const stderr = [];
    const timer = setTimeout(() => child.kill('SIGTERM'), timeout);
    const killTimer = setTimeout(() => child.kill('SIGKILL'), timeout + 5000);
    child.stdout.on('data', (data) => stdout.push(data));
    child.stderr.on('data', (data) => stderr.push(data));
    child.once('error', (error) => { clearTimeout(timer); clearTimeout(killTimer); children.delete(child); reject(error); });
    child.once('close', async (code, signal) => {
      clearTimeout(timer);
      clearTimeout(killTimer);
      children.delete(child);
      const out = Buffer.concat(stdout).toString();
      const err = Buffer.concat(stderr).toString();
      try {
        if (logfile) await fs.writeFile(logfile, `${bin} ${args.join(' ')}\n\n${out}\n${err}`);
        if (code !== 0) reject(new Error(`${bin} failed (${signal || code}): ${err.slice(-3000)}`));
        else resolve(out);
      } catch (error) { reject(error); }
    });
  });
}

async function browserPath() {
  if (process.env.CHROMIUM_EXECUTABLE) {
    await fs.access(process.env.CHROMIUM_EXECUTABLE);
    return process.env.CHROMIUM_EXECUTABLE;
  }
  const cache = path.join(os.homedir(), 'Library/Caches/ms-playwright');
  const candidates = [
    'chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell',
    'chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
    'chromium-1234/chrome-mac-arm64/Chromium.app/Contents/MacOS/Chromium',
  ];
  for (const candidate of candidates) if (await exists(path.join(cache, candidate))) return path.join(cache, candidate);
  throw new Error('Cached chromium-1234 executable not found; set CHROMIUM_EXECUTABLE. Browser downloads are disabled.');
}

async function serveDocs() {
  const docs = await fs.realpath(path.join(ROOT, 'docs'));
  const assets = new Map();
  const server = createServer(async (request, response) => {
    try {
      if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405).end(); return; }
      const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
      if (pathname === '/favicon.ico') { response.writeHead(204).end(); return; }
      if (!pathname.startsWith('/docs/') || pathname.split('/').some((part) => part.startsWith('.'))) { response.writeHead(404).end(); return; }
      const file = await fs.realpath(path.join(ROOT, pathname));
      if (!file.startsWith(docs + path.sep) || !mimeTypes[path.extname(file)]) { response.writeHead(404).end(); return; }
      const stat = await fs.stat(file);
      if (!stat.isFile()) { response.writeHead(404).end(); return; }
      const digest = sha256(await fs.readFile(file));
      if (assets.has(file) && assets.get(file) !== digest) throw new Error(`Asset changed during render: ${file}`);
      assets.set(file, digest);
      response.writeHead(200, { 'Content-Type': mimeTypes[path.extname(file)], 'Content-Length': stat.size, 'Cache-Control': 'no-store' });
      if (request.method === 'HEAD') response.end();
      else createReadStream(file).on('error', () => response.destroy()).pipe(response);
    } catch { response.writeHead(404).end(); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const { port } = server.address();
  return { server, assets, url: `http://127.0.0.1:${port}/docs/binance-7702-video.html` };
}

async function loadPage(browser, url, errors, record = true) {
  const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1, reducedMotion: 'no-preference', colorScheme: 'dark' });
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto(url + (record ? '?record=1' : ''), { waitUntil: 'networkidle', timeout: 90_000 });
  await page.evaluate(async () => {
    const fonts = [
      ...[400, 500, 600, 700].map((weight) => [`${weight} 40px "IBM Plex Sans SC"`, '一条签名的代价币安钱包授权']),
      ...[400, 500, 600].map((weight) => [`${weight} 40px "IBM Plex Mono"`, '0123456789abcdef:$,.%']),
    ];
    for (const [font, text] of fonts) {
      const faces = await document.fonts.load(font, text);
      if (!faces.length || faces.some((face) => face.status !== 'loaded')) throw new Error(`Required font did not load: ${font}`);
    }
    await document.fonts.ready;
    await Promise.all([...document.images].map(async (image) => { await image.decode(); }));
  });
  return page;
}

async function shot(page, time, file) {
  await page.evaluate((t) => window.__renderAt(t), time);
  return page.screenshot({ path: file, type: 'png', animations: 'allow', caret: 'hide', scale: 'css', timeout: 60_000 });
}

async function checkPage(browser, url, runDir, errors) {
  const page = await loadPage(browser, url, errors);
  assert.equal(await page.title(), '一条签名的代价');
  const geometry = await page.evaluate(() => {
    const stage = document.getElementById('stage');
    const box = stage.getBoundingClientRect();
    return { x: box.x, y: box.y, width: box.width, height: box.height, hidden: document.getElementById('chrome').hidden, chromeDisplay: getComputedStyle(document.getElementById('chrome')).display, cursor: getComputedStyle(document.body).cursor, scrollWidth: document.documentElement.scrollWidth, scrollHeight: document.documentElement.scrollHeight, dpr: devicePixelRatio, reduced: matchMedia('(prefers-reduced-motion: reduce)').matches, durations: [...document.querySelectorAll('.s')].map((scene) => Number(scene.dataset.dur)), fonts: [...document.fonts].filter((font) => font.status === 'loaded').map((font) => ({ family: font.family, weight: font.weight, status: font.status })) };
  });
  assert.deepEqual([geometry.x, geometry.y, geometry.width, geometry.height], [0, 0, WIDTH, HEIGHT]);
  assert.equal(geometry.dpr, 1);
  assert.equal(geometry.reduced, false);
  assert.equal(geometry.hidden, true);
  assert.equal(geometry.chromeDisplay, 'none');
  assert.equal(geometry.cursor, 'none');
  assert.equal(geometry.scrollWidth, WIDTH);
  assert.equal(geometry.scrollHeight, HEIGHT);
  assert.deepEqual(geometry.durations, DURATIONS);
  const required = [0, 27.9, 28.1, 77.9, 130.1, 171.9, 212.1, 269.9, 289.9, 139.4];
  const times = [...new Set([...required, ...STARTS.flatMap((start) => [Math.max(0, start - 1 / FPS), start, start + 1 / FPS]), 289.96666666666664, 290])].sort((a, b) => a - b);
  const frames = [];
  for (const time of times) {
    const expected = STARTS.reduce((current, start, index) => time >= start ? index : current, 0);
    const file = path.join(runDir, `qc-${time.toFixed(6)}.png`);
    const png = await shot(page, time, file);
    const state = await page.evaluate(() => {
      const scenes = [...document.querySelectorAll('.s')];
      const active = scenes.filter((scene) => scene.hasAttribute('data-active'));
      return { active: active.map((scene) => scenes.indexOf(scene)), opacity: active.map((scene) => getComputedStyle(scene).opacity), timer: document.querySelector('#gapTimer').textContent, pausedClass: document.getElementById('stage').classList.contains('paused') };
    });
    assert.deepEqual(state.active, [expected], `Scene at ${time}`);
    assert.deepEqual(state.opacity, ['1'], `Active scene must not be transitioning at ${time}`);
    assert.equal(state.pausedClass, false);
    if (time === 139.4) assert.equal(state.timer, '3:24');
    const reveals = await page.evaluate((local) => [...document.querySelectorAll('.s[data-active] .rv, .s[data-active] .fv, .s[data-active] .pv')].map((element) => {
      const style = getComputedStyle(element);
      return { delay: parseFloat(style.animationDelay) || 0, duration: parseFloat(style.animationDuration) || 0, opacity: Number(style.opacity), local };
    }), time - STARTS[expected]);
    assert(reveals.length > 0, `No reveal animations found at ${time}`);
    for (const reveal of reveals) {
      if (reveal.local < reveal.delay) assert(reveal.opacity < 0.001, `Premature reveal at ${time}`);
      if (reveal.local >= reveal.delay + reveal.duration + 0.02) assert(reveal.opacity > 0.999, `Missing reveal at ${time}`);
    }
    frames.push({ time, expectedScene: expected + 1, file, sha256: sha256(png), timer: state.timer, revealCount: reveals.length });
  }
  const repeated = [];
  for (const time of [27.9, 28.1, 139.4, 269.9, 289.9, 28.1, 27.9, 139.4]) {
    const digest = sha256(await shot(page, time));
    assert.equal(digest, frames.find((frame) => frame.time === time).sha256, `Nondeterministic screenshot at ${time}`);
    repeated.push({ time, sha256: digest });
  }
  await page.close();
  const interactive = await loadPage(browser, url, errors, false);
  assert.equal(await interactive.locator('#chrome').evaluate((element) => element.hidden), false);
  await interactive.keyboard.press('Space');
  assert.equal(await interactive.locator('#stage').evaluate((element) => element.classList.contains('paused')), true);
  const pausedClock = await interactive.locator('#clock').innerText();
  await interactive.waitForTimeout(1100);
  assert.equal(await interactive.locator('#clock').innerText(), pausedClock);
  await interactive.keyboard.press('ArrowRight');
  assert.equal(await interactive.locator('#sceneNo').innerText(), '2');
  await interactive.keyboard.press('ArrowLeft');
  assert.equal(await interactive.locator('#sceneNo').innerText(), '1');
  await interactive.keyboard.press('h');
  assert.equal(await interactive.locator('#chrome').evaluate((element) => element.hidden), true);
  await interactive.keyboard.press('h');
  assert.equal(await interactive.locator('#chrome').evaluate((element) => element.hidden), false);
  await interactive.keyboard.press('r');
  assert.equal(await interactive.locator('#sceneNo').innerText(), '1');
  assert.equal(await interactive.locator('#stage').evaluate((element) => element.classList.contains('paused')), false);
  await interactive.keyboard.press('Space');
  assert.equal(await interactive.locator('#stage').evaluate((element) => element.classList.contains('paused')), true);
  await interactive.keyboard.press('Space');
  assert.equal(await interactive.locator('#stage').evaluate((element) => element.classList.contains('paused')), false);
  await interactive.close();
  assert.deepEqual(errors, [], 'Browser page/console errors');
  return { geometry, frames, repeated, interactions: { pause: true, resume: true, nextScene: true, previousScene: true, replay: true, hideControls: true } };
}

async function validateVideo(file, runDir) {
  const probe = JSON.parse(await command(FFPROBE, ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', file]));
  await fs.writeFile(path.join(runDir, 'ffprobe.json'), json(probe));
  assert.equal(probe.streams.length, 1, 'Silent master must have one video stream and no audio');
  const video = probe.streams[0];
  assert.equal(video.codec_type, 'video');
  assert.equal(video.codec_name, 'h264');
  assert.equal(video.pix_fmt, 'yuv420p');
  assert.equal(video.width, WIDTH);
  assert.equal(video.height, HEIGHT);
  assert.equal(video.avg_frame_rate, '30/1');
  assert.equal(video.r_frame_rate, '30/1');
  assert.equal(Number(video.nb_frames), FRAMES);
  assert.equal(Number(video.duration), SECONDS);
  assert.equal(Number(probe.format.duration), SECONDS);
  const frameData = JSON.parse(await command(FFPROBE, ['-v', 'error', '-select_streams', 'v:0', '-show_frames', '-show_entries', 'frame=pts,best_effort_timestamp,duration,pkt_duration', '-of', 'json', file]));
  assert.equal(frameData.frames.length, FRAMES);
  const [tbNum, tbDen] = video.time_base.split('/').map(BigInt);
  for (const [index, frame] of frameData.frames.entries()) {
    const pts = frame.pts ?? frame.best_effort_timestamp;
    assert.equal(BigInt(pts) * tbNum * BigInt(FPS), BigInt(index) * tbDen, `Discontinuous presentation time at frame ${index}`);
    const duration = frame.duration ?? frame.pkt_duration;
    if (duration !== undefined) assert.equal(BigInt(duration) * tbNum * BigInt(FPS), tbDen, `Frame duration at ${index}`);
  }
  assert.equal(BigInt(video.duration_ts) * tbNum, BigInt(SECONDS) * tbDen);
  await fs.writeFile(path.join(runDir, 'frame-pts.json'), json(frameData));
  await command(FFMPEG, ['-v', 'error', '-xerror', '-i', file, '-map', '0:v:0', '-an', '-c:v', 'rawvideo', '-f', 'null', '-'], { logfile: path.join(runDir, 'decode.log') });
  return { codec: video.codec_name, width: WIDTH, height: HEIGHT, fps: '30/1', decodedFrames: frameData.frames.length, duration: SECONDS, timeBase: video.time_base, firstPTS: 0, continuousPTS: true, noAudio: true, fullDecodePassed: true };
}

async function main() {
  const opts = options(process.argv.slice(2));
  if (opts.help) {
    console.log('Usage: node scripts/render-binance-7702-video.mjs [--check-only] [--workers 1-4] [--overwrite]\nOutput: docs/binance-7702-video.silent.mp4\nEnvironment: PLAYWRIGHT_MODULE, CHROMIUM_EXECUTABLE, FFMPEG, FFPROBE. No browser downloads or project dependency installs.');
    return;
  }
  if (!opts.checkOnly && !opts.overwrite && await exists(OUTPUT)) throw new Error(`Output already exists: ${OUTPUT}. Use --overwrite deliberately.`);
  const runDir = await fs.mkdtemp(path.join(os.tmpdir(), 'binance-7702-render-'));
  console.log(json({ runDir, checkOnly: opts.checkOnly, output: OUTPUT }));
  const manifest = { status: 'running', startedAt: new Date().toISOString(), source: SOURCE, sourceSHA256: sha256(await fs.readFile(SOURCE)), scriptSHA256: sha256(await fs.readFile(SCRIPT)), rendererSHA256: sha256(await fs.readFile(fileURLToPath(import.meta.url))), fps: FPS, frames: FRAMES, seconds: SECONDS, viewport: { width: WIDTH, height: HEIGHT }, workers: opts.workers, runDir, output: OUTPUT };
  const candidate = path.join(path.dirname(OUTPUT), `.binance-7702-video.silent-${randomUUID()}.mp4`);
  let browser;
  let server;
  const errors = [];
  const signalHandler = () => { interrupted = true; for (const child of children) child.kill('SIGTERM'); void browser?.close(); };
  process.once('SIGINT', signalHandler);
  process.once('SIGTERM', signalHandler);
  try {
    const api = await import(pathToFileURL(path.resolve(MODULE)).href);
    const executablePath = await browserPath();
    browser = await api.chromium.launch({ executablePath, headless: true, args: ['--force-color-profile=srgb', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows'] });
    manifest.browser = { executablePath, version: browser.version(), module: MODULE };
    const serving = await serveDocs();
    server = serving.server;
    const qc = await checkPage(browser, serving.url, runDir, errors);
    await fs.writeFile(path.join(runDir, 'page-qc.json'), json(qc));
    assert.equal(sha256(await fs.readFile(SOURCE)), manifest.sourceSHA256, 'HTML changed during checks');
    if (!opts.checkOnly) {
      manifest.ffmpegVersion = (await command(FFMPEG, ['-version'])).split('\n')[0];
      manifest.ffprobeVersion = (await command(FFPROBE, ['-version'])).split('\n')[0];
      const framesDir = path.join(runDir, 'frames');
      await fs.mkdir(framesDir);
      let done = 0;
      await Promise.all(Array.from({ length: opts.workers }, async (_, worker) => {
        const page = await loadPage(browser, serving.url, errors);
        const begin = Math.floor(worker * FRAMES / opts.workers);
        const end = Math.floor((worker + 1) * FRAMES / opts.workers);
        try {
          for (let index = begin; index < end; index++) {
            assert(!interrupted, 'Interrupted');
            await shot(page, index / FPS, path.join(framesDir, `${String(index).padStart(5, '0')}.png`));
            done++;
            if (done % 150 === 0 || done === FRAMES) console.log(`frames ${done}/${FRAMES}`);
          }
        } finally { await page.close(); }
      }));
      const files = (await fs.readdir(framesDir)).sort();
      assert.equal(files.length, FRAMES);
      for (let index = 0; index < FRAMES; index++) assert.equal(files[index], `${String(index).padStart(5, '0')}.png`);
      assert.deepEqual(errors, [], 'Browser page/console errors');
      assert.equal(sha256(await fs.readFile(SOURCE)), manifest.sourceSHA256, 'HTML changed while rendering');
      assert.equal(sha256(await fs.readFile(SCRIPT)), manifest.scriptSHA256, 'Narration script changed while rendering');
      for (const [file, digest] of serving.assets) assert.equal(sha256(await fs.readFile(file)), digest, `Asset changed while rendering: ${file}`);
      await command(FFMPEG, ['-hide_banner', '-nostdin', '-y', '-framerate', String(FPS), '-start_number', '0', '-i', path.join(framesDir, '%05d.png'), '-frames:v', String(FRAMES), '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-fps_mode', 'cfr', '-video_track_timescale', '90000', '-movflags', '+faststart', '-an', candidate], { logfile: path.join(runDir, 'encode.log') });
      manifest.videoQC = await validateVideo(candidate, runDir);
      manifest.mediaSHA256 = sha256(await fs.readFile(candidate));
      if (opts.overwrite) await fs.rename(candidate, OUTPUT);
      else { await fs.link(candidate, OUTPUT); await fs.unlink(candidate); }
    }
    manifest.status = 'passed';
    manifest.localAssetSHA256 = Object.fromEntries(serving.assets);
    manifest.completedAt = new Date().toISOString();
    manifest.consoleErrors = errors;
    await fs.writeFile(path.join(runDir, 'render-manifest.json'), json(manifest));
    console.log(json({ status: manifest.status, runDir, output: opts.checkOnly ? null : OUTPUT, videoQC: manifest.videoQC }));
  } catch (error) {
    manifest.status = 'failed';
    manifest.error = error.stack || String(error);
    manifest.consoleErrors = errors;
    await fs.writeFile(path.join(runDir, 'render-manifest.json'), json(manifest));
    await fs.unlink(candidate).catch(() => {});
    throw new Error(`${error.message}\nEvidence retained at ${runDir}`, { cause: error });
  } finally {
    process.removeListener('SIGINT', signalHandler);
    process.removeListener('SIGTERM', signalHandler);
    await browser?.close();
    if (server) await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((error) => { console.error(error.stack || String(error)); process.exitCode = 1; });
