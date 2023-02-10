// Gets alist of user accounts
exports.listAccounts = async (req, res, next) => {
    try {
        const { page = 1 } = req.query || {};
        const users = await req.service.listAccounts({ page, fullList: false });

        res.status(200).json(users);
    } catch (err) {
        next(err);
    }
};

// Gets user account
exports.getAccount = async (req, res, next) => {
    try {
        const { id } = req.params || {};
        const user = await req.service.getAccount(id);

        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
};

// Creates User account
exports.createAccount = async (req, res, next) => {
    try {
        const { body, file } = req || {};
        const user = await req.service.createAccount({ body, file });

        res.status(201).json(user);
    } catch (err) {
        next(err);
    }
};

// Updates user account
exports.updateAccount = async (req, res, next) => {
    try {
        const { id } = req.params || {};
        const { body, file } = req || {};
        const user = await req.service.updateAccount({ id, body, file });

        res.status(201).json(user);
    } catch (err) {
        next(err);
    }
};

// Deletes user account
exports.deleteAccount = async (req, res, next) => {
    try {
        const { id } = req.params || {};
        const user = await req.service.deleteAccount(id);

        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
};

// Get account avatar
exports.getAccountAvatar = async (req, res, next) => {
    try {
        const { id } = req.params || {};
        const { avatar, file } = await req.service.getAvatar(id);

        res.setHeader('Content-Type', avatar?.mimetype);
        res.setHeader('Content-Disposition', `attachment: filename="${avatar?.filename}"`);
        file.pipe(res);
    } catch (err) {
        next(err);
    }
};

// Upload account avatar
exports.uploadAccountAvatar = async (req, res, next) => {
    try {
        const { id } = req.params || {};
        const { file } = req || {};
        await req.service.uploadAvatar({ id, file });

        res.status(200).json({ message: 'Avatar successfully uploaded' });
    } catch (err) {
        next(err);
    }
};

// Delete account avatar
exports.deleteAccountAvatar = async (req, res, next) => {
    try {
        const { id } = req.params || {};
        await req.service.deleteAvatar(id);

        res.status(200).json({ message: 'Avatar successfully removed' });
    } catch (err) {
        next(err);
    }
};
