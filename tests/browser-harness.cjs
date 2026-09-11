const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

class Element {
  constructor() { this.textContent = ''; this.value = ''; this.disabled = false; this.dataset = {}; this.children = []; this.listeners = {}; }
  addEventListener(name, callback) { (this.listeners[name] ||= []).push(callback); }
  emit(name, event = {}) { for (const fn of this.listeners[name] || []) fn(event); }
  append(child) { this.children.push(child); }
  replaceChildren(...children) { this.children = children; }
  focus() {}
}

function harness(script, options = {}) {
  let now = 0;
  let nextTimer = 0;
  const epoch = Date.parse('2026-09-11T12:00:00Z');
  const elements = new Map();
  const get = (id) => {
    if (!elements.has(id)) elements.set(id, new Element());
    return elements.get(id);
  };
  get('token').value = 'test-only-tracker-token-1234567890';
  get('lastSent').textContent = 'Belum ada pengiriman';
  get('initialData').textContent = JSON.stringify(options.initial || { location: null, history: [] });
  const timers = new Map();
  const window = new Element();
  window.isSecureContext = options.secure !== false;
  const document = new Element();
  document.visibilityState = 'visible';
  document.getElementById = get;
  document.createElement = () => new Element();
  const watches = [];
  const cleared = [];
  const requests = [];
  const navigator = {
    onLine: true,
    geolocation: {
      watchPosition(success, error, config) { watches.push({ success, error, config }); return watches.length - 1; },
      clearWatch(id) { cleared.push(id); },
    },
    ...options.navigator,
  };
  class MockDate extends Date {
    constructor(...args) { super(...(args.length ? args : [epoch + now])); }
    static now() { return epoch + now; }
  }
  function schedule(callback, delay, repeat) {
    const id = ++nextTimer;
    timers.set(id, { callback, at: now + delay, repeat: repeat ? delay : 0 });
    return id;
  }
  window.location = { search: options.search || '' };
  const context = {
    window, document, navigator, Date: MockDate, performance: { now: () => now },
    AbortController, console, localStorage: { removeItem() {} }, URLSearchParams,
    setInterval: (fn, delay) => schedule(fn, delay, true),
    setTimeout: (fn, delay) => schedule(fn, delay, false),
    clearTimeout: (id) => timers.delete(id), clearInterval: (id) => timers.delete(id),
    fetch: async (url, config) => {
      requests.push({ url, config });
      return options.fetch ? options.fetch(url, config, requests.length) : {
        ok: true, status: 200, json: async () => ({ ok: true, received_at: new MockDate().toISOString() }),
      };
    },
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'static', script), 'utf8'), context);
  const settle = async () => { for (let i = 0; i < 16; i++) await Promise.resolve(); };
  async function advance(ms) {
    const target = now + ms;
    while (true) {
      const due = [...timers.entries()].filter(([, t]) => t.at <= target).sort((a,b) => a[1].at - b[1].at)[0];
      if (!due) break;
      const [id, timer] = due;
      now = timer.at;
      if (timer.repeat) timer.at += timer.repeat;
      else timers.delete(id);
      timer.callback();
      await settle();
    }
    now = target;
    await settle();
  }
  return {
    get, window, document, navigator, watches, cleared, requests, advance, settle,
    start: () => get('trackingForm').emit('submit', { preventDefault() {} }),
    stop: () => get('stopBtn').emit('click'),
    position: (overrides = {}) => ({ timestamp: epoch + now, coords: {
      latitude: -6.123456, longitude: 107.123456, accuracy: 8, altitude: null, speed: null, heading: null,
    }, ...overrides }),
  };
}

module.exports = { harness };
