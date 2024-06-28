import request from 'supertest';
import { app } from '../server';
import Role from '../database/models/role';
import Permission from '../database/models/permission';
import sequelize from '../database/models/index';
import logger from '../logs/config';

jest.mock('../src/database/models/role');
jest.mock('../src/database/models/permission');
jest.mock('../src/database/models/index');
jest.mock('../src/logs/config');

beforeEach(() => {
  jest.clearAllMocks();
});

afterAll(async () => {
  await sequelize.close();
});

// create Role
describe('POST /roles', () => {
  it('should create a role with valid data', async () => {
    const permissionIds = [1, 2];
    const permissions = [
      { id: 1, name: 'create_user' },
      { id: 2, name: 'delete_user' },
    ];

    (Permission.findAll as jest.Mock).mockResolvedValue(permissions);
    (Role.create as jest.Mock).mockResolvedValue({
      id: 1,
      name: 'Admin',
      addPermissions: jest.fn().mockResolvedValue(null),
    });

    const res = await request(app).post('/roles').send({ name: 'Admin', permissionIds });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ ok: true, message: 'Role created successfully' });
    expect(Role.create).toHaveBeenCalledWith({ name: 'Admin' }, expect.anything());
  });

  it('should return 400 if required fields are missing', async () => {
    const res = await request(app).post('/roles').send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ ok: false, message: 'Required fields: name, permissionIds' });
  });

  it('should return 404 if one or more permissions are not found', async () => {
    const permissionIds = [1, 2];
    (Permission.findAll as jest.Mock).mockResolvedValue([{ id: 1, name: 'create_user' }]); // only one permission found

    const res = await request(app).post('/roles').send({ name: 'Admin', permissionIds });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ ok: false, message: 'Roles create permissions not found' });
  });
});
//  get all Roles
describe('GET /roles', () => {
  it('should return all roles', async () => {
    const roles = [{ id: 1, name: 'Admin', permissions: [{ name: 'create_user' }] }];
    (Role.findAll as jest.Mock).mockResolvedValue(roles);

    const res = await request(app).get('/roles');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, data: roles });
  });

  it('should return 500 if an error occurs', async () => {
    (Role.findAll as jest.Mock).mockRejectedValue(new Error('Database error'));

    const res = await request(app).get('/roles');

    expect(res.status).toBe(500);
    expect(logger.error).toHaveBeenCalledWith(expect.any(Error));
  });
});
// get a single Role
describe('GET /roles/:id', () => {
  it('should return a single role by ID', async () => {
    const role = { id: 1, name: 'Admin', permissions: [{ name: 'create_user' }] };
    (Role.findByPk as jest.Mock).mockResolvedValue(role);

    const res = await request(app).get('/roles/1');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, data: role });
  });

  it('should return 404 if role is not found', async () => {
    (Role.findByPk as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/roles/1');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ ok: false, message: 'Roles can not be found' });
  });

  it('should return 500 if an error occurs', async () => {
    (Role.findByPk as jest.Mock).mockRejectedValue(new Error('Database error'));

    const res = await request(app).get('/roles/1');

    expect(res.status).toBe(500);
    expect(logger.error).toHaveBeenCalledWith(expect.any(Error));
  });
});
// update a Role
describe('PUT /roles/:id', () => {
  it('should update a role with valid data', async () => {
    const role = { id: 1, name: 'Admin', setPermissions: jest.fn(), save: jest.fn() };
    (Role.findByPk as jest.Mock).mockResolvedValue(role);

    const res = await request(app)
      .put('/roles/1')
      .send({ name: 'Super Admin', permissionIds: [1, 2] });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, message: 'role updated successfully' });
    expect(role.save).toHaveBeenCalled();
    expect(role.setPermissions).toHaveBeenCalledWith([1, 2], expect.anything());
  });

  it('should return 404 if role is not found', async () => {
    (Role.findByPk as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .put('/roles/1')
      .send({ name: 'Super Admin', permissionIds: [1, 2] });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ ok: false, errorMessage: 'Role not found' });
  });

  it('should return 400 if required fields are missing', async () => {
    const res = await request(app).put('/roles/1').send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ ok: false, errorMessage: 'the required fields: name, permissionIds' });
  });

  it('should return 500 if an error occurs', async () => {
    (Role.findByPk as jest.Mock).mockRejectedValue(new Error('Database error'));

    const res = await request(app)
      .put('/roles/1')
      .send({ name: 'Super Admin', permissionIds: [1, 2] });

    expect(res.status).toBe(500);
    expect(logger.error).toHaveBeenCalledWith(expect.any(Error));
  });
});
// delete a Role
describe('DELETE /roles/:id', () => {
  it('should delete a role by ID', async () => {
    (Role.destroy as jest.Mock).mockResolvedValue(1); // returns the number of deleted records

    const res = await request(app).delete('/roles/1');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, message: 'Role deleted successfully' });
  });

  it('should return 404 if role is not found', async () => {
    (Role.destroy as jest.Mock).mockResolvedValue(0);

    const res = await request(app).delete('/roles/1');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ ok: false, message: 'Role not found' });
  });

  it('should return 500 if an error occurs', async () => {
    (Role.destroy as jest.Mock).mockRejectedValue(new Error('Database error'));

    const res = await request(app).delete('/roles/1');

    expect(res.status).toBe(500);
    expect(logger.error).toHaveBeenCalledWith(expect.any(Error));
  });
});
