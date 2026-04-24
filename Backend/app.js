import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import apiRoutes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { env } from './config/env.js';

const app = express();

app.use(helmet());
app.use(
	cors({
		origin: env.clientUrl,
		credentials: true,
	})
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

app.get('/', (req, res) => {
	res.status(200).json({
		success: true,
		message: 'LMS Backend is running',
		apiBase: '/api',
		health: '/api/health',
	});
});

app.use('/uploads', express.static('uploads'));
app.use('/api', apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
