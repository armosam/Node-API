const mongoose = require('mongoose');
const { ENV_PROD, MONGODB_URI } = require('../config');

// Connect to mongoDb through mongoose
// export default async (): Promise<any> => {
module.exports = async () => {
    try {
        mongoose.set('strictQuery', true);
        await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, ssl: true });

        mongoose.connection.on('error', (err) => {
            throw new Error(`Database connection lost: ${err.message}`);
        });

        if (!ENV_PROD) {
            console.debug('Database connected successfully. Models: ', mongoose.connection.modelNames());
        }
    } catch (err) {
        throw new Error(`Database connection failed. ${err.message}`);
    }

    return mongoose.connection.db;
};
