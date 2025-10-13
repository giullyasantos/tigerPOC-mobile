import { apiService } from './apiService';
import { offlineService } from './offlineService';

class SyncService {
  constructor() {
    this.isOnline = navigator.onLine;
    this.syncInProgress = false;
    this.syncListeners = [];

    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncWhenOnline();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  addSyncListener(callback) {
    this.syncListeners.push(callback);
  }

  removeSyncListener(callback) {
    this.syncListeners = this.syncListeners.filter(listener => listener !== callback);
  }

  notifyListeners(event, data) {
    this.syncListeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        console.error('Sync listener error:', error);
      }
    });
  }

  async syncWhenOnline() {
    if (!this.isOnline || this.syncInProgress) {
      return;
    }

    this.syncInProgress = true;
    this.notifyListeners('sync_started');

    try {
      await this.syncPendingUploads();
      await this.syncWorkOrders();
      this.notifyListeners('sync_completed');
    } catch (error) {
      console.error('Sync failed:', error);
      this.notifyListeners('sync_failed', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  async syncPendingUploads() {
    const pendingUploads = await offlineService.getPendingUploads();
    const unsyncedUploads = pendingUploads.filter(upload => !upload.synced);

    if (unsyncedUploads.length === 0) {
      return;
    }

    console.log(`Syncing ${unsyncedUploads.length} pending uploads...`);

    for (const upload of unsyncedUploads) {
      try {
        await this.syncUpload(upload);
        await offlineService.markUploadSynced(upload.id);
        this.notifyListeners('upload_synced', upload);
      } catch (error) {
        console.error(`Failed to sync upload ${upload.id}:`, error);
        this.notifyListeners('upload_sync_failed', { upload, error });
      }
    }

    await offlineService.clearSyncedUploads();
  }

  async syncUpload(upload) {
    switch (upload.type) {
      case 'task_completion':
        return this.syncTaskCompletion(upload);
      case 'status_update':
        return this.syncStatusUpdate(upload);
      case 'photo_upload':
        return this.syncPhotoUpload(upload);
      default:
        throw new Error(`Unknown upload type: ${upload.type}`);
    }
  }

  async syncTaskCompletion(upload) {
    const { workOrderId, data } = upload;

    if (data.beforePhotos && data.beforePhotos.length > 0) {
      data.beforePhotos = await this.uploadPhotos(data.beforePhotos);
    }

    if (data.afterPhotos && data.afterPhotos.length > 0) {
      data.afterPhotos = await this.uploadPhotos(data.afterPhotos);
    }

    await apiService.submitTaskCompletion(workOrderId, data);
  }

  async syncStatusUpdate(upload) {
    const { workOrderId, data } = upload;
    await apiService.updateWorkOrder(workOrderId, data);
  }

  async syncPhotoUpload(upload) {
    const { data } = upload;
    const response = await apiService.uploadPhoto(data.file);
    return response.data;
  }

  async uploadPhotos(photos) {
    const uploadedPhotos = [];

    for (const photo of photos) {
      try {
        const response = await apiService.uploadPhoto(photo.file);
        uploadedPhotos.push({
          ...photo,
          url: response.data.url,
          uploaded: true
        });
      } catch (error) {
        console.error('Failed to upload photo:', error);
        uploadedPhotos.push({
          ...photo,
          uploaded: false,
          error: error.message
        });
      }
    }

    return uploadedPhotos;
  }

  async syncWorkOrders() {
    try {
      const response = await apiService.getWorkOrders();
      const workOrders = response.data.workOrders || response.data;
      await offlineService.saveWorkOrders(workOrders);
      this.notifyListeners('workorders_synced', workOrders);
    } catch (error) {
      console.error('Failed to sync work orders:', error);
      throw error;
    }
  }

  async forceSyncWorkOrders() {
    if (!this.isOnline) {
      throw new Error('Cannot sync while offline');
    }

    await this.syncWorkOrders();
  }

  async queueForSync(type, workOrderId, data) {
    await offlineService.savePendingUpload({
      type,
      workOrderId,
      data
    });

    if (this.isOnline) {
      setTimeout(() => this.syncWhenOnline(), 1000);
    }
  }

  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      syncInProgress: this.syncInProgress
    };
  }

  async getPendingSyncCount() {
    const pendingUploads = await offlineService.getPendingUploads();
    return pendingUploads.filter(upload => !upload.synced).length;
  }
}

export const syncService = new SyncService();