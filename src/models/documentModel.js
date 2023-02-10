const mongoose = require('mongoose');
const fileHelper = require('../helpers/fileHelper');
const { UPLOAD_FILE_SIZE, DOCUMENT_TYPES, DOCUMENT_FILE_FORMATS } = require('../config');

const { Schema } = mongoose;

const documentSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    type: {
        type: String,
        enum: {
            values: Object.keys(DOCUMENT_TYPES),
            message: '{VALUE} is not supported',
        },
        required: true,
        lowercase: true,
    },
    buffer: {
        type: Buffer,
    },
    path: {
        type: String,
    },
    destination: {
        type: String,
        set: function set(destination) { // This magic stores previous value of destination in the _destination to allow later use in the pre('save')
            this._destination = this.destination;
            return destination;
        },
    },
    filename: {
        type: String,
        set: function set(filename) { // This magic stores previous value of filename in the _filename to allow later use in the pre('save')
            this._filename = this.filename;
            return filename;
        },
    },
    originalname: {
        type: String,
    },
    mimetype: {
        type: String,
        enum: {
            values: DOCUMENT_FILE_FORMATS,
            message: '{VALUE} is not supported',
        },
    },
    size: {
        type: Number,
        max: [UPLOAD_FILE_SIZE, `Maximum file size should be ${UPLOAD_FILE_SIZE}`],
    },
    approved: {
        type: Boolean,
        required: true,
        default: false,
    },
    expiresAt: {
        type: Date,
        required: true,
        default: () => Date.now() + 364 * 24 * 60 * 60 * 1000, // By Default Expires after 364 days
        min: [Date.now(), 'Expiration date should be in the future. {VALUE} received.'], // Couldn't be less than now
    },
    owner: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
}, {
    timestamps: true,
});

/** Gets document file from source and returnsa a stream to domwnload */
documentSchema.methods.getContent = function getContent() {
    try {
        const { path } = this || {};
        return fileHelper.getFile(path);
    } catch (err) {
        throw new Error(err.message);
    }
};

// Middleware of Document model

// This is a query type middleware,  so this will be a query and not document
documentSchema.post('findOneAndDelete', async (doc, next) => {
    fileHelper.deleteFile(doc?.destination, doc?.filename);
    console.debug('Document before findOneAndDelete triggered.', doc?.path);
    next();
});

/** Document type middleware. Runs before Document model saves */
documentSchema.pre('save', function save(next) {
    const doc = this;
    if (!doc.isNew && doc.isModified('filename')) {
        fileHelper.deleteFile(doc?._destination, doc?._filename);
    }
    console.debug('Document beforeSave triggered.');
    next();
});

/** Document type middleware. Runs after Document model saves */
documentSchema.post('save', async (doc, next) => {
    console.debug(`Document afterSave triggered. ${doc.filename}`);
    next();
});

/** Create Document model and assign documentSchema to Document model */
module.exports = mongoose.models.Document || mongoose.model('Document', documentSchema);
