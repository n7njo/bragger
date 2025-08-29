import { Router } from 'express';
import { getMilestones, createMilestone, updateMilestone, deleteMilestone } from '../controllers/milestoneController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All milestone routes require authentication
router.use(authenticateToken);

// Achievement-specific milestone routes
router.get('/achievements/:achievementId/milestones', getMilestones);
router.post('/achievements/:achievementId/milestones', createMilestone);
router.put('/achievements/:achievementId/milestones/:milestoneId', updateMilestone);
router.delete('/achievements/:achievementId/milestones/:milestoneId', deleteMilestone);

export default router;