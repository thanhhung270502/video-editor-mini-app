import { describe, expect, it } from '@jest/globals';
import request from 'supertest';
import { createApp } from './app';

describe('Health API', () => {
  const app = createApp();

  it('GET /api/health returns 200 with success payload', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('API is running');
    expect(res.body.timestamp).toBeDefined();
  });
});

describe('404 handler', () => {
  const app = createApp();

  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/unknown-route');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('not found');
  });
});

describe('Example module', () => {
  const app = createApp();

  it('GET /api/example returns success', async () => {
    const res = await request(app).get('/api/example');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Example module');
  });
});
