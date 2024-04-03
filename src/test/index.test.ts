import request, { Response } from 'supertest';
import app from '../server';

describe('Test Express App', () => {
  it('responds with welcome message at /', async () => {
    const response: Response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toEqual('Welcome at Mavericks E-commerce Website Apis');
  });
});
