const mongoose = require('mongoose');
const { body, param } = require('express-validator');
const { User } = require('../models/index');
const { PASSWORD_COMPLEXITY } = require('../config');

// Validators for auth route
const signup = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required. Please enter valid name.')
        .escape(),
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please enter valid email address.')
        .bail()
        .custom((value) => User.findOne({ email: value, status: true }).then((user) => {
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
];

const activation = [
    param('token')
        .trim()
        .notEmpty()
        .withMessage('Missing access token.')
        .bail()
        .custom((value) => User.findOne({
            resetToken: value, status: false, resetTokenExpiration: { $gt: Date.now() },
        }).then((user) => {
            if (!user) {
                return Promise.reject(new Error('Access token is not valid or expired.'));
            }
        })),
];

const login = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please enter valid email address.')
        .bail()
        .custom((value) => User.findOne({ email: value, status: true }).then((user) => {
            if (!user) {
                return Promise.reject(new Error('Email address you entered does not exist or not active.'));
            }
        }))
        .normalizeEmail(),
    body('password', 'Password must be 8 chars long and contain capital letters, numbers and symbols.')
        .trim()
        .matches(PASSWORD_COMPLEXITY),
];

const resetRequest = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please enter valid email address.')
        .bail()
        .custom((value) => User.findOne({ email: value, status: true }).then((user) => {
            if (!user) {
                return Promise.reject(new Error('Email address you entered does not exist or not active.'));
            }
        }))
        .normalizeEmail(),
];

const resetToken = [
    param('token')
        .trim()
        .notEmpty()
        .withMessage('Missing access token.')
        .bail()
        .custom((value) => User.findOne({
            resetToken: value, status: true, resetTokenExpiration: { $gt: Date.now() },
        }).then((user) => {
            if (!user) {
                return Promise.reject(new Error('Access token is not valid or expired.'));
            }
        })),
];

const resetPassword = [
    body('id')
        .trim()
        .notEmpty()
        .withMessage('Missing ID.')
        .bail()
        .custom((value) => {
            if (!mongoose.isValidObjectId(value)) {
                return Promise.reject(new Error('Invalid ID'));
            }
            return User.findById(value).then((user) => {
                if (!user) {
                    return Promise.reject(new Error('User account for the ID not found.'));
                }
            });
        }),
    body('token')
        .trim()
        .notEmpty()
        .withMessage('Missing access token.')
        .bail()
        .custom((value) => User.findOne({ resetToken: value, resetTokenExpiration: { $gt: Date.now() } }).then((user) => {
            if (!user) {
                return Promise.reject(new Error('Access token is not valid or expired.'));
            }
        })),
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please enter valid email address.')
        .bail()
        .custom((value) => User.findOne({ email: value }).then((user) => {
            if (!user) {
                return Promise.reject(new Error('Email address you entered not found.'));
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
];

module.exports = {
    signup,
    activation,
    login,
    resetRequest,
    resetToken,
    resetPassword,
};
