/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import uploadImage from '../helpers/claudinary';
import { sendInternalErrorResponse } from '../validations';
import { Product, ProductAttributes } from '../database/models/Product';
import { Size, SizeAttributes } from '../database/models/Size';

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
    const productImages = ['asdf', 'asdf', 'asdf', 'asdf'];
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
    await Product.create({
      sellerId,
      name,
      description,
      categoryId,
      colors,
      images: productImages,
    });

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
