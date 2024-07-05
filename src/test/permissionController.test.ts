import { Request, Response, NextFunction } from 'express';
import * as controller from '../controllers/permissionController';
import { isAuthenticated, checkUserRoles } from '../middlewares/authMiddlewares';
import Permission from '../database/models/permission';

jest.mock('../database/models/permission', () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
  destroy: jest.fn(),
  findOne: jest.fn(),
}));
jest.mock('../middlewares/authMiddlewares', () => ({
  isAuthenticated: jest.fn(),
  checkUserRoles: jest.fn(),
}));
describe('Permission Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/permissions', () => {
    describe('given a valid request body it should create permission and return 201', () => {
      it('should create a permission', async () => {
        const mockCreatedPermission = { id: 1, name: 'testPermission' };
        const mockReq = { body: { name: 'testPermission' } };
        const mockRes: Partial<Response> = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
        const mockNext: NextFunction = jest.fn();
        (isAuthenticated as jest.Mock).mockImplementation((req, res, next) => {
          req.user = { Role: { name: 'admin' } }; // Simulating admin user
          next();
        });
        (Permission.create as jest.Mock).mockResolvedValue(mockCreatedPermission);

        await controller.createPermission(mockReq as Request, mockRes as unknown as Response);

        expect(mockRes.status).toHaveBeenCalledWith(201);
        expect(mockRes.json).toHaveBeenCalledWith({
          ok: true,
          data: mockCreatedPermission,
        });
      });
    });
    it('should handle missing required fields', async () => {
      const mockReq = { body: {} };
      const mockRes: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.createPermission(mockReq as Request, mockRes as unknown as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        ok: false,
        errorMessage: 'Missing required fields: name',
      });
    });
    it('should handle errors', async () => {
      const mockReq = { body: { name: 'testPermission' } };
      const mockError = new Error('Test error');
      (Permission.create as jest.Mock).mockRejectedValue(mockError);

      await controller.createPermission(mockReq as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toBeTruthy();
    });
  });

  describe('GET /api/permissions', () => {
    it('should get all permissions', async () => {
      const mockPermissions = [
        { id: 1, name: 'Permission 1' },
        { id: 2, name: 'Permission 2' },
      ];
      const mockReq = {};
      const mockRes: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      (Permission.findAll as jest.Mock).mockResolvedValue(mockPermissions);

      await controller.getAllPermissions(mockReq as Request, mockRes as unknown as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        ok: true,
        data: mockPermissions,
      });
    });

    it('should handle errors', async () => {
      const mockReq = {};
      const mockError = new Error('Test error');
      (Permission.findAll as jest.Mock).mockRejectedValue(mockError);

      await controller.getAllPermissions(mockReq as Request, res as unknown as Response);

      expect(res.status).toHaveBeenCalledWith(500);

      expect(res.json).toBeTruthy();
    });
  });
  describe('UPDATE /api/permisions/:id', () => {
    it('should update a permission', async () => {
      const mockPermissionToUpdate = {
        id: 1,
        name: 'Permission 1',
        save: jest.fn().mockResolvedValue(true),
      };
      const mockReq = {
        params: { id: '1' },
        body: { name: 'Updated Permission Name' },
      };
      const mockRes: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      (Permission.findByPk as jest.Mock).mockResolvedValue(mockPermissionToUpdate);

      await controller.updatePermission(mockReq as unknown as Request, mockRes as unknown as Response);

      expect(mockPermissionToUpdate.name).toEqual('Updated Permission Name');
      expect((mockPermissionToUpdate as any).save).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        ok: true,
        data: mockPermissionToUpdate,
      });
    });

    it('should handle permission not found', async () => {
      const mockReq = {
        params: { id: '999' },
        body: { name: 'Updated Permission Name' },
      };
      const mockRes: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      (Permission.findByPk as jest.Mock).mockResolvedValue(null);

      await controller.updatePermission(mockReq as unknown as Request, mockRes as unknown as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        ok: false,
        errorMessage: 'Permission not found',
      });
    });

    it('should handle missing name in request body', async () => {
      const mockReq = { params: { id: '1' }, body: {} };
      const mockRes: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockPermissionToUpdate = { id: 1, name: 'Permission 1' };
      (Permission.findByPk as jest.Mock).mockResolvedValue(mockPermissionToUpdate);

      await controller.updatePermission(mockReq as unknown as Request, mockRes as unknown as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should handle errors', async () => {
      const mockError = new Error('Test error');
      (Permission.findByPk as jest.Mock).mockRejectedValue(mockError);

      await controller.updatePermission(req as Request, res as unknown as Response);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
  describe('DELETE /api/permissions/:id', () => {
    it('should delete a permission', async () => {
      const mockPermissionToDelete = {
        id: 1,
        name: 'Permission 1',
        destroy: jest.fn().mockResolvedValue(true),
      };
      const mockReq = { params: { id: '1' } };
      const mockRes: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      (Permission.findByPk as jest.Mock).mockResolvedValue(mockPermissionToDelete);

      await controller.deletePermission(mockReq as unknown as Request, mockRes as unknown as Response);

      expect((mockPermissionToDelete as any).destroy).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        ok: true,
        message: 'permission deleted successfully!',
      });
    });

    it('should handle permission not found', async () => {
      const mockReq = { params: { id: '999' } };
      const mockRes: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      (Permission.findByPk as jest.Mock).mockResolvedValue(null);

      await controller.deletePermission(mockReq as unknown as Request, mockRes as unknown as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        ok: false,
        errorMessage: 'Permission not found',
      });
    });

    it('should handle errors', async () => {
      const mockError = new Error('Test error');
      (Permission.findByPk as jest.Mock).mockRejectedValue(mockError);

      await controller.deletePermission(req as Request, res as unknown as Response);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('GET /api/permissions/:id', () => {
    it('should get a single permission', async () => {
      const mockPermission = { id: 1, name: 'Permission 1' };
      const mockReq = { params: { id: '1' } };
      const mockRes: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      (Permission.findByPk as jest.Mock).mockResolvedValue(mockPermission);

      await controller.getSinglePermission(mockReq as unknown as Request, mockRes as unknown as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should handle permission not found', async () => {
      const mockReq = { params: { id: '999' } };
      const mockRes: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      (Permission.findByPk as jest.Mock).mockResolvedValue(null);

      await controller.getSinglePermission(mockReq as unknown as Request, mockRes as unknown as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        ok: false,
        errorMessage: 'Permission not found',
      });
    });

    it('should handle errors', async () => {
      const mockError = new Error('Test error');
      (Permission.findByPk as jest.Mock).mockRejectedValue(mockError);

      await controller.getSinglePermission(req as Request, res as unknown as Response);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
