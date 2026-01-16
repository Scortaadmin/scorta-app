const mongoose = require('mongoose');

const connectDB = async () => {
    // Skip database connection if SKIP_DB is set
    if (process.env.SKIP_DB === 'true') {
        console.log('⚠️  Running in development mode WITHOUT database');
        console.log('   Data will not persist between restarts');
        return;
    }

    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Error connecting to MongoDB: ${error.message}`);
        console.log('⚠️  Continuing without database...');
    }
};

module.exports = connectDB;
