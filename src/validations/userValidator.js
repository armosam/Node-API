const { body, param, query } = require('express-validator');
const { PASSWORD_COMPLEXITY } = require('../config');
const { User } = require('../models/index');

const userId = [
    param('id')
        .trim()
        .notEmpty()
        .withMessage('Missing ID.')
        .bail()
        .custom((value) => User.findById(value).then((user) => {
            if (!user) {
                return Promise.reject(new Error('User not found.'));
            }
        })),
];

const pageNumber = [
    query('page')
        .trim()
        .isInt({ min: 1 })
        .withMessage('Page is optional and could take an integer from 1 and greater values.'),
];

const createAccount = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please enter valid email address.')
        .bail()
        .custom((value) => User.findOne({ email: value }).then((user) => {
            if (user) {
                return Promise.reject(new Error('Email address is in use. Please choose another one.'));
            }
        }))
        .normalizeEmail(),
    body('password', 'Password must be 8 chars long and contain capital letters, numbers and symbols.')
        .trim()
        .matches(PASSWORD_COMPLEXITY),
    body('passwordConfirmation', 'Password confirmation does not match password')
        .trim()
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Password confirmation does not match password');
            }
            return true; // Indicates the success of this synchronous custom validator
        }),
    body('name')
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

const updateAccount = [
    param('id')
        .trim()
        .notEmpty()
        .withMessage('Missing ID.')
        .bail()
        .custom((value) => User.findById(value).then((user) => {
            if (!user) {
                return Promise.reject(new Error('User not found.'));
            }
        })),
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
    body('avatar') // OPTIONAL returns false if uploaded and in format. true if not in format otherwise undefined
        .custom((value, { req }) => (req.wrongImageFormat !== true))
        .withMessage('Please upload files in JPG, PNG formats.'),
];

const uploadAccountAvatar = [
    param('id')
        .trim()
        .notEmpty()
        .withMessage('Missing ID.')
        .bail()
        .custom((value) => User.findById(value).then((user) => {
            if (!user) {
                return Promise.reject(new Error('User not found.'));
            }
        })),
    body('avatar') // REQUIRED. returns false if uploaded and in format. true if not in format otherwise undefined
        .custom((value, { req }) => (req.wrongImageFormat === false))
        .withMessage('Please upload files in JPG, PNG formats.'),
];

module.exports = {
    userId,
    pageNumber,
    createAccount,
    updateAccount,
    uploadAccountAvatar,
};
