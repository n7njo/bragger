import { Router } from 'express';
import * as imageController from '../controllers/imageController';

const router = Router();

// GET /api/images/:filename - Serve image file
router.get('/:filename', imageController.serveImage);

// DELETE /api/images/:id - Delete image
router.delete('/:id', imageController.deleteImage);

export default router;