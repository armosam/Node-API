const { body, param, query } = require('express-validator');
const { Post } = require('../models/index');

const postId = [
    param('id')
        .trim()
        .notEmpty()
        .withMessage('Missing Post ID.')
        .bail()
        .custom((value) => Post.findById(value).then((post) => {
            if (!post) {
                return Promise.reject(new Error('Post not found.'));
            }
        })),
];

const pageNumber = [
    query('page')
        .trim()
        .isInt({ min: 1 })
        .withMessage('Page is optional and could take an integer from 1 and greater values.'),
];

const createPost = [
    body('title', 'Title should be alphanumeric value more than 5 characters')
        .trim()
        .escape()
        .isLength({ min: 3, max: 200 }),
    body('content', 'Content should be alphanumeric value more than 5 characters')
        .trim()
        .escape()
        .isLength({ min: 3 }),
    body('photo') // OPTIONAL. returns false if uploaded and in format. true if not in format otherwise undefined
        .custom((value, { req }) => (req.wrongImageFormat !== true))
        .withMessage('Please upload files in JPG, PNG formats.'),
];

const updatePost = [
    param('id')
        .trim()
        .notEmpty()
        .withMessage('Missing ID.')
        .bail()
        .custom((value, { req }) => Post.findById(value).then((post) => {
            if (!post) {
                return Promise.reject(new Error('Post not found.'));
            }
            if (req.user && req.user._id.toString() !== post.owner.toString()) {
                return Promise.reject(new Error('Not Authorized to modify.'));
            }
        })),
    body('title', 'Title should be alphanumeric value more than 5 characters')
        .trim()
        .escape()
        .optional()
        .isLength({ min: 3, max: 200 }),
    body('content', 'Content should be alphanumeric value more than 5 characters')
        .trim()
        .escape()
        .optional()
        .isLength({ min: 3 }),
    body('photo') // OPTIONAL. returns false if uploaded and in format. true if not in format otherwise undefined
        .custom((value, { req }) => (req.wrongImageFormat !== true))
        .withMessage('Please upload files in JPG, PNG formats.'),
];

const uploadPostImage = [
    param('id')
        .trim()
        .notEmpty()
        .withMessage('Missing Post ID.')
        .bail()
        .custom((value, { req }) => Post.findById(value).then((post) => {
            if (!post) {
                return Promise.reject(new Error('Post not found.'));
            }
            if (req.user && req.user._id.toString() !== post.owner.toString()) {
                return Promise.reject(new Error('Not Authorized to modify.'));
            }
        })),
    body('photo') // REQUIRED. returns false if uploaded and in format. true if not in format otherwise undefined
        .custom((value, { req }) => (req.wrongImageFormat === false))
        .withMessage('Please upload files in JPG, PNG formats.'),
];

const deletePost = [
    param('id')
        .trim()
        .notEmpty()
        .withMessage('Missing Post ID.')
        .bail()
        .custom((value, { req }) => Post.findById(value).then((post) => {
            if (!post) {
                return Promise.reject(new Error('Post not found.'));
            }
            if (req.user && req.user._id.toString() !== post.owner.toString()) {
                return Promise.reject(new Error('Not Authorized to modify.'));
            }
        })),
];

module.exports = {
    postId,
    pageNumber,
    createPost,
    updatePost,
    deletePost,
    uploadPostImage,
};
