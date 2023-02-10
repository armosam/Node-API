const { expect } = require('chai');
const sinon = require('sinon');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../../src/models/index');
const { authController } = require('../../src/controllers/index');

describe('Auth Controller - Login', () => {
    context('When user throws an error', () => {
        it('should return error code and message', async (done) => {
            const userStub = sinon
                .stub(User, 'findByAuth')
                .withArgs('a@a.am', 'Pass123!')
                .throws(new Error('Unknown error in the user model'));

            const req = {
                body: {
                    email: 'a@a.am',
                    password: 'Pass123!',
                },
            };
            const res = {};
            await authController.login(req, res, () => { });
            expect(userStub.calledOnce).to.be.equal(true);
            expect(userStub.throwsException()).to.be.equal(true);
            authController.login(req, res, () => { })
                .then((result) => {
                    expect(result).to.throw('Unknown error in the user model');
                    expect(result).to.be.an('error');
                    expect(result).to.have.property('code', 500);
                    expect(result).to.have.property('message', 'Unknown error in the user model');
                    expect(res).to.have.property('errors', undefined);
                    userStub.restore();
                    User.findByAuth.restore();
                    done();
                });
        });
    });

    context('When user not found by email', () => {
        it('should return error code 401 and message', async () => {
            const userFindOne = sinon.stub(User, 'findOne').returns(null);
            const req = {
                body: {
                    email: 'a@a.am',
                    password: 'Pass123!',
                },
            };
            const status = sinon.stub().returns(401);
            const json = sinon.spy();
            const res = { status, json };
            const autControllerLogin = await authController.login(req, res, () => { });
            expect(userFindOne.calledOnce).to.be.equal(true);
            expect(autControllerLogin).to.be.an('error');
            expect(autControllerLogin).to.have.property('code', 401);
            expect(autControllerLogin).to.have.property('message', 'Wrong email address or password.');
            expect(autControllerLogin).to.have.property('errors', undefined);
            userFindOne.restore();
        });
    });

    context('When user not found by email', () => {
        it('should return error code 401 and message', (done) => {
            sinon.stub(User, 'findOne');
            User.findOne.returns(null);
            const req = {
                body: {
                    email: 'a@a.am',
                    password: 'Pass123!',
                },
            };
            authController.login(req, {}, () => { }).then((result) => {
                expect(result).to.be.an('error');
                expect(result).to.have.property('code', 401);
                expect(result).to.have.property('message', 'User with this email not found.');
                expect(result).to.have.property('errors', undefined);
                done();
                User.findOne.restore();
            });
        });
    });

    context('When bcrypt throws error', () => {
        it('should return error code 500 ', (done) => {
            sinon.stub(User, 'findOne');
            User.findOne.returns({ email: 'a@a.am', password: 'Pass123!', _id: '62f5d8846199554c38b05a66' });
            sinon.stub(bcrypt, 'compare');
            bcrypt.compare.throws();
            const req = {
                body: {
                    email: 'a@a.am',
                    password: 'Pass123!',
                },
            };
            authController.login(req, {}, () => { }).then((result) => {
                expect(result).to.be.an('error');
                expect(result).to.have.property('statusCode', 500);
                expect(result).to.have.property('message', 'Error');
                done();
                User.findOne.restore();
                bcrypt.compare.restore();
            });
        });
    });

    context('When password does not match', () => {
        it('should return error 401 and message', (done) => {
            sinon.stub(User, 'findOne');
            User.findOne.returns({ email: 'a@a.am', password: 'Pass123!' });
            sinon.stub(bcrypt, 'compare');
            bcrypt.compare.returns(false);
            const req = {
                body: {
                    email: 'a@a.am',
                    password: 'Pass123!',
                },
            };
            authController.login(req, {}, () => { }).then((result) => {
                expect(result).to.be.an('error');
                expect(result).to.have.property('statusCode', 401);
                expect(result).to.have.property('message', 'Wrong Password');
                done();
                bcrypt.compare.restore();
                User.findOne.restore();
            });
        });
    });

    context('When login is successful', () => {
        it('should return an object with success code 200', (done) => {
            sinon.stub(User, 'findOne');
            User.findOne.returns({ email: 'a@a.am', password: 'Pass123!', _id: '62f5d8846199554c38b05a66' });
            sinon.stub(bcrypt, 'compare');
            bcrypt.compare.returns(true);
            const req = {
                body: {
                    email: 'a@a.am',
                    password: 'Pass123!',
                },
            };
            const res = {
                status(code) {
                    this.statusCode = code;
                    return this;
                },
                json(data) {
                    this.token = data.token;
                    this.userId = data.userId;
                    return this;
                },
            };
            authController.login(req, res, () => { }).then(() => {
                expect(res.statusCode).to.be.equal(200);
                expect(res).to.have.property('statusCode', 200);
                expect(res).to.have.property('userId', '62f5d8846199554c38b05a66');
                expect(res).to.have.property('token');
                const decodedToken = jwt.verify(res.token, 'superstrongsecretstoredinserver');
                expect(decodedToken).to.have.property('userId', res.userId);
                expect(decodedToken).to.have.property('email', req.body.email);
                done();
                bcrypt.compare.restore();
                User.findOne.restore();
            });
        });
    });
});
