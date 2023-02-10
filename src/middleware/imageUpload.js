const multer = require('multer'); // file uploader
const sharp = require('sharp'); // file resizer
const path = require('path');
const fs = require('fs');
const { randomUUID } = require('crypto');
const config = require('../config');

// Configure multer as a disk storage to save uploaded image files to the folder
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const destination = file ? path.join(config.IMAGE_FILE_DESTINATION, file.fieldname) : config.IMAGE_FILE_DESTINATION;
        if (!fs.existsSync(path.join(destination, 'original'))) {
            fs.mkdirSync(path.join(destination, 'original'), { recursive: true });
        }
        cb(null, destination);
    },
    filename: async (req, file, cb) => {
        // const fileName = `${Date.now()}_${file.originalname.split(' ').join('_')}`.toLowerCase();
        const fileName = path.join('original', `${Date.now()}_${randomUUID()}${path.extname(file.originalname).toLowerCase()}`);
        cb(null, fileName);
    },
});

// Configure allowed image file types to upload to the file storage
const fileFilter = (req, file, cb) => {
    req.wrongImageFormat = !config.IMAGE_FILE_FORMATS.includes(file.mimetype);
    cb(null, !req.wrongImageFormat);
};

// parse the uploaded file by name on the form and add to the req as a req.file data
exports.upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: config.UPLOAD_FILE_SIZE },
});

// resize avatar to the given size ({ width, height }) otherwise configured size
exports.resizeImage = (size) => async (req, res, next) => {
    if (req.file) {
        if (!size) {
            size = config.IMAGE_DEFAULT_SIZE;
        }
        const output = path.join(req.file.destination, path.basename(req.file.filename));

        // Resize image file and store in the production directory
        await sharp(req.file.buffer || req.file.path)
            .resize(size)
            .toFile(output);

        req.file.path = output;
        req.file.filename = path.basename(output);
    }

    next();
};
