import { Request, Response } from 'express';
import { Product } from '../database/models/Product';
import uploadImage from '../helpers/claudinary';
import { sendInternalErrorResponse } from '../validations';
import { createProduct } from '../controllers/productsController';

jest.mock('../database/models/Product');
jest.mock('../helpers/claudinary');
jest.mock('../validations');

describe('Product CRUD', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      body: {
        name: 'Test Product',
        description: 'Test Description',
        colors: ['red', 'blue'],
      },
      params: {
        categoryId: '1',
      },
      user: Promise.resolve({ id: '123', roles: ['seller'] }),
      files: [
        { buffer: Buffer.from('image1') },
        { buffer: Buffer.from('image2') },
        { buffer: Buffer.from('image3') },
        { buffer: Buffer.from('image4') },
      ],
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if the product already exists', async () => {
    (Product.findOne as jest.Mock).mockResolvedValueOnce(true);

    await createProduct(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      message: 'This Product already exists, You can update the stock levels instead.',
      data: true,
    });
  });

  it('should return 400 if less than 4 images are provided', async () => {
    req.files = [{ buffer: Buffer.from('image1') }, { buffer: Buffer.from('image2') }];

    await createProduct(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Product should have at least 4 images',
    });
  });

  it('should create a product successfully', async () => {
    (Product.findOne as jest.Mock).mockResolvedValueOnce(false);
    (uploadImage as jest.Mock).mockResolvedValue('http://image.url');
    (Product.create as jest.Mock).mockResolvedValueOnce(true);

    await createProduct(req as Request, res as Response);

    expect(Product.create).toHaveBeenCalledWith({
      sellerId: '123',
      name: 'Test Product',
      description: 'Test Description',
      categoryId: '1',
      colors: ['red', 'blue'],
      images: ['http://image.url', 'http://image.url', 'http://image.url', 'http://image.url'],
    });

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      ok: true,
      message: 'Thank you for adding new product in the store!',
    });
  });

  it('should handle errors', async () => {
    const error = new Error('Test error');
    (Product.findOne as jest.Mock).mockRejectedValueOnce(error);

    await createProduct(req as Request, res as Response);

    expect(sendInternalErrorResponse).toHaveBeenCalledWith(res, error);
  });
});
