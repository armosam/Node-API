const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { randomBytes } = require('crypto');
const jwt = require('jsonwebtoken');

const ErrorException = require('../helpers/ErrorException');
const Post = require('./postModel');
const Image = require('./imageModel');
const Document = require('./documentModel');

const { Schema } = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                return Promise.reject(new Error('Email address is invalid.'));
            }
        },
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate: (value) => {
            if (value.toLowerCase().includes('password')) {
                return Promise.reject(new Error('Password cannot contain the word password!'));
            }
        },
    },
    resetToken: {
        type: String,
    },
    resetTokenExpiration: {
        type: Date,
    },
    age: {
        type: Number,
        default: null,
        max: 150,
    },
    status: {
        type: Boolean,
        default: false,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    tokens: [{
        token: {
            type: String,
            required: true,
        },
    }],
    avatar: {
        type: Schema.Types.ObjectId,
        ref: 'Image',
    },
    posts: [{
        type: Schema.Types.ObjectId,
        ref: 'Post',
    }],
}, {
    timestamps: true,
});

/**
 * Virtual property in the user model that references to the Document model
 * There are specifications for localField and foreignField fields
 */
userSchema.virtual('documents', {
    ref: 'Document',
    localField: '_id',
    foreignField: 'owner',
});

/**
 * Defining toJSON method allows us to manipulate data
 * express returns in res.send() method using JSON.stringify(user)
 * So this will affect on all routers where used res.send(user)
 * In this example we remove some data from user model before sending to requester
 */
userSchema.methods.toJSON = function toJSON() {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.resetToken;
    delete userObject.resetTokenExpiration;

    return userObject;
};

/**
 * Generates token, adds it to user's tokens, saves user and returns token as a result
 */
userSchema.methods.generateAccessToken = async function generateAccessToken() {
    try {
        const user = this;
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXP });
        if (!token) {
            console.debug(`Access token generation failed for user account by email ${user.email}.`);
            throw new ErrorException(401, 'Access Authorization Failed.');
        }
        user.tokens = user.tokens.concat({ token });
        await user.save();
        console.debug(`Generated Token: ${token.trim()}`);
        return token;
    } catch (err) {
        throw new ErrorException(err.code || 500, err.message);
    }
};

/**
 * Generates reset token, adds it to user's resetToken and sets resetTokenExpiration
 */
userSchema.methods.generateResetToken = async function generateResetToken(expiresIn = 3600000) {
    try {
        const user = this;
        const buffer = randomBytes(32);
        const token = buffer.toString('hex');

        if (!token) {
            console.debug(`Access token generation failed for user account by email ${user.email}.`);
            throw new ErrorException(401, 'Access Authorization Failed.');
        }

        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + expiresIn;
        console.debug(`Generated Token: ${token.trim()}`);
        return token;
    } catch (err) {
        throw new ErrorException(err.code || 500, err.message);
    }
};

/**
 * User class method
 * Find user by email and password credentials
 */
userSchema.statics.findByAuth = async function findByAuth(email, password) {
    try {
        const user = await this.findOne({ email, status: true });

        if (!user) {
            console.debug(`User account with email address ${email} not found`);
            throw new ErrorException(401, 'Wrong email address or password.');
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            console.debug(`Password ${password} did not match with existing one for user account by email ${email}`);
            throw new ErrorException(401, 'Wrong email address or password.');
        }
        return user;
    } catch (err) {
        console.error(err);
        throw new ErrorException(err.code || 500, err.message);
    }
};

// Middleware of User model

// This is a query type middleware,  so this will be a query  and not document
userSchema.post('findOneAndDelete', async (doc, next) => {
    console.debug('User before findOneAndDelete triggered.');
    // Here should be added to remove avatar, posts, documents or any other files of user
    await Post.findOneAndDelete({ owner: doc?._id });
    await Image.findOneAndDelete({ owner: doc?.avatar });
    await Image.findOneAndDelete({ owner: doc?._id });
    await Document.findOneAndDelete({ owner: doc?._id });
    next();
});

/**
 * Document type middleware. Hash password for user before saving the model
 */
userSchema.pre('save', async function save(next) {
    const user = this;

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 10);
    }

    console.debug('User beforeSave triggered');
    next();
});

/**
 * Document type middleware. Runs before remove of user and deletes all assigned credentials
 */
userSchema.pre('remove', async function remove(next) {
    const user = this;
    console.debug('User before remove triggered', user);
    // Here should be added to remove avatar, posts, documents or any other files of user
    await Post.findOneAndDelete({ owner: user._id });
    await Image.findOneAndDelete({ owner: user.avatar });
    await Image.findOneAndDelete({ owner: user._id });
    await Document.findOneAndDelete({ owner: user._id });
    next();
});

/**
 * Document type middleware. Runs after save of user model
 */
userSchema.post('save', async (doc, next) => {
    console.debug('User afterSave triggered', doc);
    next();
});

/** Creates User model and assigns userSchema to the User model */
module.exports = mongoose.models.User || mongoose.model('User', userSchema);
