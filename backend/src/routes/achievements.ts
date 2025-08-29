import { Router } from 'express';
import * as achievementController from '../controllers/achievementController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All achievement routes require authentication
router.use(authenticateToken);

// GET /api/achievements - List achievements with filtering
router.get('/', achievementController.getAchievements);

// GET /api/achievements/:id - Get single achievement
router.get('/:id', achievementController.getAchievement);

// POST /api/achievements - Create new achievement
router.post('/', achievementController.createAchievement);

// PUT /api/achievements/:id - Update achievement
router.put('/:id', achievementController.updateAchievement);

// DELETE /api/achievements/:id - Delete achievement
router.delete('/:id', achievementController.deleteAchievement);

// POST /api/achievements/:id/images - Upload images for achievement
router.post('/:id/images', achievementController.uploadImages);

export default router;