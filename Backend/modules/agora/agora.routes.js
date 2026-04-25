import express from 'express';

import { authenticate } from '../../middleware/auth.middleware.js';
import { generateAgoraTokenController } from './agora.controller.js';

const router = express.Router();

router.post('/token', authenticate, generateAgoraTokenController);

export default router;