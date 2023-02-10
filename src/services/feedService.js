const { Post, Image } = require('../models/index');
const { ITEMS_PER_PAGE } = require('../config');
const ErrorException = require('../helpers/ErrorException');
const BaseService = require('./base');

/** Feed Service class */
class FeedService extends BaseService {
    constructor(post = null, image = null) {
        super();
        this.Post = post || Post;
        this.Image = image || Image;
    }

    async listPosts({ page = 1, fullList = false }) {
        const perPage = ITEMS_PER_PAGE;
        const totalCount = await this.Post.find().countDocuments();
        let posts = [];
        if (totalCount > 0) {
            if (fullList) {
                posts = await this.Post
                    .find()
                    .populate(['image', 'owner'])
                    .skip((page - 1) * perPage)
                    .limit(perPage);
            } else {
                posts = await this.Post
                    .find()
                    .skip((page - 1) * perPage)
                    .limit(perPage);
            }
        }

        this.emit('list_posts', posts);

        return { posts, totalCount };
    }

    async getPost(id) {
        if (!id) {
            throw new ErrorException(400, 'Missing Post ID.');
        }

        const post = await this.Post.findById(id);
        if (!post) {
            throw new ErrorException(404, 'Post not found.');
        }

        this.emit('get_post', post);

        return post;
    }

    async createPost({ user, body, file }) {
        if (!user) {
            throw new ErrorException(404, 'User not found.');
        }

        const { title, content } = body || {};

        if (!title || !content) {
            throw new ErrorException(400, 'Missing data to create a post.');
        }

        const post = new this.Post({ title, content, owner: user._id });

        if (file) {
            const image = new this.Image({ title, ...file, owner: user._id });
            await image.save();
            post.image = image._id;
        }

        await post.save();
        user.posts.push(post);
        await user.save();

        this.emit('create_post', post);

        return post;
    }

    async updatePost({ user, id, body, file }) {
        if (!id) {
            throw new ErrorException(400, 'Missing Post ID.');
        }

        const post = await this.Post.findById(id);
        if (!post) {
            throw new ErrorException(404, 'Post not found.');
        }

        if (post.owner.toString() !== user._id.toString()) {
            throw new ErrorException(403, 'Not Authorized to updated');
        }

        const { title, content } = body || {};

        if (title) {
            post.title = title;
        }

        if (content) {
            post.content = content;
        }

        if (file) {
            if (post.image) {
                await this.Image.findByIdAndDelete(post.image);
            }

            const image = new this.Image({ title: post.title, ...file, owner: user._id });
            await image.save();
            post.image = image._id;
        }

        await post.save();

        this.emit('update_post', post);

        return post;
    }

    async deletePost({ user, id }) {
        if (!id) {
            throw new ErrorException(400, 'Missing Post ID.');
        }

        const post = await this.Post.findById(id);
        if (!post) {
            throw new ErrorException(404, 'Post not found.');
        }

        if (post.owner.toString() !== user._id.toString()) {
            throw new ErrorException(403, 'Not Authorized to updated');
        }

        if (post.image) {
            await this.Image.findByIdAndDelete(post.image);
        }

        await this.Post.findByIdAndDelete(id);
        user.posts.pull(id);
        await user.save();

        this.emit('delete_post', post);

        return post;
    }

    async getPostImage(id) {
        if (!id) {
            throw new ErrorException(404, 'Missing Post ID.');
        }

        const post = await this.Post.findById(id).populate(['image']);
        if (!post) {
            throw new ErrorException(404, 'Post not found');
        }

        const { image } = post;

        if (!image) {
            throw new ErrorException(404, 'Post image not found');
        }

        const file = await image.getContent();

        this.emit('get_post_image', image, file);

        return { image, file };
    }

    async uploadPostImage({ user, id, file }) {
        if (!id) {
            throw new ErrorException(404, 'Missing Post ID');
        }

        if (!file) {
            throw new ErrorException(503, 'File upload failed.');
        }

        const post = await this.Post.findById(id);
        if (!post) {
            throw new ErrorException(404, 'Post not found.');
        }

        if (post.owner.toString() !== user._id.toString()) {
            throw new ErrorException(403, 'Not Authorized to update');
        }

        if (post.image) {
            await this.Image.findByIdAndDelete(post.image);
        }

        const image = new this.Image({ title: post.title, ...file, owner: user._id });
        await image.save();
        post.image = image._id;
        await post.save();

        this.emit('upload_post_image', post);

        return post;
    }

    async deletePostImage({ user, id }) {
        if (!id) {
            throw new ErrorException(400, 'Missing Post ID.');
        }

        const post = await this.Post.findById(id);
        if (!post) {
            throw new ErrorException(404, 'Post not found.');
        }

        if (post.owner.toString() !== user._id.toString()) {
            throw new ErrorException(403, 'Not Authorized to delete');
        }

        if (!post.image) {
            throw new ErrorException(404, 'No image found for the post');
        }

        await this.Image.findByIdAndDelete(post.image);
        post.image = undefined;
        await post.save();

        this.emit('delete_post_image', post);

        return post;
    }
}

module.exports = FeedService;
