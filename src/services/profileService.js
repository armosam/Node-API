const { Image } = require('../models/index');
const ErrorException = require('../helpers/ErrorException');
const BaseService = require('./base');

// User Service
class ProfileService extends BaseService {
    constructor(image = null) {
        super();
        this.Image = image || Image;
        this.allowedFields = ['name', 'email', 'password', 'age', 'status', 'isAdmin'];
    }

    async getProfile(user) {
        if (!user) {
            throw new ErrorException(404, 'User profile not found.');
        }

        // if (user.avatar) {
        //     await user.populate(['avatar']);
        // }

        this.emit('get_profile', user);

        return user;
    }

    async updateProfile({ user, body = {}, file }) {
        if (!user) {
            throw new ErrorException(404, 'User profile not found.');
        }

        // Remove not allowed fields from request body
        const update = Object.fromEntries(Object.entries({ ...body }).filter(([key]) => this.allowedFields.includes(key)));

        // Assign body updates for logged user
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

        this.emit('update_profile', userUpdate);

        return userUpdate;
    }

    async getAvatar(user) {
        if (!user) {
            throw new ErrorException(404, 'User profile not found.');
        }

        await user.populate(['avatar']);

        const { avatar } = user;

        if (!avatar) {
            throw new ErrorException(404, 'User avatar not found');
        }

        const file = await avatar.getContent();

        this.emit('get_profile_avatar', avatar, file);

        return { avatar, file };
    }

    async uploadAvatar({ user, file }) {
        if (!user) {
            throw new ErrorException(404, 'User profile not found.');
        }
        if (!file) {
            throw new ErrorException(503, 'File upload failed.');
        }

        if (user.avatar) {
            await this.Image.findByIdAndDelete(user.avatar);
        }

        const image = new this.Image({ title: user.name, ...file, owner: user._id });
        await image.save();
        user.avatar = image._id;
        await user.save();

        this.emit('upload_profile_avatar', user);

        return user;
    }

    async deleteAvatar(user) {
        if (!user) {
            throw new ErrorException(404, 'User profile not found.');
        }

        if (!user.avatar) {
            throw new ErrorException(404, 'No avatar found for the user');
        }

        await this.Image.findByIdAndDelete(user.avatar);
        user.avatar = undefined;
        await user.save();

        this.emit('delete_profile_avatar', user);

        return user;
    }

    async logout({ user, token = '' }) {
        if (!user) {
            throw new ErrorException(404, 'User profile not found.');
        }
        user.tokens = user.tokens.filter((item) => item.token !== token);
        await user.save();

        this.emit('logout_profile', user);

        return user;
    }

    async logoutAll(user) {
        if (!user) {
            throw new ErrorException(404, 'User profile not found.');
        }
        user.tokens = [];
        await user.save();

        this.emit('get_all_profiles', user);

        return user;
    }
}

module.exports = ProfileService;
