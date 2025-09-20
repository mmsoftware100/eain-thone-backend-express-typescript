import { Request, Response } from 'express';
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from '../src/controllers/categoryController';
import { categories, Category } from '../src/models/category';

describe('Category Controller', () => {
  beforeEach(() => {
    // Reset categories before each test
    categories.length = 0;
  });

  it('should create a new category', () => {
    const req = { body: { name: 'Test Category' } } as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    createCategory(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Test Category' })
    );
    expect(categories.length).toBe(1);
  });

  it('should return all categories', () => {
    const req = {} as Request;
    const res = {
      json: jest.fn(),
    } as unknown as Response;
    const testCategory: Category = { id: 1, name: 'Test Category' };
    categories.push(testCategory);

    getCategories(req, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith([testCategory]);
  });

  it('should return a category by id', () => {
    const testCategory: Category = { id: 1, name: 'Test Category' };
    categories.push(testCategory);
    const req = { params: { id: '1' } } as unknown as Request;
    const res = {
      json: jest.fn(),
    } as unknown as Response;

    getCategoryById(req, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith(testCategory);
  });

  it('should return 404 if category not found', () => {
    const req = { params: { id: '1' } } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    getCategoryById(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Category not found' });
  });

  it('should update a category', () => {
    const testCategory: Category = { id: 1, name: 'Test Category' };
    categories.push(testCategory);
    const req = {
      params: { id: '1' },
      body: { name: 'Updated Category' },
    } as unknown as Request;
    const res = {
      json: jest.fn(),
    } as unknown as Response;

    updateCategory(req, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith({
      id: 1,
      name: 'Updated Category',
    });
  });

  it('should delete a category', () => {
    const testCategory: Category = { id: 1, name: 'Test Category' };
    categories.push(testCategory);
    const req = { params: { id: '1' } } as unknown as Request;
    const res = {
      json: jest.fn(),
    } as unknown as Response;

    deleteCategory(req, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith(testCategory);
    expect(categories.length).toBe(0);
  });
});
