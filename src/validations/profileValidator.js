const { body } = require('express-validator');
const { PASSWORD_COMPLEXITY } = require('../config');

const updateProfile = [
    body('password', 'Password must be 8 chars long and contain capital letters, numbers and symbols.')
        .optional()
        .trim()
        .matches(PASSWORD_COMPLEXITY),
    async (req, res, next) => {
        // if a password has been provided, then a confirmation must also be provided.
        if (req.body.password) {
            await body('passwordConfirmation')
                .equals(req.body.password)
                .withMessage('Password confirmation does not match password')
                .run(req);
        }
        next();
    },
    body('name')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Name is required. Please enter valid name.')
        .escape(),
    body('age')
        .optional()
        .trim()
        .isInt({ max: 150 })
        .withMessage('Age should be an integer and up to 150.'),
    body('status')
        .optional()
        .trim()
        .toBoolean(),
    body('isAdmin')
        .optional()
        .trim()
        .toBoolean(),
    body('avatar') // OPTIONAL. returns false if uploaded and in format. true if not in format otherwise undefined
        .custom((value, { req }) => (req.wrongImageFormat !== true))
        .withMessage('Please upload files in JPG, PNG formats.'),
];

const uploadProfileAvatar = [
    body('avatar') // REQUIRED. returns false if uploaded and in format. true if not in format otherwise undefined
        .custom((value, { req }) => (req.wrongImageFormat === false))
        .withMessage('Please upload files in JPG, PNG formats.'),
];

module.exports = {
    updateProfile,
    uploadProfileAvatar,
};
