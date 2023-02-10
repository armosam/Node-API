const multer = require('multer'); // file uploader
const path = require('path');
const fs = require('fs');
const { randomUUID } = require('crypto');
const config = require('../config');

// Configure multer as a disk storage to save uploaded document files to the folder
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const destination = file ? path.join(config.DOCUMENT_FILE_DESTINATION, file.fieldname) : config.DOCUMENT_FILE_DESTINATION;
        if (!fs.existsSync(destination)) {
            fs.mkdirSync(destination, { recursive: true });
        }
        cb(null, destination);
    },
    filename: async (req, file, cb) => {
        // const fileName = `${Date.now()}_${file.originalname.split(' ').join('_')}`.toLowerCase();
        const fileName = `${Date.now()}_${randomUUID()}${path.extname(file.originalname).toLowerCase()}`;
        cb(null, fileName);
    },
});

// Configure allowed image file types to upload to the file storage
const fileFilter = (req, file, cb) => {
    req.wrongDocumentFormat = !config.DOCUMENT_FILE_FORMATS.includes(file.mimetype);
    cb(null, !req.wrongDocumentFormat);
};

// parse the uploaded file by name on the form and add to the req as a req.file data
exports.upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: config.UPLOAD_FILE_SIZE },
});
