// Get the profile of logged in user
exports.getProfile = async (req, res, next) => {
    try {
        const { user } = req || {};
        const userProfile = await req.service.getProfile(user);

        res.status(200).json(userProfile);
    } catch (err) {
        next(err);
    }
};

// Update the profile of logged in user
exports.updateProfile = async (req, res, next) => {
    try {
        const { user, body, file } = req || {};
        req.user = await req.service.updateProfile({ user, body, file });

        res.status(200).json(req.user);
    } catch (err) {
        next(err);
    }
};

// Download profile avatar
exports.getProfileAvatar = async (req, res, next) => {
    try {
        const { user } = req || {};
        const { avatar, file } = await req.service.getAvatar(user);

        res.setHeader('Content-Type', avatar?.mimetype);
        res.setHeader('Content-Disposition', `attachment: filename="${avatar.filename}"`);
        file.pipe(res);
    } catch (err) {
        next(err);
    }
};

// Upload profile avatar
exports.uploadProfileAvatar = async (req, res, next) => {
    try {
        const { user, file } = req || {};
        req.user = await req.service.uploadAvatar({ user, file });

        res.status(200).json({ message: 'Avatar successfully uploaded' });
    } catch (err) {
        next(err);
    }
};

exports.deleteProfileAvatar = async (req, res, next) => {
    try {
        const { user } = req || {};
        req.user = await req.service.deleteAvatar(user);

        res.status(200).json({ message: 'Avatar successfully removed' });
    } catch (err) {
        next(err);
    }
};

// Log out user from current endpoint
exports.logout = async (req, res, next) => {
    try {
        const { user, token } = req || {};
        req.user = await req.service.logout({ user, token });
        req.user = undefined;

        res.status(200).send({ message: 'User logged out' });
    } catch (err) {
        next(err);
    }
};

// Log out user from all logged in endpoints
exports.logoutAll = async (req, res, next) => {
    try {
        const { user } = req || {};
        await req.service.logoutAll(user);
        req.user = undefined;

        res.status(200).send({ message: 'All users logged out' });
    } catch (err) {
        next(err);
    }
};
