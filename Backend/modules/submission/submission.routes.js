import express from 'express';

import { authenticate } from '../../middleware/auth.middleware.js';
import { isInstructorOrAdmin, isLearnerOrAdmin } from '../../middleware/role.middleware.js';
import { uploadAssignmentFile } from '../../middleware/upload.middleware.js';
import {
	gradeSubmissionController,
	listSubmissionsByAssignmentController,
	submitAssignmentController,
	mySubmissionsController,
} from './submission.controller.js';

const router = express.Router();

router.post('/', authenticate, isLearnerOrAdmin, uploadAssignmentFile.single('file'), submitAssignmentController);
router.get('/me', authenticate, mySubmissionsController);
router.patch('/:submissionId/grade', authenticate, isInstructorOrAdmin, gradeSubmissionController);
router.get('/assignment/:assignmentId', authenticate, isInstructorOrAdmin, listSubmissionsByAssignmentController);

export default router;
