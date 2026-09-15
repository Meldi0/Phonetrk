// Shared, bounded decode cache. In-flight requests for the same asset are deduplicated.
const assets = new Map();
const MAX_ASSETS = 64;
export function decodedImage(src) {
  if (assets.has(src)) {
    const entry = assets.get(src); assets.delete(src); assets.set(src, entry); return entry.promise;
  }
  const entry = {};
  entry.promise = new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    if (!src.startsWith('data:') && !src.startsWith('blob:')) image.crossOrigin = 'anonymous';
    image.onload = () => { entry.image = image; image.onload = image.onerror = null; resolve(image); };
    image.onerror = () => { assets.delete(src); reject(new Error('Image asset could not be decoded.')); };
    image.src = src;
  });
  assets.set(src, entry);
  while (assets.size > MAX_ASSETS) assets.delete(assets.keys().next().value);
  return entry.promise;
}
export const cachedImage = src => assets.get(src)?.image;
export const resourceStats = () => ({ decodedAssets: assets.size, limit: MAX_ASSETS });
export function releaseCanvas(canvas) { if (canvas) { canvas.width = 1; canvas.height = 1; } }
export function nextFrame(signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException('Cancelled', 'AbortError'));
    const abort = () => { clearTimeout(id); reject(new DOMException('Cancelled', 'AbortError')); };
    const id = setTimeout(() => { signal?.removeEventListener('abort', abort); resolve(); }, 0);
    signal?.addEventListener('abort', abort, { once: true });
  });
}

/** Throws AbortError if signal is aborted — use between synchronous render phases. */
export function checkAbort(signal) {
  if (signal?.aborted) throw new DOMException('Cancelled', 'AbortError');
}

export function seededRandom(seed = 2197) {
  let value = seed;
  return () => { value = (Math.imul(1664525, value) + 1013904223) >>> 0; return value / 4294967296; };
}

// At most one running job plus one pending job. A new request supersedes the pending one.
export class LatestRenderQueue {
  current = null;
  pending = null;
  disposed = false;
  submit(work, accept, fail) {
    this.disposed = false;
    this.current?.abort();
    this.pending = { work, accept, fail };
    this.drain();
  }
  async drain() {
    if (this.current || !this.pending || this.disposed) return;
    const job = this.pending; this.pending = null;
    const controller = new AbortController(); this.current = controller;
    try {
      const result = await job.work(controller.signal);
      if (!controller.signal.aborted && !this.disposed) job.accept(result);
      else result?.dispose?.();
    } catch (error) {
      if (!controller.signal.aborted && !this.disposed && error.name !== 'AbortError') job.fail(error);
    } finally { this.current = null; this.drain(); }
  }
  cancel() { this.disposed = true; this.pending = null; this.current?.abort(); }
}
