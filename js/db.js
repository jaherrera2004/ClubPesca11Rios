// Módulo para manejar la base de datos IndexedDB para competencias de pesca
const DB_NAME = 'ClubPescaDB';
const DB_VERSION = 1;
const STORE_COMPETENCIAS = 'competencias';

function abrirDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = function (event) {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_COMPETENCIAS)) {
                db.createObjectStore(STORE_COMPETENCIAS, { keyPath: 'id' });
            }
        };
        request.onsuccess = function (event) {
            resolve(event.target.result);
        };
        request.onerror = function (event) {
            reject(event.target.error);
        };
    });
}

async function guardarCompetencia(competencia) {
    const db = await abrirDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_COMPETENCIAS, 'readwrite');
        const store = tx.objectStore(STORE_COMPETENCIAS);
        store.put(competencia);
        tx.oncomplete = () => resolve();
        tx.onerror = e => reject(e.target.error);
    });
}

async function obtenerCompetencias() {
    const db = await abrirDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_COMPETENCIAS, 'readonly');
        const store = tx.objectStore(STORE_COMPETENCIAS);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = e => reject(e.target.error);
    });
}

async function obtenerCompetenciaPorId(id) {
    const db = await abrirDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_COMPETENCIAS, 'readonly');
        const store = tx.objectStore(STORE_COMPETENCIAS);
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = e => reject(e.target.error);
    });
}

async function eliminarCompetencia(id) {
    const db = await abrirDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_COMPETENCIAS, 'readwrite');
        const store = tx.objectStore(STORE_COMPETENCIAS);
        store.delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = e => reject(e.target.error);
    });
}

export {
    guardarCompetencia,
    obtenerCompetencias,
    obtenerCompetenciaPorId,
    eliminarCompetencia
};

