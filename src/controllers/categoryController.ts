import { Request, Response, NextFunction } from 'express';
import { categories, Category } from '../models/category';

// Create a category
export const createCategory = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;
    const newCategory: Category = { id: Date.now(), name };
    categories.push(newCategory);
    res.status(201).json(newCategory);
  } catch (error) {
    next(error);
  }
};

// Read all categories
export const getCategories = (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

// Read single category
export const getCategoryById = (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const category = categories.find((c) => c.id === id);
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }
    res.json(category);
  } catch (error) {
    next(error);
  }
};

// Update a category
export const updateCategory = (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name } = req.body;
    const categoryIndex = categories.findIndex((c) => c.id === id);
    if (categoryIndex === -1) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }
    categories[categoryIndex].name = name;
    res.json(categories[categoryIndex]);
  } catch (error) {
    next(error);
  }
};

// Delete a category
export const deleteCategory = (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const categoryIndex = categories.findIndex((c) => c.id === id);
    if (categoryIndex === -1) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }
    const deletedCategory = categories.splice(categoryIndex, 1)[0];
    res.json(deletedCategory);
  } catch (error) {
    next(error);
  }
};
