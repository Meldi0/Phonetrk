// IndexedDB stores full PNG blobs without localStorage's small string quota.
function database() {
  return new Promise((resolve, reject) => {
    if (!globalThis.indexedDB) return reject(new Error('Local storage is unavailable.'));
    const request = indexedDB.open('snapbooth-gallery', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('strips', { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Close other SnapBooth tabs to enable local storage.'));
  });
}
async function transaction(mode, action) {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('strips', mode), request = action(tx.objectStore('strips'));
    tx.oncomplete = () => { db.close(); resolve(request.result); };
    tx.onerror = tx.onabort = () => { db.close(); reject(tx.error || new Error('Local storage is full or unavailable.')); };
  });
}
export const readGallery = () => transaction('readonly', store => store.getAll());
export const saveGalleryItem = item => transaction('readwrite', store => store.put(item));
export const deleteGalleryItem = id => transaction('readwrite', store => store.delete(id));
