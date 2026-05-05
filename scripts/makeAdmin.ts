import mongoose from 'mongoose';

async function run() {
  try {
    await mongoose.connect('mongodb+srv://duongnt225300:duongnt225300@cluster0.nigpozu.mongodb.net/datn');
    const email = 'admin@fashion.com';
    console.log(`Looking for user with email: ${email}`);
    
    // update raw database collection
    const db = mongoose.connection;
    const result = await db.collection('users').updateOne(
      { email },
      { $set: { role: 'admin' } }
    );
    
    if (result.matchedCount > 0) {
      console.log(`User ${email} role updated to admin.`);
    } else {
      console.log(`User ${email} not found.`);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

run();
