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
import Notification from '../database/models/notification';
import User from '../database/models/user';
import { sendEmail } from '../helpers/send-email';
import { destroyImage } from '../helpers/destroyImage';
import { extractImageId } from '../helpers/extractImageId';
// import Review, { ReviewAttributes } from '../database/models/Review';
import Review, { ReviewAttributes } from '../database/models/Review';
import Cart from '../database/models/cart';
import Order from '../database/models/order';
import OrderItems from '../database/models/orderItems';

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
    const { size, price, discount, expiryDate, quantity } = req.body as SizeAttributes;

    const result = await Size.create({ size, price, discount, expiryDate, productId, quantity });
    res.status(201).json({
      ok: true,
      message: 'Product size added successfully',
    });
  } catch (error) {
    sendInternalErrorResponse(res, error);
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    const data = {
      name: req.body.name,
      description: req.body.description,
      colors: req.body.colors,
    };

    // update images
    if (req.files) {
      const product = await Product.findByPk(productId);
      const foundImages = product?.images;

      // delete already existing images
      if (foundImages instanceof Array) {
        for (let i = 0; i < foundImages.length; i++) {
          const strImg = foundImages[i].toString();
          const imageId = extractImageId(strImg) as string;
          await destroyImage(imageId);
          product!.images = [];
        }
      }

      // update new images
      const images: unknown = req.files;
      const productImages = [];
      if (images instanceof Array && images.length > 3) {
        for (const image of images) {
          const imageBuffer: Buffer = image.buffer;
          const url = await uploadImage(imageBuffer);
          productImages.push(url);
          Product.update({ images: productImages }, { where: { id: productId } });
        }
      } else {
        return res.status(400).json({
          message: 'Product should have at least 4 images',
        });
      }
    }
    // update product
    Product.update(data, { where: { id: productId } }).then(() => {
      res.status(200).json({
        ok: true,
        message: 'Product updated successfully',
      });
    });
  } catch (error) {
    sendInternalErrorResponse(res, error);
  }
};
// get size
export const getAllSizes = async (req: Request, res: Response) => {
  try {
    const sizes = await Size.findAll();
    if (!sizes) {
      res.status(404).json({ ok: false, message: 'No size found!' });
      return;
    }
    res.status(200).json({ ok: true, sizes });
  } catch (err) {
    logger.error(err);
    sendInternalErrorResponse(res, err);
  }
};
// update size
export const updateSize = async (req: Request, res: Response) => {
  try {
    const { sizeId } = req.params;
    const { size, price, discount, expiryDate } = req.body as SizeAttributes;
    await Size.update({ size, price, discount, expiryDate }, { where: { id: sizeId } });
    res.status(200).json({
      ok: true,
      message: 'Product size updated successfully',
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
      include: [{ model: Size, as: 'sizes' }],
    });

    const currentDate = new Date();

    // Filter products and remove expired sizes while keeping non-expired ones
    const availableProducts = products.map((product: { sizes: any[]; toJSON: () => any }) => {
      const validSizes = product.sizes.filter(
        (size: { expiryDate: string | number | Date }) => new Date(size.expiryDate) <= currentDate
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
      include: [{ model: Size, as: 'sizes' }],
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
//HOOKS TO MANAGE NOTIFICATIONS AFTER OPERATIONS ARE MADE ON PRODUCT

Product.afterCreate(async product => {
  const notification = await Notification.create({
    message: `Product called: ${product.name} was created successfully!`,
    isRead: false,
    userId: product.sellerId,
  });
  const user = await User.findOne({ where: { id: product.sellerId }, attributes: ['email', 'firstName', 'lastName'] });
  if (!user) {
    return Promise.reject(new Error("User cannot be found! So the email won't be send successfully"));
  }
  sendEmail('added_product_notification', { email: user.email, name: user.firstName });
});

// Review a product (feedback + rating)
export const provideReviewToProduct = async (req: Request, res: Response) => {
  try {
    const { rating, feedback } = req.body as ReviewAttributes;
    const { productId } = req.params;
    const buyer = req.user as any;
    const userId = buyer.id;

    // Check if the order with the given userId and status 'delivered' contains the productId
    const orderItem = await OrderItems.findOne({
      where: { productId },
      include: [
        {
          model: Order,
          as: 'orders',
          where: { userId, status: 'delivered' },
        },
      ],
    });

    // No matching order or orderitem found
    if (!orderItem) {
      return res.status(400).json({
        ok: false,
        message: 'No delivered order found for this product',
      });
    }

    // check if buyer has review
    const existingReview = await Review.findOne({ where: { userId, productId } });
    if (existingReview) {
      return res.status(400).json({
        ok: false,
        message: 'You have already reviewed this product',
      });
    }

    // Handle image if provided
    let feedbbackImage: string | null = null;
    const image: any = req.file;
    if (image) {
      const imageBuffer: Buffer = image.buffer;
      feedbbackImage = await uploadImage(imageBuffer);
    }

    // Create review
    await Review.create({ userId, feedback, rating, productId, feedbbackImage });

    res.status(201).json({
      ok: true,
      message: 'Thank you for providing feedback!',
    });
  } catch (error) {
    logger.error('Unable to provide review:', error);
    sendInternalErrorResponse(res, error);
  }
};

// delete a review
export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    const buyer = req.user as any;
    const userId = buyer.id;

    // Check if the review exists
    const review = await Review.findByPk(reviewId);
    if (!review) {
      return res.status(404).json({
        ok: false,
        message: 'Review not found',
      });
    }

    // verify owner
    if (review.userId !== userId) {
      return res.status(400).json({
        ok: false,
        message: 'Only owner can delete a review',
      });
    }

    // Delete the review
    await review.destroy();

    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    logger.error('Error deleting review:', error);
    sendInternalErrorResponse(res, error);
  }
};

// calculate rating statistics
export const calculateAverageRating = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    // Find all reviews for the product
    const reviews = await Review.findAll({ where: { productId } });

    if (reviews.length === 0) {
      return res.status(404).json({
        ok: false,
        message: 'No reviews found for this product.',
      });
    }

    // Calculate the total sum of ratings
    const totalRatings = reviews.reduce((sum, review) => sum + review.rating, 0);

    // Calculate the average rating
    const averageRating = totalRatings / reviews.length;

    res.status(200).json({
      ok: true,
      message: 'Average rating is as follow',
      avarage: averageRating,
    });
  } catch (error) {
    logger.error('Unable to calculate average rating:', error);
    sendInternalErrorResponse(res, error);
  }
};

// get product review ---- Buyer
export const getProductReviewsById = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const product = await Product.findByPk(productId, {
      include: [
        { model: Size, as: 'sizes' },
        { model: Review, as: 'reviews', include: [{ model: User, as: 'user', attributes: ['photoUrl', 'firstName'] }] },
      ],
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
