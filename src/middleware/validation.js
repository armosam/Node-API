const { validationResult } = require('express-validator');
const ErrorException = require('../helpers/ErrorException');
const { deleteFile } = require('../helpers/fileHelper');

// This middleware validates user inputs and trows an exception
module.exports = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Check if files uploaded then remove as validation is not done
        if (req.file) {
            deleteFile(req.file.destination, req.file.filename);
        }
        throw new ErrorException(422, 'Validation failed. Entered data is not valid.', errors.array());
    }
    next();
};
