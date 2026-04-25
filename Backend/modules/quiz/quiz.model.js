import mongoose from 'mongoose';

const quizQuestionSchema = new mongoose.Schema(
	{
		question: {
			type: String,
			required: true,
			trim: true,
		},
		options: {
			type: [String],
			required: true,
			validate: {
				validator: (value) => Array.isArray(value) && value.length >= 2,
				message: 'Each question must have at least two options',
			},
		},
		correctAnswer: {
			type: String,
			required: true,
			trim: true,
		},
	},
	{ _id: false }
);

const quizSchema = new mongoose.Schema(
	{
		courseId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Course',
			required: true,
		},
		title: {
			type: String,
			required: true,
			trim: true,
		},
		questions: {
			type: [quizQuestionSchema],
			required: true,
			validate: {
				validator: (value) => Array.isArray(value) && value.length > 0,
				message: 'Quiz must include at least one question',
			},
		},
		timeLimit: {
			type: Number,
			default: 30,
			min: 1,
		},
		passingScore: {
			type: Number,
			default: 70,
			min: 0,
			max: 100,
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		createdAt: {
			type: Date,
			default: Date.now,
		},
	},
	{
		versionKey: false,
	}
);

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz;
