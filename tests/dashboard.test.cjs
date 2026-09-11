const test = require('node:test');
const assert = require('node:assert/strict');
const { harness } = require('./browser-harness.cjs');
const location = { id: 1, latitude: 0, longitude: 0, accuracy: 0, battery: 0, received_at: '2026-09-11T12:00:00Z', device_time: null };

test('empty dashboard updates first fix, history and zero values without Leaflet or reload', async () => {
  const h = harness('dashboard.js', { fetch: async () => ({ ok: true, status: 200,
    json: async () => ({ location, history: [location] }) }) });
  assert.equal(h.get('historyCount').textContent, 0);
  assert.match(h.get('mapNotice').textContent, /Peta gagal dimuat/);
  await h.advance(12000);
  assert.equal(h.get('latitude').textContent, '0.000000');
  assert.equal(h.get('battery').textContent, '0%');
  assert.equal(h.get('accuracy').textContent, '±0 m');
  assert.equal(h.get('historyBody').children.length, 1);
  assert.equal(h.get('historyBody').children[0].children.length, 6);
  assert.equal(h.requests[0].config.credentials, 'same-origin');
});

test('failed polls retain history and retry, while server time becomes stale', async () => {
  const h = harness('dashboard.js', { initial: { location, history: [location] }, fetch: async () => { throw Error('offline'); } });
  await h.advance(72000);
  assert.equal(h.get('historyBody').children.length, 1);
  assert.equal(h.get('onlineLabel').textContent, 'Belum ada kiriman baru');
  assert.match(h.get('refreshStatus').textContent, /Pembaruan gagal/);
  assert.equal(h.requests.length, 6);
});

test('401 stops polling instead of repeatedly requesting authentication', async () => {
  const h = harness('dashboard.js', { fetch: async () => ({ ok: false, status: 401 }) });
  await h.advance(60000);
  assert.equal(h.requests.length, 1);
  assert.match(h.get('refreshStatus').textContent, /login kembali/);
});

test('concurrent refresh and page exit do not duplicate polls', async () => {
  const h = harness('dashboard.js', { fetch: () => new Promise(() => {}) });
  await h.advance(12000);
  h.document.emit('visibilitychange'); h.document.emit('visibilitychange');
  assert.equal(h.requests.length, 1);
  h.window.emit('pagehide');
  assert.equal(h.requests[0].config.signal.aborted, true);
});

test('renders photo preview in latest panel and photo button in table when photo exists', async () => {
  const locWithPhoto = { ...location, photo: 'data:image/jpeg;base64,dummy' };
  const h = harness('dashboard.js', { initial: { location: locWithPhoto, history: [locWithPhoto] } });
  assert.equal(h.get('latestPhotoBox').hidden, false);
  assert.equal(h.get('latestPhotoImg').src, 'data:image/jpeg;base64,dummy');
  const cells = h.get('historyBody').children[0].children;
  assert.equal(cells.length, 6);
  assert.match(cells[5].children[0].textContent, /Lihat Foto/);
});
