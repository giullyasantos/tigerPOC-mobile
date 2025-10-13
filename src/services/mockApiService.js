// Mock API service for development/demo purposes
const DEMO_USERS = [
  {
    id: '1',
    email: 'worker1@example.com',
    password: 'password123',
    username: 'John Worker',
    role: 'worker'
  },
  {
    id: '2',
    email: 'worker2@example.com',
    password: 'password123',
    username: 'Jane Worker',
    role: 'worker'
  },
  {
    id: '3',
    email: 'worker3@example.com',
    password: 'password123',
    username: 'Mike Worker',
    role: 'worker'
  }
];

const DEMO_WORK_ORDERS = [
  {
    id: '1',
    workOrderNumber: 'WO-2024-001',
    status: 'assigned',
    description: 'Replace broken water heater and inspect plumbing connections.',
    customerName: 'ABC Company',
    address: '123 Main St, Anytown, ST 12345',
    scheduledDate: '2024-01-15T10:00:00Z',
    priority: 'high',
    customerPhone: '(555) 123-4567',
    notes: 'Customer reports no hot water since yesterday. Check for leaks.'
  },
  {
    id: '2',
    workOrderNumber: 'WO-2024-002',
    status: 'in-progress',
    description: 'Annual HVAC maintenance and filter replacement.',
    customerName: 'XYZ Corporation',
    address: '456 Oak Ave, Somewhere, ST 67890',
    scheduledDate: '2024-01-15T14:00:00Z',
    priority: 'medium',
    customerPhone: '(555) 987-6543',
    startedAt: '2024-01-15T14:15:00Z'
  },
  {
    id: '3',
    workOrderNumber: 'WO-2024-003',
    status: 'completed',
    description: 'Install new security camera system.',
    customerName: 'Tech Startup Inc',
    address: '789 Pine Rd, Elsewhere, ST 11111',
    scheduledDate: '2024-01-14T09:00:00Z',
    priority: 'low',
    customerPhone: '(555) 456-7890',
    startedAt: '2024-01-14T09:00:00Z',
    completedAt: '2024-01-14T11:30:00Z',
    completionNotes: 'Successfully installed 4 cameras and configured monitoring system.'
  }
];

class MockApiService {
  constructor() {
    this.isOnline = true;
    this.simulateNetworkDelay = true;
  }

  async delay(ms = 500) {
    if (this.simulateNetworkDelay) {
      await new Promise(resolve => setTimeout(resolve, ms));
    }
  }

  setAuthToken(token) {
    // Mock implementation - just store token
    if (token) {
      localStorage.setItem('mockAuthToken', token);
    } else {
      localStorage.removeItem('mockAuthToken');
    }
  }

  async login(email, password) {
    await this.delay();

    const user = DEMO_USERS.find(u => u.email === email && u.password === password);

    if (!user) {
      const error = new Error('Invalid email or password');
      error.response = {
        status: 401,
        data: { message: 'Invalid email or password' }
      };
      throw error;
    }

    const accessToken = `mock-token-${user.id}-${Date.now()}`;
    const refreshToken = `mock-refresh-${user.id}-${Date.now()}`;

    return {
      data: {
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          createdAt: '2024-01-01T00:00:00Z',
          isActive: true
        },
        accessToken,
        refreshToken,
        expiresIn: '1h'
      }
    };
  }

  async logout() {
    await this.delay(200);
    localStorage.removeItem('mockAuthToken');
    return { data: { message: 'Logout successful' } };
  }

  async refreshToken(refreshToken) {
    await this.delay(200);

    // Extract user ID from refresh token
    const userId = refreshToken.split('-')[2];
    const user = DEMO_USERS.find(u => u.id === userId);

    if (!user) {
      throw new Error('Invalid refresh token');
    }

    const accessToken = `mock-token-${user.id}-${Date.now()}`;

    return {
      data: {
        accessToken,
        expiresIn: '1h'
      }
    };
  }

  async getWorkOrders(params = {}) {
    await this.delay();

    let workOrders = [...DEMO_WORK_ORDERS];

    // Filter by status
    if (params.status && params.status !== 'all') {
      if (params.status === 'assigned') {
        workOrders = workOrders.filter(wo =>
          wo.status === 'assigned' || wo.status === 'in-progress'
        );
      } else {
        workOrders = workOrders.filter(wo => wo.status === params.status);
      }
    }

    // Filter by assigned worker (in real app, this would filter by user ID)
    if (params.assignedTo) {
      // For demo, just return all orders
    }

    return {
      data: {
        workOrders,
        total: workOrders.length,
        page: 1,
        totalPages: 1
      }
    };
  }

  async getWorkOrder(id) {
    await this.delay();

    const workOrder = DEMO_WORK_ORDERS.find(wo => wo.id === id);

    if (!workOrder) {
      throw new Error('Work order not found');
    }

    return { data: workOrder };
  }

  async updateWorkOrder(id, data) {
    await this.delay();

    const workOrderIndex = DEMO_WORK_ORDERS.findIndex(wo => wo.id === id);

    if (workOrderIndex === -1) {
      throw new Error('Work order not found');
    }

    DEMO_WORK_ORDERS[workOrderIndex] = {
      ...DEMO_WORK_ORDERS[workOrderIndex],
      ...data,
      updatedAt: new Date().toISOString()
    };

    return { data: DEMO_WORK_ORDERS[workOrderIndex] };
  }

  async uploadPhoto(file) {
    await this.delay(1000);

    // Mock photo upload - return a fake URL
    const mockUrl = `https://demo-storage.example.com/photos/${Date.now()}-${file.name}`;

    return {
      data: {
        url: mockUrl,
        filename: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString()
      }
    };
  }

  async submitTaskCompletion(workOrderId, data) {
    await this.delay(800);

    const workOrderIndex = DEMO_WORK_ORDERS.findIndex(wo => wo.id === workOrderId);

    if (workOrderIndex === -1) {
      throw new Error('Work order not found');
    }

    // Mock photo uploads
    let beforePhotos = [];
    let afterPhotos = [];

    if (data.beforePhotos) {
      beforePhotos = await Promise.all(
        data.beforePhotos.map(async (photo) => {
          const upload = await this.uploadPhoto(photo.file);
          return {
            ...photo,
            url: upload.data.url,
            uploaded: true
          };
        })
      );
    }

    if (data.afterPhotos) {
      afterPhotos = await Promise.all(
        data.afterPhotos.map(async (photo) => {
          const upload = await this.uploadPhoto(photo.file);
          return {
            ...photo,
            url: upload.data.url,
            uploaded: true
          };
        })
      );
    }

    DEMO_WORK_ORDERS[workOrderIndex] = {
      ...DEMO_WORK_ORDERS[workOrderIndex],
      status: data.status || 'completed',
      completedAt: new Date().toISOString(),
      completionNotes: data.notes,
      beforePhotos,
      afterPhotos
    };

    return {
      data: {
        message: 'Task completed successfully',
        workOrder: DEMO_WORK_ORDERS[workOrderIndex]
      }
    };
  }
}

export const mockApiService = new MockApiService();