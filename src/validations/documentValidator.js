const { body, param, query } = require('express-validator');
const { DOCUMENT_TYPES } = require('../config');
const { Document } = require('../models/index');

const documentId = [
    param('id')
        .trim()
        .notEmpty()
        .withMessage('Missing Document ID.')
        .bail()
        .custom((value, { req }) => Document.findById(value).then((document) => {
            if (!document) {
                return Promise.reject(new Error('Document not found.'));
            }
            if (req.user && req.user._id.toString() !== document.owner.toString()) {
                return Promise.reject(new Error('Not Authorized to read or modify.'));
            }
        })),
];

const pageNumber = [
    query('page')
        .trim()
        .isInt({ min: 1 })
        .withMessage('Page is optional and could take an integer from 1 and greater values.'),
];

const createDocument = [
    body('title', 'Title should be alphanumeric value more than 5 characters')
        .trim()
        .escape()
        .isLength({ min: 3, max: 200 }),
    body('description', 'Description should be alphanumeric value more than 5 characters')
        .trim()
        .escape()
        .optional()
        .isLength({ min: 3 }),
    body('type', `Document type should be from the list of allowed types: ${Object.keys(DOCUMENT_TYPES).join(', ')}`)
        .trim()
        .escape()
        .isIn(Object.keys(DOCUMENT_TYPES)),
    body('document') // REQUIRED. returns false if uploaded and in format. true if not in format otherwise undefined
        .custom((value, { req }) => (req.wrongDocumentFormat === false))
        .withMessage('Please upload files in PDF, DOC, DOCX, JPG, PNG formats.'),
];

const updateDocument = [
    param('id')
        .trim()
        .notEmpty()
        .withMessage('Missing Document ID.')
        .bail()
        .custom((value, { req }) => Document.findById(value).then((document) => {
            if (!document) {
                return Promise.reject(new Error('Document not found.'));
            }
            if (req.user && req.user._id.toString() !== document.owner.toString()) {
                return Promise.reject(new Error('Not Authorized to modify.'));
            }
        })),
    body('title', 'Title should be alphanumeric value more than 5 characters')
        .trim()
        .escape()
        .optional()
        .isLength({ min: 3, max: 200 }),
    body('description', 'Description should be alphanumeric value more than 5 characters')
        .trim()
        .escape()
        .optional()
        .isLength({ min: 3 }),
    body('type', `Document type should be from the list of allowed types: ${Object.keys(DOCUMENT_TYPES).join(', ')}`)
        .trim()
        .escape()
        .optional()
        .isIn(Object.keys(DOCUMENT_TYPES)),
    body('document') // REQUIRED. returns false if uploaded and in format. true if not in format otherwise undefined
        .custom((value, { req }) => (req.wrongDocumentFormat === false))
        .withMessage('Please upload files in PDF, DOC, DOCX, JPG, PNG formats.'),
    body('approved')
        .optional()
        .custom((value, { req }) => (req.user?.isAdmin === true))
        .withMessage('Not authorized to change Approved status.'),
    body('expiresAt')
        .optional()
        .custom((value, { req }) => (req.user?.isAdmin === true))
        .withMessage('Not authorized to change the Expiration Date.')
        .bail()
        .custom((value) => (value && (new Date()) < (new Date(value))))
        .withMessage('Expiration Date should be in the future.'),
];

module.exports = {
    documentId,
    pageNumber,
    createDocument,
    updateDocument,
};
