// This is a express midleware that will handle all errorExceptions
const ErrorException = require('../helpers/ErrorException');

/* eslint no-unused-vars: ["error", { "argsIgnorePattern": "^_" }] */
const errorHandler = [
    (req, res, next) => {
        const { originalUrl: query = '', body } = req || {};
        const errors = (body && Object.keys(body).length !== 0) ? { body } : undefined;
        console.debug(`Error: 404, Route ${query} not found. Data recived: ${JSON.stringify(errors)}`);
        next(new ErrorException(404, `Route ${query} not found`, errors));
    },
    (err, req, res, _next) => {
        console.debug(err);

        let error = {
            success: false,
            code: err?.code || 500,
            message: err?.message || 'Unknown Error',
            errors: err?.errors,
        };

        if (err && err.name === 'ValidationError') { // From Model Validation
            error = {
                ...error,
                code: 422,
                message: 'Validation failed. Entered data is not valid.',
                errors: Object.values(err.errors).map((item) => ({
                    msg: item?.reason?.message,
                    value: item?.value,
                    param: item?.path,
                    location: item?.kind,
                })),
            };
        }

        res.format({
            json: () => {
                res.status(error.code).json(error);
            },
            text: () => {
                res.status(error.code).send(`Error: ${error.code}. ${error.message}`);
            },
        });
    },
];

module.exports = errorHandler;
