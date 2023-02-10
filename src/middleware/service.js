const ErrorException = require('../helpers/ErrorException');

// This middleware helps to attach service in the request by injecting service into req
// Use in the routes:
//  const attach = require('service/index');
//  As a middleware in the router attach({ service: someService, other: otherService });
module.exports = (services) => (req, res, next) => {
    if (!services || typeof services !== 'object') {
        throw new ErrorException(500, 'Service failed to be attached to the request.');
    }

    const servicesArr = Object.entries(services);
    servicesArr.forEach(([serviceName = 'service', serviceObj = null]) => {
        if (!serviceObj || !(serviceObj instanceof Object)) {
            throw new ErrorException(500, 'Service instance not found to be attached to the request.');
        }
        req[serviceName] = Object.freeze(serviceObj);
    });

    next();
};
