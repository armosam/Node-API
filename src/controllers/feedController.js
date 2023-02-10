// Llist all posts
exports.getPosts = async (req, res, next) => {
    try {
        const { page = 1 } = req.query || {};
        const { posts, totalCount } = await req.service.listPosts({ page, fullList: false });

        res.status(200).json({ posts, totalCount });
    } catch (err) {
        next(err);
    }
};

// Get specific post
exports.getPost = async (req, res, next) => {
    try {
        const { id } = req.params || {};
        const post = await req.service.getPost(id);
        await post.populate(['owner', 'image']);

        res.status(200).json(post);
    } catch (err) {
        next(err);
    }
};

// Create a new post
exports.createPost = async (req, res, next) => {
    try {
        const { user, body, file } = req || {};
        const post = await req.service.createPost({ user, body, file });
        req.user = user;

        res.status(201).json(post);
    } catch (err) {
        next(err);
    }
};

// Update a specific post
exports.updatePost = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { user, body, file } = req || {};
        const post = await req.service.updatePost({ user, id, body, file });
        req.user = user;

        res.status(200).json(post);
    } catch (err) {
        next(err);
    }
};

// Delete a specific post
exports.deletePost = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { user } = req || {};
        const post = await req.service.deletePost({ user, id });
        req.user = user;

        res.status(200).json(post);
    } catch (err) {
        next(err);
    }
};

// Get post photo
exports.getPostImage = async (req, res, next) => {
    try {
        const { id } = req.params || {};
        const { image, file } = await req.service.getPostImage(id);

        res.setHeader('Content-Type', image?.mimetype);
        res.setHeader('Content-Disposition', `attachment: filename="${image?.filename}"`);
        file.pipe(res);
    } catch (err) {
        next(err);
    }
};

// Upload post photo
exports.uploadPostImage = async (req, res, next) => {
    try {
        const { id } = req.params || {};
        const { user, file } = req || {};
        await req.service.uploadPostImage({ user, id, file });
        req.user = user;

        res.status(200).json({ message: 'Post image successfully uploaded' });
    } catch (err) {
        next(err);
    }
};

// Delete post photo
exports.deletePostImage = async (req, res, next) => {
    try {
        const { id } = req.params || {};
        const { user } = req || {};
        await req.service.deletePostImage({ user, id });

        res.status(200).json({ message: 'Post image successfully removed' });
    } catch (err) {
        next(err);
    }
};
