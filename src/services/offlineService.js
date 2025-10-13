import { openDB } from 'idb';

const DB_NAME = 'WorkerAppDB';
const DB_VERSION = 1;
const WORK_ORDERS_STORE = 'workOrders';
const PENDING_UPLOADS_STORE = 'pendingUploads';

class OfflineService {
  constructor() {
    this.db = null;
    this.initDB();
  }

  async initDB() {
    this.db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(WORK_ORDERS_STORE)) {
          db.createObjectStore(WORK_ORDERS_STORE, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(PENDING_UPLOADS_STORE)) {
          const store = db.createObjectStore(PENDING_UPLOADS_STORE, {
            keyPath: 'id',
            autoIncrement: true
          });
          store.createIndex('workOrderId', 'workOrderId');
        }
      },
    });
  }

  async saveWorkOrders(workOrders) {
    if (!this.db) await this.initDB();
    const tx = this.db.transaction(WORK_ORDERS_STORE, 'readwrite');
    await Promise.all(
      workOrders.map(workOrder => tx.store.put(workOrder))
    );
    await tx.done;
  }

  async getWorkOrders() {
    if (!this.db) await this.initDB();
    return this.db.getAll(WORK_ORDERS_STORE);
  }

  async saveWorkOrder(workOrder) {
    if (!this.db) await this.initDB();
    return this.db.put(WORK_ORDERS_STORE, workOrder);
  }

  async getWorkOrder(id) {
    if (!this.db) await this.initDB();
    return this.db.get(WORK_ORDERS_STORE, id);
  }

  async savePendingUpload(data) {
    if (!this.db) await this.initDB();
    return this.db.add(PENDING_UPLOADS_STORE, {
      ...data,
      timestamp: Date.now(),
      synced: false
    });
  }

  async getPendingUploads() {
    if (!this.db) await this.initDB();
    return this.db.getAll(PENDING_UPLOADS_STORE);
  }

  async markUploadSynced(id) {
    if (!this.db) await this.initDB();
    const upload = await this.db.get(PENDING_UPLOADS_STORE, id);
    if (upload) {
      upload.synced = true;
      await this.db.put(PENDING_UPLOADS_STORE, upload);
    }
  }

  async deletePendingUpload(id) {
    if (!this.db) await this.initDB();
    return this.db.delete(PENDING_UPLOADS_STORE, id);
  }

  async clearSyncedUploads() {
    if (!this.db) await this.initDB();
    const uploads = await this.getPendingUploads();
    const syncedUploads = uploads.filter(upload => upload.synced);
    await Promise.all(
      syncedUploads.map(upload => this.deletePendingUpload(upload.id))
    );
  }
}

export const offlineService = new OfflineService();