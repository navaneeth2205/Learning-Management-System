const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/lms').then(async () => {
    const db = mongoose.connection.db;
    
    // Find all lessons where courseId is stored as a string
    const lessons = await db.collection('lessons').find({ courseId: { $type: 'string' } }).toArray();
    console.log(`Found ${lessons.length} lessons with string courseId`);
    
    let fixed = 0;
    for (const lesson of lessons) {
        try {
            await db.collection('lessons').updateOne(
                { _id: lesson._id },
                { $set: { courseId: new mongoose.Types.ObjectId(lesson.courseId) } }
            );
            fixed++;
        } catch (err) {
            console.error('Error updating lesson', lesson._id, lesson.courseId, err.message);
        }
    }
    console.log(`Fixed ${fixed} lessons.`);
    
    // Verify
    const afterFix = await db.collection('lessons').find({ courseId: { $type: 'objectId' } }).toArray();
    console.log(`Lessons with ObjectId courseId after fix: ${afterFix.length}`);
    
    process.exit(0);
});
