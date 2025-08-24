import { Router } from 'express';
import * as tagController from '../controllers/tagController';

const router = Router();

// GET /api/tags - List all tags
router.get('/', tagController.getTags);

// GET /api/tags/:id - Get tag by ID
router.get('/:id', tagController.getTagById);

// POST /api/tags - Create new tag
router.post('/', tagController.createTag);

// PUT /api/tags/:id - Update tag
router.put('/:id', tagController.updateTag);

// DELETE /api/tags/:id - Delete tag
router.delete('/:id', tagController.deleteTag);

export default router;