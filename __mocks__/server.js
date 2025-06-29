/**
 * Mock Service Worker (MSW) Server Setup
 * Used for mocking API requests in tests
 */

import { setupServer } from 'msw/node';
import { rest } from 'msw';

// Define request handlers
const handlers = [
  // Auth endpoints
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            role: 'user',
          },
          token: 'mock-jwt-token',
        },
      })
    );
  }),

  rest.post('/api/auth/register', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        data: {
          user: {
            id: '2',
            email: 'newuser@example.com',
            name: 'New User',
            role: 'user',
          },
          token: 'mock-jwt-token',
        },
      })
    );
  }),

  rest.post('/api/auth/logout', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'Logged out successfully',
      })
    );
  }),

  rest.get('/api/auth/me', (req, res, ctx) => {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res(
        ctx.status(401),
        ctx.json({
          success: false,
          error: 'Unauthorized',
        })
      );
    }

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            role: 'user',
          },
        },
      })
    );
  }),

  // Training endpoints
  rest.get('/api/training/sessions', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          sessions: [
            {
              id: '1',
              name: 'Test Training Session',
              status: 'active',
              participants: 5,
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z',
            },
            {
              id: '2',
              name: 'Another Training Session',
              status: 'completed',
              participants: 3,
              createdAt: '2024-01-02T00:00:00Z',
              updatedAt: '2024-01-02T00:00:00Z',
            },
          ],
          total: 2,
          page: 1,
          limit: 10,
        },
      })
    );
  }),

  rest.post('/api/training/sessions', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        data: {
          session: {
            id: '3',
            name: 'New Training Session',
            status: 'pending',
            participants: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
      })
    );
  }),

  rest.get('/api/training/sessions/:id', (req, res, ctx) => {
    const { id } = req.params;
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          session: {
            id,
            name: `Training Session ${id}`,
            status: 'active',
            participants: 5,
            description: 'A test training session',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        },
      })
    );
  }),

  // Model endpoints
  rest.get('/api/models', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          models: [
            {
              id: '1',
              name: 'Test Model',
              type: 'classification',
              status: 'trained',
              accuracy: 0.95,
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z',
            },
            {
              id: '2',
              name: 'Another Model',
              type: 'regression',
              status: 'training',
              accuracy: 0.87,
              createdAt: '2024-01-02T00:00:00Z',
              updatedAt: '2024-01-02T00:00:00Z',
            },
          ],
          total: 2,
          page: 1,
          limit: 10,
        },
      })
    );
  }),

  rest.post('/api/models', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        data: {
          model: {
            id: '3',
            name: 'New Model',
            type: 'classification',
            status: 'pending',
            accuracy: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
      })
    );
  }),

  // Blockchain endpoints
  rest.get('/api/blockchain/account/:address', (req, res, ctx) => {
    const { address } = req.params;
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          account: {
            address,
            balance: '1000000000', // 10 APT
            sequence_number: '5',
            authentication_key: address,
          },
        },
      })
    );
  }),

  rest.post('/api/blockchain/transaction', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          transaction: {
            hash: '0x1234567890abcdef',
            sender: '0xtest_sender',
            sequence_number: '6',
            max_gas_amount: '1000',
            gas_unit_price: '100',
            gas_used: '500',
            success: true,
            vm_status: 'Executed successfully',
            timestamp: new Date().toISOString(),
          },
        },
      })
    );
  }),

  // File upload endpoints
  rest.post('/api/upload', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          file: {
            id: 'file_123',
            name: 'test-file.csv',
            size: 1024,
            type: 'text/csv',
            url: 'https://example.com/files/test-file.csv',
            uploadedAt: new Date().toISOString(),
          },
        },
      })
    );
  }),

  // Analytics endpoints
  rest.get('/api/analytics/dashboard', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          stats: {
            totalSessions: 25,
            activeSessions: 5,
            totalModels: 12,
            trainedModels: 8,
            totalUsers: 150,
            activeUsers: 45,
          },
          charts: {
            sessionsOverTime: [
              { date: '2024-01-01', count: 5 },
              { date: '2024-01-02', count: 8 },
              { date: '2024-01-03', count: 12 },
            ],
            modelAccuracy: [
              { model: 'Model A', accuracy: 0.95 },
              { model: 'Model B', accuracy: 0.87 },
              { model: 'Model C', accuracy: 0.92 },
            ],
          },
        },
      })
    );
  }),

  // Error handling
  rest.get('/api/error/500', (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        success: false,
        error: 'Internal Server Error',
        message: 'Something went wrong on the server',
      })
    );
  }),

  rest.get('/api/error/404', (req, res, ctx) => {
    return res(
      ctx.status(404),
      ctx.json({
        success: false,
        error: 'Not Found',
        message: 'The requested resource was not found',
      })
    );
  }),

  // Catch-all handler for unhandled requests
  rest.all('*', (req, res, ctx) => {
    console.warn(`Unhandled ${req.method} request to ${req.url}`);
    return res(
      ctx.status(404),
      ctx.json({
        success: false,
        error: 'Not Found',
        message: `No handler found for ${req.method} ${req.url}`,
      })
    );
  }),
];

// Create and export the server
export const server = setupServer(...handlers);

// Export handlers for individual test customization
export { handlers };

// Helper functions for tests
export const mockApiResponse = (endpoint, response, status = 200) => {
  return rest.get(endpoint, (req, res, ctx) => {
    return res(ctx.status(status), ctx.json(response));
  });
};

export const mockApiError = (endpoint, error, status = 500) => {
  return rest.get(endpoint, (req, res, ctx) => {
    return res(
      ctx.status(status),
      ctx.json({
        success: false,
        error: error.name || 'Error',
        message: error.message || 'An error occurred',
      })
    );
  });
};

export const resetHandlers = () => {
  server.resetHandlers(...handlers);
};

export const addHandler = (handler) => {
  server.use(handler);
};

export const removeHandler = (endpoint) => {
  const filteredHandlers = handlers.filter(
    (handler) => !handler.info.path.includes(endpoint)
  );
  server.resetHandlers(...filteredHandlers);
};