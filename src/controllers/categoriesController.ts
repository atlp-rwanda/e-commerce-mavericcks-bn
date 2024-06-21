import { Request, Response } from 'express';
import { Category, CategoryCreationAttributes } from '../database/models/Category';
import logger from '../logs/config';
import uploadImage from '../helpers/claudinary';

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body as CategoryCreationAttributes;
    const categoryImages: string[] = [];
    const images: unknown = req.files;

    if (images instanceof Array && images.length === 1) {
      const imageBuffer: Buffer = images[0].buffer;
      try {
        const url = await uploadImage(imageBuffer);
        categoryImages.push(url);

        await Category.create({ name, description, image: url });

        return res.status(201).json({
          ok: true,
          message: 'New category created successfully!',
          imageUrl: url,
        });
      } catch (error: any) {
        return res.status(500).json({ message: 'Error uploading image', error: error.message });
      }
    } else {
      return res.status(400).json({ message: 'Category should have exactly one image' });
    }
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    }
    res.status(500).json({ error: 'Failed to create category' });
  }
};
export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.findAll();
    res.status(200).json({ ok: true, data: categories });
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    }
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};
