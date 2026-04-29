require('dotenv').config({ path: './Backend/.env' });
const { MongoClient } = require('mongodb');

(async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lms';
  const client = new MongoClient(uri, { useUnifiedTopology: true });
  try {
    await client.connect();
    const dbName = uri.split('/').pop() || 'lms';
    const db = client.db(dbName);
    const users = db.collection('users');

    const admin = await users.findOne({ role: 'admin' });
    if (!admin) {
      console.log('NO_ADMIN_FOUND');
      process.exit(0);
    }

    // Print minimal info
    console.log('ADMIN_FOUND');
    console.log(JSON.stringify({ id: admin._id, email: admin.email, name: admin.name, createdAt: admin.createdAt }));
    await client.close();
  } catch (err) {
    console.error('ERROR', err.message || err);
    process.exit(2);
  }
})();
