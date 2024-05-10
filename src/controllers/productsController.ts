/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { Transaction } from 'sequelize';
import uploadImage from '../helpers/claudinary';
import { sendInternalErrorResponse } from '../validations';
import { Product, ProductAttributes } from '../database/models/Product';
import { Size, SizeAttributes } from '../database/models/Size';
import logger from '../logs/config';
import sequelize from '../database/models';

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, colors } = req.body as ProductAttributes;
    const { categoryId } = req.params;
    const seller = (await req.user) as any;
    const sellerId = seller.id;

    // when products exists
    const thisProductExists = await Product.findOne({ where: { name } });

    if (thisProductExists) {
      return res.status(400).json({
        ok: false,
        message: 'This Product already exists, You can update the stock levels instead.',
        data: thisProductExists,
      });
    }
    // handle images
    const productImages: string[] = [];
    const images: unknown = req.files;
    if (images instanceof Array && images.length > 3) {
      for (const image of images) {
        const imageBuffer: Buffer = image.buffer;
        const url = await uploadImage(imageBuffer);
        productImages.push(url);
      }
    } else {
      return res.status(400).json({
        message: 'Product should have at least 4 images',
      });
    }

    // create product
    await Product.create({ sellerId, name, description, categoryId, colors, images: productImages });

    res.status(201).json({
      ok: true,
      message: 'Thank you for adding new product in the store!',
    });
  } catch (error) {
    sendInternalErrorResponse(res, error);
  }
};

export const createSize = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { size, price, discount, expiryDate } = req.body as SizeAttributes;
    await Size.create({ size, price, discount, expiryDate, productId });
    res.status(201).json({
      ok: true,
      message: 'Product size added successfully',
    });
  } catch (error) {
    sendInternalErrorResponse(res, error);
  }
};

const checkSizeExistance = async (sizeId: string, res: Response) => {
  const isSizeExist = await Size.findByPk(sizeId);

  if (!isSizeExist) {
    res.status(404).json({
      ok: false,
      message: 'This size is not available',
    });
    return null;
  }
  return isSizeExist;
};

const markProduct = async (sideId: string, availability: boolean, res: Response, message: string) => {
  await Size.update(
    {
      available: availability,
    },
    {
      where: {
        id: sideId,
      },
    }
  );

  res.status(200).json({
    ok: true,
    message: message,
  });
};

// Mark product as unvaiable
export const markProductAsUnavailable = async (req: Request, res: Response) => {
  try {
    const { sizeId } = req.params;
    const size = await checkSizeExistance(sizeId, res);

    if (!size) {
      return;
    }

    const isExpired = size.expiryDate <= new Date();
    const isQuantityAvailable = size.quantity <= 0;

    if (isExpired || isQuantityAvailable) {
      await markProduct(sizeId, false, res, 'This Product is successfully marked as unavailable');
    } else {
      res.status(403).json({
        ok: false,
        message: 'This Product already exist in stock with valid expiration date',
      });
    }
  } catch (error) {
    logger.error(error);
    sendInternalErrorResponse(res, error);
  }
};

export const markProductAsAvailable = async (req: Request, res: Response) => {
  try {
    const { sizeId } = req.params;
    const size = await checkSizeExistance(sizeId, res);

    if (!size) {
      return;
    }

    const isExpired = size.expiryDate > new Date();
    const isQuantityAvailable = size.quantity >= 1;

    if (isExpired && isQuantityAvailable) {
      await markProduct(sizeId, true, res, 'This Product is successfully marked as available');
    } else {
      res.status(403).json({
        ok: false,
        message: 'Check This Product quanity if it exists in stock with valid expiration date',
      });
    }
  } catch (error) {
    logger.error(error);
    sendInternalErrorResponse(res, error);
  }
};

// Function to get all products available in the database
export const getAllProduct = async (req: Request, res: Response) => {
  try {
    // Fetch all products with their associated sizes
    const products: any = await Product.findAll({
      include: [{ model: Size, as: 'Sizes' }],
    });

    const currentDate = new Date();

    // Filter products and remove expired sizes while keeping non-expired ones
    const availableProducts = products.map((product: { Sizes: any[]; toJSON: () => any }) => {
      const validSizes = product.Sizes.filter(
        (size: { expiryDate: string | number | Date }) => new Date(size.expiryDate) > currentDate
      );
      return {
        ...product.toJSON(),
        Sizes: validSizes,
      };
    });

    res.status(200).json({
      ok: true,
      message: 'All products retrieved successfully',
      data: availableProducts,
    });
  } catch (error) {
    sendInternalErrorResponse(res, error);
  }
};

// a function to get a certain product by ID
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const product = await Product.findByPk(productId, {
      include: [{ model: Size, as: 'Sizes' }],
    });

    if (!product) {
      return res.status(404).json({
        ok: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      ok: true,
      message: 'Product retrieved successfully',
      data: product,
    });
  } catch (error) {
    sendInternalErrorResponse(res, error);
  }
};

// a function to delete product by ID
export const deleteProductById = async (req: Request, res: Response) => {
  let transaction: Transaction | null = null;

  try {
    const { id } = req.params;

    transaction = await sequelize.transaction();

    // Find the product by ID
    const product = await Product.findByPk(id, { transaction });

    if (!product) {
      return res.status(404).json({
        ok: false,
        message: 'Product not found',
      });
    }

    // Verify that the requesting user is the owner of the product
    const userId = (await (req.user as any)).id;
    if (product.sellerId !== userId) {
      return res.status(403).json({
        ok: false,
        message: 'Unauthorized: You are not authorized to delete this product',
      });
    }

    // deleting product related sizes
    const sizes = await Size.findAll({ where: { id }, transaction });
    await Size.destroy({ where: { id }, transaction });

    // deleting the product itself
    await product.destroy({ transaction });

    await transaction.commit();

    res.status(200).json({
      ok: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    // Rollback the transaction if an error occurs
    if (transaction) await transaction.rollback();
    sendInternalErrorResponse(res, error);
  }
};
