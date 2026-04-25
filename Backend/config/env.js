import dotenv from 'dotenv';

dotenv.config();

const requiredVariables = ['MONGODB_URI', 'JWT_SECRET'];

requiredVariables.forEach((variable) => {
	if (!process.env[variable]) {
		throw new Error(`Missing required environment variable: ${variable}`);
	}
});

export const env = {
	nodeEnv: process.env.NODE_ENV || 'development',
	port: Number(process.env.PORT) || 5000,
	mongoUri: process.env.MONGODB_URI,
	jwtSecret: process.env.JWT_SECRET,
	jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30d',
	bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,
	clientUrl: process.env.CLIENT_URL || '*',
	googleClientId: process.env.GOOGLE_CLIENT_ID || '',
	googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
	emailHost: process.env.EMAIL_HOST || '',
	emailPort: Number(process.env.EMAIL_PORT) || 587,
	emailUseTls: String(process.env.EMAIL_USE_TLS || 'true').toLowerCase() === 'true',
	emailHostUser: process.env.EMAIL_HOST_USER || '',
	emailHostPassword: process.env.EMAIL_HOST_PASSWORD || '',
	defaultFromEmail: process.env.DEFAULT_FROM_EMAIL || process.env.EMAIL_HOST_USER || '',
	emailAllowSelfSigned: String(process.env.EMAIL_ALLOW_SELF_SIGNED || 'true').toLowerCase() === 'true',
	resetPasswordExpiresMinutes: Number(process.env.RESET_PASSWORD_EXPIRES_MINUTES) || 15,
	agoraAppId: process.env.AGORA_APP_ID || '',
	agoraAppCertificate: process.env.AGORA_APP_CERTIFICATE || '',
	agoraTokenExpireSeconds: Number(process.env.AGORA_TOKEN_EXPIRE_SECONDS) || 3600,
};
