// This middleware adds a method getBaseUrl to req
module.exports = (req, res, next) => {
    req.getBaseUrl = () => `${req.protocol}://${req.get('host')}`;
    next();
};
