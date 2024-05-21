import { Request, Response } from 'express';
import { Category, CategoryCreationAttributes } from '../database/models/Category';
import logger from '../logs/config';

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body as CategoryCreationAttributes;
    await Category.create({
      name,
      description,
    });
    res.status(201).json({ ok: true, message: 'New category created successully!' });
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
