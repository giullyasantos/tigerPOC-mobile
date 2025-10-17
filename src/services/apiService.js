import { API_ENDPOINTS } from '../config/api';

class ApiService {
  constructor() {
    // Using Railway backend API
  }

  getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  setAuthToken(token) {
    localStorage.setItem('accessToken', token);
  }

  async login(email, password) {
    // This is now handled by AuthContext
    throw new Error('Use AuthContext login instead');
  }

  async logout() {
    // This is now handled by AuthContext
    throw new Error('Use AuthContext logout instead');
  }

  async refreshToken(refreshToken) {
    // This is now handled by AuthContext
    throw new Error('Use AuthContext refresh instead');
  }

  async getWorkOrders(params = {}) {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();

      if (params.assignedTo) {
        queryParams.append('assignedWorker', params.assignedTo);
      }

      if (params.status) {
        queryParams.append('status', params.status);
      }

      const url = `${API_ENDPOINTS.WORK_ORDERS.BASE}?${queryParams.toString()}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();

      // Transform data to match existing format
      const workOrders = (data.workOrders || data.data || data).map(order => ({
        id: order.id,
        workOrderNumber: order.work_order_number || order.id.substring(0, 8),
        title: order.title,
        description: order.description,
        customerName: order.customer_name,
        customer: {
          name: order.customer_name,
          email: order.customer_email,
          phone: order.customer_phone,
        },
        address: order.address,
        priority: order.priority,
        status: order.status,
        assignedWorker: order.workers ? {
          id: order.workers.id,
          name: order.workers.name,
          email: order.workers.email,
        } : null,
        estimatedHours: order.estimated_hours,
        scheduledDate: order.scheduled_date,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        notes: order.notes,
      }));

      return { data: workOrders };
    } catch (error) {
      console.error('Error fetching work orders:', error);
      throw error;
    }
  }

  async getWorkOrder(id) {
    try {
      const response = await fetch(API_ENDPOINTS.WORK_ORDERS.BY_ID(id), {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const order = data.workOrder || data;

      // Transform data to match existing format
      const workOrder = {
        id: order.id,
        workOrderNumber: order.work_order_number || order.id.substring(0, 8),
        title: order.title,
        description: order.description,
        customerName: order.customer_name,
        customer: {
          name: order.customer_name,
          email: order.customer_email,
          phone: order.customer_phone,
        },
        address: order.address,
        priority: order.priority,
        status: order.status,
        assignedWorker: order.workers ? {
          id: order.workers.id,
          name: order.workers.name,
          email: order.workers.email,
          phone: order.workers.phone,
        } : null,
        estimatedHours: order.estimated_hours,
        hourlyRate: order.hourly_rate,
        materialCosts: order.material_costs,
        totalCost: order.total_cost,
        scheduledDate: order.scheduled_date,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        notes: order.notes,
      };

      return { data: workOrder };
    } catch (error) {
      console.error('Error fetching work order:', error);
      throw error;
    }
  }

  async updateWorkOrder(id, updateData) {
    try {
      const response = await fetch(API_ENDPOINTS.WORK_ORDERS.BY_ID(id), {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Error updating work order:', error);
      throw error;
    }
  }

  async uploadPhoto(file) {
    try {
      // For now, return a placeholder - we'll implement photo upload later
      console.warn('Photo upload not yet implemented with Railway backend');
      return {
        data: {
          url: URL.createObjectURL(file),
          path: file.name
        }
      };
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }
  }

  async submitTaskCompletion(workOrderId, completionData) {
    try {
      return await this.updateWorkOrder(workOrderId, {
        status: 'completed',
        notes: completionData.notes || '',
      });
    } catch (error) {
      console.error('Error submitting task completion:', error);
      throw error;
    }
  }

  async getWorker(workerId) {
    try {
      // Not needed for mobile app - using AuthContext user data
      throw new Error('Use AuthContext user instead');
    } catch (error) {
      console.error('Error fetching worker:', error);
      throw error;
    }
  }

  async getWorkerByEmail(email) {
    try {
      // Not needed for mobile app - using AuthContext user data
      throw new Error('Use AuthContext user instead');
    } catch (error) {
      console.error('Error fetching worker by email:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();