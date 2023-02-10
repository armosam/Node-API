const { User } = require('../models/index');
const ErrorException = require('../helpers/ErrorException');
const BaseService = require('./base');

// Authentication Service
class AuthService extends BaseService {
    constructor(user = null) {
        super();
        this.User = user || User;
    }

    /**
     * Signup user account
     * @param {Object} - Data for signup
     * @returns
     */
    async signup({ name, email, password, baseUrl }) {
        if (!name || !email || !password) {
            throw new ErrorException(404, 'Missing signup data.');
        }
        
        let user = await this.User.findOne({ email });
        
        if (user) {
            // Check when user re-signup then update data ande re-send activation email
            if (user.status === true) {
                throw new ErrorException(400, 'Email Address already in use. Choose another one.');
            }
            user.name = name;
            user.password = password;
        } else {
            user = new this.User({ name, email, password });
        }

        await user.generateResetToken();
        const userCrteated = await user.save();

        this.emit('signup_account', userCrteated, baseUrl);

        return userCrteated;
    }

    /**
     * Activate Account
     * @param {Object} - Activation Token
     * @returns {Object} - Activated user
     */
    async activation({ token }) {
        if (!token) {
            throw new ErrorException(404, 'Missing access token.');
        }
        // const { token } = req.params || {};
        const user = await this.User.findOne({ resetToken: token, status: false, resetTokenExpiration: { $gt: Date.now() } });

        if (!user) {
            throw new ErrorException(404, 'User account for this token not found.');
        }

        user.status = true;
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;
        user.tokens = [];
        const userActivated = await user.save();

        this.emit('activate_account', userActivated);

        return userActivated;
    }

    /**
     * Returns user and token found by email and password
     * @param {Object} - Email Address and Password
     * @returns {Object}
     */
    async login({ email, password }) {
        if (!email || !password) {
            throw new ErrorException(404, 'Missing login data.');
        }

        const user = await this.User.findByAuth(email, password);
        const token = await user.generateAccessToken();

        this.emit('login_account', user, token);

        return { user, token };
    }

    /**
     * Request Password Reset
     * @param {Object}
     * @returns {Object}
     */
    async resetRequest({ email, baseUrl }) {
        if (!email) {
            throw new ErrorException(404, 'Missing email address.');
        }

        const user = await this.User.findOne({ email, status: true });
        if (!user) {
            throw new ErrorException(404, 'User with this email address not found or not active');
        }

        await user.generateResetToken();
        const userResetRequest = await user.save();

        this.emit('password_reset_request_for_account', userResetRequest, baseUrl);

        return userResetRequest;
    }

    /**
     * Verify rest token
     * @param {Object}
     * @returns {Object}
     */
    async resetToken({ token }) {
        if (!token) {
            throw new ErrorException(404, 'Missing access token.');
        }

        const user = await this.User.findOne({ resetToken: token, status: true, resetTokenExpiration: { $gt: Date.now() } });
        if (!user) {
            throw new ErrorException(404, 'User account for this token not found or not active.');
        }

        this.emit('password_reset_token_for_account', user);

        return user;
    }

    /**
     * Reset password
     * @param {Object}
     * @returns {Object}
     */
    async resetPassword({ id, email, password, token }) {
        if (!id || !email || !password || !token) {
            throw new ErrorException(404, 'Missing password reset data.');
        }

        const user = await this.User.findOne({
            _id: id,
            email,
            resetToken: token,
            resetTokenExpiration: { $gt: Date.now() },
        });

        if (!user) {
            throw new ErrorException(404, 'User account not found.');
        }

        user.password = password;
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;
        user.tokens = [];
        const userReset = await user.save();

        if (!userReset) {
            throw new ErrorException('503', 'Password failed to reset.');
        }

        this.emit('password_reset_for_account', userReset);

        return userReset;
    }
}

module.exports = AuthService;
