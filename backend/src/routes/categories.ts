import { Router } from 'express';
import * as categoryController from '../controllers/categoryController';

const router = Router();

// GET /api/categories - List all categories
router.get('/', categoryController.getCategories);

// GET /api/categories/:id - Get category by ID
router.get('/:id', categoryController.getCategoryById);

// POST /api/categories - Create new category
router.post('/', categoryController.createCategory);

// PUT /api/categories/:id - Update category
router.put('/:id', categoryController.updateCategory);

// DELETE /api/categories/:id - Delete category
router.delete('/:id', categoryController.deleteCategory);

export default router;