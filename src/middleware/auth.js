const jwt = require('jsonwebtoken');
const ErrorException = require('../helpers/ErrorException');
const { User } = require('../models/index');

module.exports.isAuth = async (req, res, next) => {
    let decodedToken;

    try {
        const authorizationHeader = req.header('Authorization');
        if (!authorizationHeader) {
            throw new ErrorException(401, 'Authentication data not found');
        }

        const token = await authorizationHeader.replace('Bearer ', '').trim();
        decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        if (!decodedToken) {
            throw new ErrorException(401, 'Invalid or expired authorization data');
        }

        const user = await User.findOne({ _id: decodedToken._id, 'tokens.token': token });
        if (!user) {
            throw new ErrorException(401, 'Not authorized access');
        }

        req.user = user;
        req.token = token;
        next();
    } catch (err) {
        if (!err.code) {
            err.code = 401;
        }
        err.message = `Authorization failed: ${err.message}`;
        console.error(err.message);
        next(err);
    }
};

module.exports.isAdmin = (req, res, next) => {
    try {
        if (!req.user?.isAdmin) {
            throw new ErrorException(405, 'Permission Denied!');
        }
        next();
    } catch (err) {
        if (!err.code) {
            err.code = 405;
        }
        err.message = `Not Allowed Action: ${err.message}`;
        console.error(err.message);
        next(err);
    }
};

// **************** FOR SESSIONS ******************
module.exports.isLogged = (req, res, next) => {
    if (!req.session.isLogged) {
        return res.redirect('/login');
    }
    next();
};

// Adds session to the non API based request
module.exports.authParams = (req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    res.locals.isAuthenticated = 0;

    if (!req.session.user) {
        return next();
    }

    User.findById(req.session.user._id)
        .then((user) => {
            if (!user) {
                next(new Error('User account not found to initialization of session'));
            }
            res.locals.isAuthenticated = !req.session.isLogged ? 0 : 1;
            req.user = user;
            next();
        })
        .catch((err) => {
            next(new Error(err));
        });
};
