const { expect } = require('chai');
const mongoose = require('mongoose');

const { User, Post } = require('../../src/models/index');
const { feedController } = require('../../src/controllers/index');

describe('Feed Controller', () => {
    before((done) => {
        mongoose.connect('mongodb://127.0.0.1:27017/test-shop?retryWrites=true&w=majority')
            .then((result) => {
                if (result) {
                    const user = User({
                        email: 'aaa@a.am',
                        password: 'test123',
                        name: 'Test Tester',
                        posts: [],
                        _id: '62f5d8846199554c38b05a66',
                    });
                    return user.save();
                }
            })
            .then(() => {
                done();
            });
    });

    it('should add a new post to the posts of creator', (done) => {
        const req = {
            body: {
                title: 'Test Title',
                content: 'Test Content',
            },
            file: {
                path: 'TestPath',
            },
            userId: '62f5d8846199554c38b05a66',
        };
        const res = {
            status(code) {
                this.statusCode = code;
                return this;
            },
            json(data) {
                this.message = data.message;
                this.post = data.post;
                this.user = data.user;
            },
        };

        feedController.createPost(req, res, () => {})
            .then(() => {
                expect(res).to.have.property('user');
                expect(res.user).to.have.property('posts');
                expect(res.user.posts).to.have.length(1);
                expect(res).to.have.property('statusCode', 201);
                expect(res).to.have.property('message', 'Post created successfully');
                expect(res).to.have.property('user');
                expect(res.user).to.have.property('id', '62f5d8846199554c38b05a66');
                expect(res).to.have.property('post');
                expect(res.post).to.have.property('title', 'Test Title');
                expect(res.post).to.have.property('content', 'Test Content');
                done();
            });
    });

    after((done) => {
        Post.deleteMany({})
            .then(() => User.deleteMany({}))
            .then(() => mongoose.disconnect())
            .then(() => {
                done();
            });
    });
});
