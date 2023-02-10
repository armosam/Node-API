const mongoose = require('mongoose');

const { Schema } = mongoose;

const postSchema = new Schema({
    title: {
        type: String,
        trim: true,
        required: true,
        minLength: 3,
        maxLength: 200,
    },
    content: {
        type: String,
        required: true,
        minLength: 3,
    },
    image: {
        type: Schema.Types.ObjectId,
        ref: 'Image',
    },
    owner: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
}, { timestamps: true });

/** Creates Post model and assigns postSchema to the Post model */
module.exports = mongoose.models.Post || mongoose.model('Post', postSchema);
