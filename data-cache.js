/* Cache local reutilizável para dados estáticos do site.
 * Usa IndexedDB (não localStorage) porque o histórico CSV é grande.
 * Falhas de quota/privacidade não impedem o site de funcionar.
 */
(function () {
  "use strict";
  const DB_NAME = "bscinfos-data-cache";
  const DB_VERSION = 1;
  const STORE_NAME = "datasets";
  let dbPromise = null;

  function openDB() {
    if (!("indexedDB" in window)) return Promise.reject(new Error("IndexedDB indisponível"));
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      let request;
      try { request = window.indexedDB.open(DB_NAME, DB_VERSION); }
      catch (error) { reject(error); return; }
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME, { keyPath: "key" });
      };
      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => { try { db.close(); } catch (_) {} dbPromise = null; };
        resolve(db);
      };
      request.onerror = () => { dbPromise = null; reject(request.error || new Error("Não foi possível abrir o cache")); };
      request.onblocked = () => { dbPromise = null; reject(new Error("A abertura do cache foi bloqueada")); };
    });
    return dbPromise;
  }

  async function get(key) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const request = tx.objectStore(STORE_NAME).get(String(key));
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error || new Error("Falha ao ler cache"));
      tx.onabort = () => reject(tx.error || new Error("Leitura do cache cancelada"));
    });
  }

  async function set(key, data) {
    // Copia linhas simples antes do primeiro await porque app.js/draft.js podem
    // enriquecer os registros em memória (por exemplo, atribuindo IDs UNK).
    // Assim o cache permanece fiel ao CSV original.
    const snapshot = Array.isArray(data)
      ? data.map(item => item && typeof item === "object" ? { ...item } : item)
      : data;
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put({ key: String(key), savedAt: Date.now(), data: snapshot });
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error || new Error("Falha ao salvar cache"));
      tx.onabort = () => reject(tx.error || new Error("Gravação do cache cancelada"));
    });
  }

  async function remove(key) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).delete(String(key));
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error || new Error("Falha ao apagar cache"));
      tx.onabort = () => reject(tx.error || new Error("Remoção do cache cancelada"));
    });
  }

  function isFresh(record, maxAgeMs) {
    return Boolean(record && Number.isFinite(Number(record.savedAt)) &&
      Array.isArray(record.data) && Date.now() - Number(record.savedAt) >= 0 &&
      Date.now() - Number(record.savedAt) <= maxAgeMs);
  }

  window.BSCDataCache = { get, set, remove, isFresh };
})();
