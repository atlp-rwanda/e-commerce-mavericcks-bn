import { Request, Response } from 'express';
import { Category } from '../database/models/Category';
import logger from '../logs/config';
import uploadImage from '../helpers/claudinary';

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body as { name: string; description: string };
    const image = req.file;

    if (image) {
      const imageBuffer: Buffer = image.buffer;
      try {
        const url = await uploadImage(imageBuffer);

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
      return res.status(400).json({ message: 'Image is required' });
    }
  } catch (error: any) {
    if (error instanceof Error) {
      logger.error(error.message);
    }
    return res.status(500).json({ error: 'Failed to create category', message: error.message });
  }
};

export const getAllCategories: any = async (req: Request, res: Response) => {
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
