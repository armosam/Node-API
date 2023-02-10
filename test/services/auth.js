const { expect } = require('chai');
const sinon = require('sinon');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../../src/models/index');
const { AuthService } = require('../../src/services/index');
const ErrorException = require('../../src/helpers/ErrorException');

describe('Auth Service - Signup method', function () {
    context('when provided empty name', function () {
        it.only('should throw an ErrorException and stop signup of new user', async function () {

            const data = { email: 'a@a.am', password: 'Test123!' };
            return AuthService.signup(data)
                .catch(err => {
                    expect(err).to.be.deep.equal(new ErrorException(404, 'Missing signup data.', {}));
                    expect(err).has.property('code', 404);
                    expect(err).has.property('message', 'Missing signup data.');    
            })
        });
    });
    context('when provided empty email', function () {
        it.only('should throw an ErrorException and stop signup of new user', async function () {
            const data = { name: 'test name', password: 'Test123!' };
            return AuthService.signup(data)
                .catch(err => {
                    expect(err).to.be.deep.equal(new ErrorException(404, 'Missing signup data.', {}));
                    expect(err).has.property('code', 404);
                    expect(err).has.property('message', 'Missing signup data.');
                })
        });
    });
    context('when provided empty password', function () {
        it.only('should throw an ErrorException and stop signup of new user', async function () {
            const data = { name: 'Test name', email: 'a@a.am' };
            return AuthService.signup(data)
                .catch(err => {
                    expect(err).to.be.deep.equal(new ErrorException(404, 'Missing signup data.', {}));
                    expect(err).has.property('code', 404);
                    expect(err).has.property('message', 'Missing signup data.');
                })
        });
    });
    context('when provided existing email address with active account', function () {
        it.only('should throw an ErrorException and stop signup of new user', async function () {
            const data = { name: 'Test name', email: 'a@a.am', password: 'Test123!' };
            
            // const userStub = sinon.stub(AuthService.User, 'findOne').returns({...data, status: true});
            // const authService = new AuthService(userStub); 

            return AuthService.signup(data)
                .catch(err => {
                    expect(err).to.be.deep.equal(new ErrorException(400, 'Email Address already in use. Choose another one.', {}));
                    expect(err).has.property('code', 400);
                    expect(err).has.property('message', 'Email Address already in use. Choose another one.');
                })
        });
    });
    context('when provided email exists with inactive account', function () {
        it.only('should overwrite existing data keeping email address only', async function () {
            const data = { name: 'Test Name', email: 'a@a.am', password: 'Test123!' };

            const userStub = sinon.stub(User, 'findOne').returnValues({ name: 'Old Test', email: 'b@b.am', password: 'TestTest', status: false });
            const authService = new AuthService(userStub);

            return authService.signup(data)
                .then(result => {
                    expect(result).has.property('name', 'test name');
                    expect(result).has.property('email', '');
                })
        });
    });
    context('when provided a password less than 6 characters', function () {
        it('should not signup a new user', async function () {

        });
    });
    context('when provided correct name email and password', function () {
        it('should not signup a new user', async function () {

        });
    });
});

describe('Auth Service - activation method', function () {
});

describe('Auth Service - login method', function () {
});

describe('Auth Service - requestReset method', function () {
});

describe('Auth Service - resetRequest method', function () {
});

describe('Auth Service - resetToken method', function () {
});

describe('Auth Service - resetPassword method', function () {
});


