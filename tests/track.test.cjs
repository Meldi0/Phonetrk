const test = require('node:test');
const assert = require('node:assert/strict');
const { harness } = require('./browser-harness.cjs');

test('does not watch or send before explicit Start; permission remains with browser', () => {
  const h = harness('track.js');
  assert.equal(h.watches.length, 0);
  assert.equal(h.requests.length, 0);
  h.start(); h.start();
  assert.equal(h.watches.length, 1);
  assert.equal(h.requests.length, 0);
  assert.equal(h.get('startBtn').disabled, true);
  h.watches[0].error({ code: 1 });
  assert.equal(h.requests.length, 0);
  assert.deepEqual(h.cleared, [0]);
  assert.match(h.get('status').textContent, /Izin lokasi ditolak/);
  assert.equal(h.get('startBtn').disabled, false);
});

test('secure context and valid token are required', () => {
  const insecure = harness('track.js', { secure: false });
  insecure.start();
  assert.equal(insecure.watches.length, 0);
  const invalid = harness('track.js');
  invalid.get('token').value = 'short'; invalid.start();
  assert.equal(invalid.watches.length, 0);
});

test('throttles callbacks, sends newest fix, and uses GPS time with bearer auth', async () => {
  const h = harness('track.js'); h.start();
  h.watches[0].success(h.position()); await h.settle();
  assert.equal(h.requests.length, 1);
  assert.equal(h.requests[0].config.headers.Authorization, 'Bearer ' + h.get('token').value);
  const first = JSON.parse(h.requests[0].config.body);
  assert.equal(first.device_time, '2026-09-11T12:00:00.000Z');
  assert.equal(first.battery, null);
  for (let i = 0; i < 20; i++) h.watches[0].success(h.position({ coords: { ...h.position().coords, latitude: i } }));
  await h.advance(14999);
  assert.equal(h.requests.length, 1);
  await h.advance(1);
  assert.equal(h.requests.length, 2);
  assert.equal(JSON.parse(h.requests[1].config.body).latitude, 19);
  assert.equal(h.get('statusLabel').textContent, 'Tracking aktif');
});

test('Stop aborts pending work and ignores late callbacks and old responses after restart', async () => {
  const resolvers = [];
  const h = harness('track.js', { fetch: () => new Promise(resolve => resolvers.push(resolve)) });
  h.start(); h.watches[0].success(h.position());
  h.stop();
  assert.equal(h.requests[0].config.signal.aborted, true);
  h.watches[0].success(h.position());
  await h.advance(30000);
  assert.equal(h.requests.length, 1);
  h.start(); h.watches[1].success(h.position());
  resolvers[0]({ ok: true, status: 200, json: async () => ({ ok: true, received_at: new Date().toISOString() }) });
  await h.settle();
  assert.equal(h.get('lastSent').textContent, 'Belum ada pengiriman');
  h.stop();
  assert.equal(h.requests[1].config.signal.aborted, true);
});

test('late wake lock is released when stopped; battery lookup never blocks Start', async () => {
  let resolveLock; let released = 0;
  const h = harness('track.js', { navigator: {
    wakeLock: { request: () => new Promise(resolve => { resolveLock = resolve; }) },
    getBattery: () => new Promise(() => {}),
  } });
  h.start(); h.start();
  assert.equal(h.watches.length, 1);
  h.stop(); resolveLock({ release: async () => { released++; } }); await h.settle();
  assert.equal(released, 1);
  assert.equal(h.requests.length, 0);
});

test('invalid bearer stops tracking and cannot keep sending', async () => {
  const h = harness('track.js', { fetch: async () => ({ ok: false, status: 401, json: async () => ({}) }) });
  h.start(); h.watches[0].success(h.position()); await h.settle();
  await h.advance(30000);
  assert.equal(h.requests.length, 1);
  assert.equal(h.get('startBtn').disabled, false);
  assert.match(h.get('status').textContent, /Token ditolak/);
});

test('offline recovery sends latest fix; old fixes and provider errors are not sent', async () => {
  const h = harness('track.js'); h.navigator.onLine = false; h.start();
  h.watches[0].success(h.position()); await h.settle();
  assert.equal(h.requests.length, 0);
  h.navigator.onLine = true; h.window.emit('online'); await h.settle();
  assert.equal(h.requests.length, 1);
  await h.advance(75000);
  const count = h.requests.length;
  await h.advance(30000);
  assert.equal(h.requests.length, count);
  assert.equal(h.get('statusLabel').textContent, 'Menunggu GPS');
  h.watches[0].success(h.position()); await h.settle();
  h.watches[0].error({ code: 2 });
  const afterError = h.requests.length;
  await h.advance(30000);
  assert.equal(h.requests.length, afterError);
});

test('network failure retries and only a successful response changes last sent time', async () => {
  const h = harness('track.js', { fetch: async (_url, _config, count) => {
    if (count === 1) throw new Error('Network unavailable');
    return { ok: true, status: 200, json: async () => ({ ok: true, received_at: '2026-09-11T12:00:15Z' }) };
  } });
  h.start(); h.watches[0].success(h.position()); await h.settle();
  assert.equal(h.get('lastSent').textContent, 'Belum ada pengiriman');
  await h.advance(15000);
  assert.equal(h.requests.length, 2);
  assert.notEqual(h.get('lastSent').textContent, 'Belum ada pengiriman');
});

test('battery zero is sent as zero, and leaving the page stops the watcher', async () => {
  const h = harness('track.js', { navigator: { getBattery: async () => ({ level: 0 }) } });
  h.start(); await h.settle(); h.watches[0].success(h.position()); await h.settle();
  assert.equal(JSON.parse(h.requests[0].config.body).battery, 0);
  h.window.emit('pagehide');
  assert.deepEqual(h.cleared, [0]);
  await h.advance(30000);
  assert.equal(h.requests.length, 1);
});
