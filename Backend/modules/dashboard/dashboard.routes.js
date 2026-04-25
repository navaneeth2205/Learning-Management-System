import express from 'express';

import { authenticate } from '../../middleware/auth.middleware.js';
import { 
    learnerDashboardController, 
    leaderboardController, 
    gradesController, 
    statsController,
    instructorDashboardController 
} from './dashboard.controller.js';
import { isInstructorOrAdmin } from '../../middleware/role.middleware.js';

const router = express.Router();

router.get('/learner', authenticate, learnerDashboardController);
router.get('/instructor', authenticate, isInstructorOrAdmin, instructorDashboardController);
router.get('/leaderboard', authenticate, leaderboardController);
router.get('/grades', authenticate, gradesController);
router.get('/stats', authenticate, statsController);

export default router;
