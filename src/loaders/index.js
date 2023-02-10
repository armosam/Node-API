const mongooseLoader = require('./mongoose');
const expressLoader = require('./express');
const { ENV_PROD, PORT } = require('../config');

module.exports.init = async (app) => {
    await mongooseLoader();

    await expressLoader(app);

    // https.createServer({ key: privateKey, cert: privateCert }, app).listen(PORT);
    app.listen(process.env.PORT, (err) => {
        if (err) {
            throw new Error(err.message);
        }
        if (!ENV_PROD) {
            console.debug(`Server is listening on: http://127.0.0.1:${PORT}`);
        }
    });
};
