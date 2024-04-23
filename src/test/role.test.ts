import request from 'supertest';
import app from '../server';

describe('POST /role', () => {
  it('should successfully create the role ', async () => {
    const result = await request(app).get('/api/role');
  });
});
