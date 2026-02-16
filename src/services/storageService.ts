
import { LinkedInImportedData } from '../types';

const DB_NAME = 'MasarAIDB';
const STORE_NAME = 'linkedin_data';
const DB_VERSION = 1;

export class StorageService {
  private static db: IDBDatabase | null = null;

  static async init(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        reject('IndexedDB Error: ' + (event.target as IDBOpenDBRequest).error);
      };
    });
  }

  static async saveLinkedInData(data: LinkedInImportedData): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put({ id: 'current_user', ...data });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  static async getLinkedInData(): Promise<LinkedInImportedData | null> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get('current_user');

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  static async clearLinkedInData(): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete('current_user');

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}
