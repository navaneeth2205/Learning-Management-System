import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
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
		description: {
			type: String,
			required: true,
			trim: true,
		},
		deadline: {
			type: Date,
			required: true,
		},
	},
	{
		versionKey: false,
	}
);

const Assignment = mongoose.model('Assignment', assignmentSchema);

export default Assignment;
