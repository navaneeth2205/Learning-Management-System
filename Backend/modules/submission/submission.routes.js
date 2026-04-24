import express from 'express';

import { authenticate } from '../../middleware/auth.middleware.js';
import { isInstructorOrAdmin, isLearnerOrAdmin } from '../../middleware/role.middleware.js';
import { uploadAssignmentFile } from '../../middleware/upload.middleware.js';
import {
	gradeSubmissionController,
	listSubmissionsByAssignmentController,
	submitAssignmentController,
} from './submission.controller.js';

const router = express.Router();

router.post('/', authenticate, isLearnerOrAdmin, uploadAssignmentFile.single('file'), submitAssignmentController);
router.patch('/:submissionId/grade', authenticate, isInstructorOrAdmin, gradeSubmissionController);
router.get('/assignment/:assignmentId', authenticate, isInstructorOrAdmin, listSubmissionsByAssignmentController);

export default router;
