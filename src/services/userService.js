const mongoose = require('mongoose');
const { User, Image } = require('../models/index');
const { ITEMS_PER_PAGE } = require('../config');
const ErrorException = require('../helpers/ErrorException');
const BaseService = require('./base');

// User Service
class UserService extends BaseService {
    constructor(user = null, image = null) {
        super();
        this.User = user || User;
        this.Image = image || Image;
        this.allowedFields = ['name', 'email', 'password', 'age', 'status', 'isAdmin'];
    }

    async listAccounts({ page = 1, fullList = false }) {
        const perPage = ITEMS_PER_PAGE;
        const totalCount = await this.User.find().countDocuments();
        let users = [];
        if (totalCount > 0) {
            if (fullList) {
                users = await this.User
                    .find()
                    .populate(['avatar', 'posts'])
                    .skip((page - 1) * perPage)
                    .limit(perPage);
            } else {
                users = await this.User
                    .find()
                    .skip((page - 1) * perPage)
                    .limit(perPage);
            }
        }

        this.emit('list_accounts', users);

        return { users, totalCount };
    }

    async getAccount(id) {
        if (!id) {
            throw new ErrorException(404, 'User ID not found.');
        }

        const user = await this.User.findById(id);
        if (!user) {
            throw new ErrorException(404, 'User account not found.');
        }

        this.emit('get_account', user);

        return user;
    }

    async createAccount({ body = {}, file }) {
        if (!body) {
            throw new ErrorException(400, 'Missing data to create an account.');
        }

        // Remove not allowed fields from request body
        const data = Object.fromEntries(Object.entries({ ...body }).filter(([key]) => this.allowedFields.includes(key)));
        const user = new this.User(data);
        user._id = new mongoose.Types.ObjectId();

        if (file) {
            const image = new this.Image({ title: user.name, ...file, owner: user._id });
            await image.save();
            user.avatar = image._id;
        }

        await user.save();

        this.emit('create_account', user);

        return user;
    }

    async updateAccount({ id, body = {}, file }) {
        if (!id) {
            throw new ErrorException(404, 'User ID not found');
        }

        // Remove not allowed fields from request body
        const update = Object.fromEntries(Object.entries({ ...body }).filter(([key]) => this.allowedFields.includes(key)));

        const user = await this.User.findById(id);
        if (!user) {
            throw new ErrorException(404, 'User account not found');
        }

        // Assign body updates for user
        const userUpdate = Object.assign(user, update);

        if (file) {
            if (user.avatar) {
                await this.Image.findByIdAndDelete(user.avatar);
            }

            const image = new this.Image({ title: userUpdate.name, ...file, owner: user._id });
            await image.save();
            userUpdate.avatar = image._id;
        }

        await userUpdate.save();

        this.emit('update_account', userUpdate);

        return userUpdate;
    }

    async deleteAccount(id) {
        if (!id) {
            throw new ErrorException(404, 'User ID not found');
        }

        const user = await this.User.findById(id);
        if (!user) {
            throw new ErrorException(404, 'User account not found.');
        }

        if (user.avatar) {
            await this.Image.findByIdAndDelete(user.avatar);
        }

        await this.User.findByIdAndDelete(id);

        this.emit('delete_account', user);

        return user;
    }

    async getAvatar(id) {
        if (!id) {
            throw new ErrorException(404, 'User ID not found');
        }

        const user = await this.User.findById(id).populate(['avatar']);
        if (!user) {
            throw new Error('User account not found');
        }

        const { avatar } = user;

        if (!avatar) {
            throw new ErrorException(404, 'User avatar not found');
        }

        const file = await avatar.getContent();

        this.emit('get_account_avatar', avatar, file);

        return { avatar, file };
    }

    async uploadAvatar({ id, file }) {
        if (!id) {
            throw new ErrorException(404, 'User ID not found');
        }

        if (!file) {
            throw new ErrorException(503, 'File upload failed.');
        }

        const user = await this.User.findById(id);
        if (!user) {
            throw new ErrorException(404, 'User account not found.');
        }

        if (user.avatar) {
            await this.Image.findByIdAndDelete(user.avatar);
        }

        const image = new this.Image({ title: user.name, ...file, owner: user._id });
        await image.save();
        user.avatar = image._id;
        await user.save();

        this.emit('upload_account_avatar', user);

        return user;
    }

    async deleteAvatar(id) {
        if (!id) {
            throw new ErrorException(404, 'User ID not found');
        }

        const user = await this.User.findById(id);
        if (!user) {
            throw new ErrorException(404, 'User account not found.');
        }

        if (!user.avatar) {
            throw new ErrorException(404, 'No avatar found for the user');
        }

        await this.Image.findByIdAndDelete(user.avatar);
        user.avatar = undefined;
        await user.save();

        this.emit('delete_account_avatar', user);

        return user;
    }
}

module.exports = UserService;
