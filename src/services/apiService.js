import { supabase } from '../config/supabase';

class ApiService {
  constructor() {
    // No need for axios client anymore, using Supabase directly
  }

  setAuthToken(token) {
    // Supabase handles auth automatically
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
    // Supabase handles token refresh automatically
  }

  async getWorkOrders(params = {}) {
    try {
      let query = supabase
        .from('work_orders')
        .select(`
          *,
          workers!work_orders_assigned_worker_fkey (
            id,
            name,
            email
          )
        `);

      // Filter by assigned worker
      if (params.assignedTo) {
        query = query.eq('assigned_worker', params.assignedTo);
      }

      // Filter by status
      if (params.status) {
        query = query.eq('status', params.status);
      }

      // Order by scheduled date
      query = query.order('scheduled_date', { ascending: true, nullsFirst: false });

      const { data, error } = await query;

      if (error) throw error;

      // Transform data to match existing format
      const workOrders = data.map(order => ({
        id: order.id,
        workOrderNumber: order.id.substring(0, 8),
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
      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          *,
          workers!work_orders_assigned_worker_fkey (
            id,
            name,
            email,
            phone
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Transform data to match existing format
      const workOrder = {
        id: data.id,
        workOrderNumber: data.id.substring(0, 8),
        title: data.title,
        description: data.description,
        customerName: data.customer_name,
        customer: {
          name: data.customer_name,
          email: data.customer_email,
          phone: data.customer_phone,
        },
        address: data.address,
        priority: data.priority,
        status: data.status,
        assignedWorker: data.workers ? {
          id: data.workers.id,
          name: data.workers.name,
          email: data.workers.email,
          phone: data.workers.phone,
        } : null,
        estimatedHours: data.estimated_hours,
        hourlyRate: data.hourly_rate,
        materialCosts: data.material_costs,
        totalCost: data.total_cost,
        scheduledDate: data.scheduled_date,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        notes: data.notes,
      };

      return { data: workOrder };
    } catch (error) {
      console.error('Error fetching work order:', error);
      throw error;
    }
  }

  async updateWorkOrder(id, updateData) {
    try {
      // Transform data to match database schema
      const dbData = {};

      if (updateData.status) dbData.status = updateData.status;
      if (updateData.notes) dbData.notes = updateData.notes;
      if (updateData.description) dbData.description = updateData.description;
      if (updateData.estimatedHours) dbData.estimated_hours = updateData.estimatedHours;
      if (updateData.materialCosts) dbData.material_costs = updateData.materialCosts;

      // Always update the updated_at timestamp
      dbData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('work_orders')
        .update(dbData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { data };
    } catch (error) {
      console.error('Error updating work order:', error);
      throw error;
    }
  }

  async uploadPhoto(file) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `work-order-photos/${fileName}`;

      const { data, error } = await supabase.storage
        .from('photos')
        .upload(filePath, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);

      return {
        data: {
          url: publicUrl,
          path: filePath
        }
      };
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }
  }

  async submitTaskCompletion(workOrderId, completionData) {
    try {
      // Update work order status to completed
      const { error } = await supabase
        .from('work_orders')
        .update({
          status: 'completed',
          notes: completionData.notes || '',
          updated_at: new Date().toISOString(),
        })
        .eq('id', workOrderId);

      if (error) throw error;

      return { data: { success: true } };
    } catch (error) {
      console.error('Error submitting task completion:', error);
      throw error;
    }
  }

  async getWorker(workerId) {
    try {
      const { data, error } = await supabase
        .from('workers')
        .select('*')
        .eq('id', workerId)
        .single();

      if (error) throw error;

      return { data };
    } catch (error) {
      console.error('Error fetching worker:', error);
      throw error;
    }
  }

  async getWorkerByEmail(email) {
    try {
      const { data, error } = await supabase
        .from('workers')
        .select('*')
        .eq('email', email)
        .single();

      if (error) throw error;

      return { data };
    } catch (error) {
      console.error('Error fetching worker by email:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();