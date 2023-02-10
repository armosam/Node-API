const session = require('express-session'); // express session
const MongoDBStore = require('connect-mongodb-session')(session); // Database specific session
const { MONGODB_URI } = require('../config');

// Sets session store as mongoDB database. Later used for express session
const dbStore = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions',
});

// Configure express session with a databse storage
module.exports = session({
    secret: 'My Secret',
    resave: false,
    saveUninitialized: false,
    store: dbStore,
});
