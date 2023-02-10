const { expect } = require('chai');
// const sinon = require('sinon');
const mongoose = require('mongoose');

const { User } = require('../../src/models/index');
const { userController } = require('../../src/controllers/index');

describe('User Controller', () => {
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

    it('should send a response with valid user status', (done) => {
        const req = { userId: '62f5d8846199554c38b05a66' };
        const res = {
            statusCode: 500,
            userStatus: null,
            status(code) {
                this.statusCode = code;
                return this;
            },
            json(data) {
                this.userStatus = data.status;
            },
        };

        userController.getStatus(req, res, () => { })
            .then(() => {
                expect(res.statusCode).to.be.equal(200);
                expect(res.userStatus).to.be.equal('It is me');
                done();
            });
    });

    after((done) => {
        User.deleteMany({})
            .then(() => mongoose.disconnect())
            .then(() => {
                done();
            });
    });
});
