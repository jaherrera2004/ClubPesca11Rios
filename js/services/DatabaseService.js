import { APP_CONFIG } from '../config/constants.js';

/**
 * Servicio para manejar la base de datos IndexedDB
 */
export class DatabaseService {
  constructor() {
    this.dbName = APP_CONFIG.DB_NAME;
    this.dbVersion = APP_CONFIG.DB_VERSION;
    this.storeName = APP_CONFIG.STORE_COMPETENCIAS;
  }

  /**
   * Abre la conexión a la base de datos
   */
  async openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => resolve(event.target.result);
      request.onerror = (event) => reject(event.target.error);
    });
  }

  /**
   * Ejecuta una transacción en la base de datos
   */
  async executeTransaction(mode, operation) {
    try {
      const db = await this.openDB();
      const transaction = db.transaction(this.storeName, mode);
      const store = transaction.objectStore(this.storeName);

      return new Promise((resolve, reject) => {
        const request = operation(store);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error en transacción de BD:', error);
      throw error;
    }
  }

  /**
   * Guarda una competencia
   */
  async saveCompetencia(competencia) {
    return this.executeTransaction('readwrite', (store) => store.put(competencia));
  }

  /**
   * Obtiene todas las competencias
   */
  async getAllCompetencias() {
    return this.executeTransaction('readonly', (store) => store.getAll());
  }

  /**
   * Obtiene una competencia por ID
   */
  async getCompetenciaById(id) {
    return this.executeTransaction('readonly', (store) => store.get(id));
  }

  /**
   * Elimina una competencia
   */
  async deleteCompetencia(id) {
    return this.executeTransaction('readwrite', (store) => store.delete(id));
  }
}
