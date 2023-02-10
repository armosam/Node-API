const fs = require('fs');
const path = require('path');
const ErrorException = require('./ErrorException');

// Get file from file system as a stream
exports.getFile = (filePath) => {
    if (!fs.existsSync(filePath)) {
        throw new ErrorException(404, 'File not found');
    }
    return fs.createReadStream(filePath);
};

// Delete given file and own original uploaded file from file system
exports.deleteFile = (destination, filename) => {
    if (destination && filename) {
        const filePath = path.join(destination, filename);
        if (fs.existsSync(filePath)) {
            // Delete old uploaded original file
            const oldUploadedOriginal = path.join(destination, 'original', filename);
            if (fs.existsSync(oldUploadedOriginal)) {
                fs.unlinkSync(oldUploadedOriginal);
            }

            return fs.unlinkSync(filePath);
        }
    }
};
