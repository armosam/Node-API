// const fs = require('fs'); // file system module
// const path = require('path'); // path module
// const https = require('https'); // HTTPS SSL
const express = require('express'); // Express
// const cors = require('cors');
// const csrf = require('csurf'); // CSRF token
const helmet = require('helmet');
const compression = require('compression');

const logger = require('./logger'); // Logging manager
const allowedHeaders = require('./headers'); // Allowed headers
// const session = require('./session'); // Web requests session
// const maintenance = require('./maintenance'); // Allowed headers

// const { authParams } = require('./middleware/auth');
const baseUrl = require('../middleware/baseUrl'); // adds getBaseUrl() method to the req
// const { upload, resizeImage } = require('../middleware/imageUpload');
const errorHandler = require('../middleware/error');

const routes = require('../routes/index');

// export default async ({ app }: { app: express.Application }) => {
module.exports = async (app) => {
    // app.use(cors());

    // CSRF token middleware
    // const csrfProtection = csrf();

    // const privateKey = fs.readFileSync(path.join(__dirname, 'config', 'ssl', 'server.key'));
    // const privateCert = fs.readFileSync(path.join(__dirname, 'config', 'ssl', 'server.cert'));

    // Adds security headers
    app.use(helmet({ contentSecurityPolicy: false }));

    // Adds compression middleware
    app.use(compression());

    // Request Logging middleware
    app.use(logger);

    // parse posted data body as a application/json data and add to the req.body
    app.use(express.json());
    // parse posted data body as a standard form data application/x-www-form-urlencoded (not multipart) data and add to the req.body
    app.use(express.urlencoded({ extended: false }));

    // Adds getBaseUrl() method to the req to return current baseUrl (ex. http://localhost:5000)
    app.use(baseUrl);

    // parse the uploaded file by name avatar on the form and add to the req as a req.file data
    // app.use(upload.single('avatar'));
    // app.use(upload.single('photo'));

    // get uploaded file from req.file resize using configured avatar size and put file in the images/resized folder
    // app.use(resizeImage());

    // parse the uploaded file by name resume on the form and add to the req as a req.file data
    // app.use(resume);

    // Allow images folder to be static. it will bypass express routing for requests starting with /images
    // app.use('/images', express.static(path.join(__dirname, 'images')));

    // Use session for express
    // app.use(session);

    // Use CSRF. Adds CSRF token in the req
    // app.use(csrfProtection);

    // This is for maintenance page
    // app.use(maintenance());

    // Adds allowed request headers, methods
    app.use(allowedHeaders);

    // Adds authentication status, logged user and csrf token
    // app.use(authParams);

    // Routers
    routes(app);

    // Error Exception handling
    app.use(errorHandler);

    // ...More middlewares

    // Return the express app
    return app;
};
