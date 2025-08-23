import { Router } from 'express';
import * as tagController from '../controllers/tagController';

const router = Router();

// GET /api/tags - List all tags
router.get('/', tagController.getTags);

// POST /api/tags - Create new tag
router.post('/', tagController.createTag);

// DELETE /api/tags/:id - Delete tag
router.delete('/:id', tagController.deleteTag);

export default router;