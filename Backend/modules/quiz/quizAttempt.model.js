import mongoose from 'mongoose';

const quizAttemptSchema = new mongoose.Schema(
	{
		quizId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Quiz',
			required: true,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		answers: {
			type: [String],
			required: true,
		},
		score: {
			type: Number,
			required: true,
			min: 0,
		},
		total: {
			type: Number,
			required: true,
			min: 0,
		},
		percentage: {
			type: Number,
			required: true,
			min: 0,
			max: 100,
		},
		passed: {
			type: Boolean,
			default: false,
		},
		timeTaken: {
			type: Number,
			default: 0,
		},
		completedAt: {
			type: Date,
			default: Date.now,
		},
	},
	{
		versionKey: false,
	}
);

quizAttemptSchema.index({ quizId: 1, userId: 1 });

const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);

export default QuizAttempt;
