require('dotenv').config(); // load env configuration to the process.env
const path = require('path');

exports.ENV_PROD = process.env.NODE_ENV === 'production';

exports.PORT = process.env.PORT || 5000;
exports.PASSWORD_COMPLEXITY = /^((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\W_])).{8,}$/;
exports.MONGODB_URI = process.env.MONGODB_URI;

exports.UPLOAD_FILE_SIZE = 7 * 1024 * 1024; // 7Mb

exports.AVATAR_SIZE = { width: 800, height: 600 };
exports.IMAGE_DEFAULT_SIZE = { width: 1024, height: 768 };
exports.IMAGE_FILE_FORMATS = ['image/png', 'image/jpg', 'image/jpeg'];
exports.IMAGE_FILE_DESTINATION = path.join(__dirname, 'images');

exports.DOCUMENT_TYPES = { dl: 'Driver License', ssn: 'SSN', resume: 'Resume', insurance: 'Insurance' };
exports.DOCUMENT_FILE_FORMATS = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpg', 'image/jpeg'];
exports.DOCUMENT_FILE_DESTINATION = path.join(__dirname, 'documents');

exports.ITEMS_PER_PAGE = 3;
exports.SEND_NOTIFICATION = false;
