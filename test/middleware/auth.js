const { expect } = require('chai');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const { isAuth: authMiddleware } = require('../../src/middleware/auth');

describe('Auth middleware', function () {
    it('should throw an exception when not Authorization header found', () => {
        const req = {
            get(headerName) {
                return null;
            },
        };

        expect(authMiddleware.bind(this, req, {}, () => { })).to.throw('No Authentication Data');
    });

    it('should thow exception when receives wrong token', () => {
        const req = {
            get(headerName) {
                return 'xyz';
            },
        };

        expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
    });

    it('should throw  an exception when cannot verify token', () => {
        const req = {
            get(headerName) {
                return 'Bearer XYZ';
            },
        };
        expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
    });

    it('should contain userId after decoding the token. Used Stab for verify method.', () => {
        const req = {
            get(headerName) {
                return 'Bearer ZSDFsadfasdf';
            },
        };

        sinon.stub(jwt, 'verify');
        jwt.verify.returns({ userId: 'ABC' });

        authMiddleware(req, {}, () => {});
        expect(req).to.have.property('userId');
        expect(req).to.have.property('userId', 'ABC');
        expect(jwt.verify.called).to.be.equal(true);

        jwt.verify.restore();
    });
});
