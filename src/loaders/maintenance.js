const ErrorException = require('../helpers/ErrorException');

/* eslint no-unused-vars: "off" */
module.exports = (req, res, next) => {
    throw new ErrorException(503, 'Site is under maintenance.', { title: 'Maintenance outage' });
};
