import Message from './message.model.js';
import User from '../user/user.model.js';

import { createAppError } from '../../utils/constants.js';

export const sendMessage = async ({ senderId, receiverId, subject, content }) => {
	const receiver = await User.findById(receiverId);
	if (!receiver) {
		throw createAppError('Recipient not found', 404);
	}

	return Message.create({ senderId, receiverId, subject, content });
};

export const getInbox = async (userId) =>
	Message.find({ receiverId: userId })
		.populate('senderId', 'name email role')
		.sort({ createdAt: -1 });

export const getSentMessages = async (userId) =>
	Message.find({ senderId: userId })
		.populate('receiverId', 'name email role')
		.sort({ createdAt: -1 });

export const getMessageById = async (messageId, userId) => {
	const message = await Message.findById(messageId)
		.populate('senderId', 'name email role')
		.populate('receiverId', 'name email role');

	if (!message) {
		throw createAppError('Message not found', 404);
	}

	if (
		message.senderId._id.toString() !== userId.toString() &&
		message.receiverId._id.toString() !== userId.toString()
	) {
		throw createAppError('Not authorized to view this message', 403);
	}

	if (message.receiverId._id.toString() === userId.toString() && !message.read) {
		message.read = true;
		await message.save();
	}

	return message;
};

export const markAsRead = async (messageId, userId) => {
	const message = await Message.findOne({ _id: messageId, receiverId: userId });
	if (!message) {
		throw createAppError('Message not found', 404);
	}
	message.read = true;
	await message.save();
	return message;
};

export const deleteMessage = async (messageId, userId) => {
	const message = await Message.findById(messageId);
	if (!message) {
		throw createAppError('Message not found', 404);
	}
	if (
		message.senderId.toString() !== userId.toString() &&
		message.receiverId.toString() !== userId.toString()
	) {
		throw createAppError('Not authorized to delete this message', 403);
	}
	await Message.findByIdAndDelete(messageId);
	return message;
};

export const getUnreadCount = async (userId) =>
	Message.countDocuments({ receiverId: userId, read: false });
