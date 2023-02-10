const mongoose = require('mongoose');
const fileHelper = require('../helpers/fileHelper');
const { UPLOAD_FILE_SIZE, IMAGE_FILE_FORMATS } = require('../config');

const { Schema } = mongoose;

const imageSchema = new Schema({
    title: {
        type: String,
        trim: true,
    },
    buffer: {
        type: Buffer,
    },
    path: {
        type: String,
    },
    destination: {
        type: String,
    },
    filename: {
        type: String,
    },
    originalname: {
        type: String,
    },
    mimetype: {
        type: String,
        enum: IMAGE_FILE_FORMATS,
    },
    size: {
        type: Number,
        max: UPLOAD_FILE_SIZE,
    },
    owner: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
}, {
    timestamps: true,
});

/** Gets image file from source and returnsa a stream to domwnload */
imageSchema.methods.getContent = function getContent() {
    try {
        const { path } = this || {};
        return fileHelper.getFile(path);
    } catch (err) {
        throw new Error(err.message);
    }
};

// Middleware of Image model

// This is a query type middleware,  so this will be a query  and not document
imageSchema.post('findOneAndDelete', async (doc, next) => {
    fileHelper.deleteFile(doc?.destination, doc?.filename);
    console.debug('Image before findOneAndDelete triggered.', doc?.path);
    next();
});

/** Document type middleware. Runs before Image model saves */
imageSchema.pre('save', async (next) => {
    console.debug('Image beforeSave triggered.');
    next();
});

/** Document type middleware. Runs after Image model saves */
imageSchema.post('save', async (doc, next) => {
    console.debug('Image afterSave triggered.');
    next();
});

/** Create Image model and assign imageSchema to Image model */
module.exports = mongoose.models.Image || mongoose.model('Image', imageSchema);
