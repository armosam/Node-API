// Signup  a new user account
exports.signup = async (req, res, next) => {
    try {
        const { name, email, password } = req.body || {};
        const baseUrl = req.getBaseUrl();
        const userCrteated = await req.service.signup({ name, email, password, baseUrl });

        res.status(201).json({ message: 'User Account Created Successfully', id: userCrteated._id.toString() });
    } catch (err) {
        next(err);
    }
};

exports.activation = async (req, res, next) => {
    try {
        const { token } = req.params || {};
        const userActivated = await req.service.activation({ token });

        res.status(200).json({ message: 'User Account Activated Successfully', id: userActivated._id.toString() });
    } catch (err) {
        next(err);
    }
};

// Login to user account
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body || {};
        const { user, token } = await req.service.login({ email, password });

        res.status(200).json({ id: user._id.toString(), token });
    } catch (err) {
        next(err);
        return err; // for test case
    }
};

// Sends password reset request to generate a password reset token and email with instruction link
exports.resetRequest = async (req, res, next) => {
    try {
        const { email } = req.body || {};
        const baseUrl = req.getBaseUrl();
        await req.service.resetRequest({ email, baseUrl });

        res.status(200).json({ message: 'Password reset instruction has been sent to your email address.' });
    } catch (err) {
        next(err);
    }
};

// Checks password reset token, parses it, retrives user id and returns id and token
exports.resetToken = async (req, res, next) => {
    try {
        const { token } = req.params || {};
        const user = await req.service.resetToken({ token });

        res.status(200).json({ id: user._id.toString(), token });
    } catch (err) {
        next(err);
    }
};

// Sends new password to reset. User need to enter email address to confirm account.
exports.resetPassword = async (req, res, next) => {
    try {
        const { id, email, password, token } = req.body || {};
        await req.service.resetPassword({ id, email, password, token });

        res.status(200).json({ message: 'Password Changed Successfully.' });
    } catch (err) {
        next(err);
    }
};
