import { Request, Response } from 'express';
import Wishlist from '../database/models/wishlist';
import { Product } from '../database/models/Product';
import { Size } from '../database/models/Size';
import { sendInternalErrorResponse } from '../validations';
import User from '../database/models/user';

export const addToWishlist = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user as User;

    const itemExist = await Wishlist.findOne({
      where: {
        userId: user.id,
        sizeId: id,
      },
    });
    if (itemExist) {
      return res.status(400).json({
        ok: false,
        message: 'Product already added to wishlist',
      });
    }
    await Wishlist.create({
      userId: user.id,
      sizeId: id,
    });

    return res.status(201).json({
      ok: true,
      message: 'Product added to wishlist successfully',
    });
  } catch (err) {
    return sendInternalErrorResponse(res, err);
  }
};
export const getWishlist = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as User).id;

    const wishlistItems = await Wishlist.findAll({
      where: {
        userId,
      },
      include: {
        model: Size,
        attributes: ['productId', 'price', 'quantity', 'id'],
      },
    });
    const productIds = wishlistItems.map((item: any) => item.Size.productId);

    const wishlistproducts = await Product.findAll({
      where: { id: productIds },
    });

    const combinedResponse = wishlistItems.map((wishlistItem: any) => {
      const matchingProduct = wishlistproducts.find((product: any) => product.id === wishlistItem.Size.productId);
      return {
        id: wishlistItem.dataValues.id,
        name: matchingProduct?.dataValues.name,
        image: matchingProduct?.dataValues.images[0],
        productId: wishlistItem.dataValues.Size.dataValues.id,
        price: wishlistItem.dataValues.Size.dataValues.price,
      };
    });

    return res.status(200).json({
      ok: true,
      message: 'Wishlist fetched successfully',
      data: combinedResponse,
    });
  } catch (err) {
    return sendInternalErrorResponse(res, err);
  }
};

export const clearWishList = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as User).id;

    const rowsAffected = await Wishlist.destroy({ where: { userId } });

    if (rowsAffected > 0) {
      return res.status(200).json({
        ok: true,
        message: 'Wishlist cleared successfully',
      });
    } else {
      return res.status(404).json({
        ok: false,
        message: 'No wishlist items found for deletion',
      });
    }
  } catch (err) {
    return sendInternalErrorResponse(res, err);
  }
};
export const deleteWishlistItem = async (req: Request, res: Response) => {
  const user = req.user as User;
  const { id } = req.params;
  try {
    await Wishlist.destroy({ where: { userId: user.id, id } });
    return res.status(200).json({
      ok: true,
      message: 'Wishlist item deleted successfully',
    });
  } catch (err) {
    return sendInternalErrorResponse(res, err);
  }
};
