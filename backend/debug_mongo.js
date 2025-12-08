const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const uri = process.env.DATABASE_URL;
console.log('Testing connection to:', uri);

async function run() {
    try {
        await mongoose.connect(uri);
        console.log('✅ Connected to MongoDB successfully!');

        // Define a temporary schema for testing
        const TestSchema = new mongoose.Schema({ name: String, date: { type: Date, default: Date.now } });
        const TestModel = mongoose.model('Debug_Test', TestSchema);

        // Try to insert a document
        const doc = new TestModel({ name: 'Connection Test' });
        await doc.save();
        console.log('✅ Document inserted successfully:', doc);

        // Try to find it back
        const found = await TestModel.findById(doc._id);
        console.log('✅ Document retrieved successfully:', found);

        // Clean up
        await TestModel.deleteOne({ _id: doc._id });
        console.log('✅ Test document cleaned up.');

    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected.');
    }
}

run();
