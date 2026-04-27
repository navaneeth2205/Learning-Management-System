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
			enum: ['Beginner', 'Intermediate', 'Advanced', 'beginner', 'intermediate', 'advanced'],
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
		googleClassroom: {
			id: {
				type: String,
				default: '',
				trim: true,
			},
			name: {
				type: String,
				default: '',
				trim: true,
			},
			section: {
				type: String,
				default: '',
				trim: true,
			},
			descriptionHeading: {
				type: String,
				default: '',
				trim: true,
			},
			description: {
				type: String,
				default: '',
				trim: true,
			},
			enrollmentCode: {
				type: String,
				default: '',
				trim: true,
			},
			alternateLink: {
				type: String,
				default: '',
				trim: true,
			},
			state: {
				type: String,
				default: '',
				trim: true,
			},
			createdAt: Date,
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
