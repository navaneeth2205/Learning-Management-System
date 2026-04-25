import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true,
		},
		description: {
			type: String,
			required: true,
			trim: true,
		},
		instructorId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		category: {
			type: String,
			trim: true,
			default: 'General',
		},
		difficulty: {
			type: String,
			enum: ['Beginner', 'Intermediate', 'Advanced'],
			default: 'Beginner',
		},
		duration: {
			type: String,
			default: '',
		},
		thumbnail: {
			type: String,
			default: '',
		},
		tags: {
			type: [String],
			default: [],
		},
		status: {
			type: String,
			enum: ['draft', 'published', 'archived'],
			default: 'published',
		},
		enrolledCount: {
			type: Number,
			default: 0,
		},
		rating: {
			type: Number,
			default: 0,
			min: 0,
			max: 5,
		},
		reviewCount: {
			type: Number,
			default: 0,
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

courseSchema.index({ title: 'text', description: 'text', tags: 'text' });

const Course = mongoose.model('Course', courseSchema);

export default Course;
