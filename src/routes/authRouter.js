const express = require('express');
const { authController: controller } = require('../controllers/index');
const { authValidator: validator } = require('../validations/index');
const { attach, AuthService: service } = require('../services/index');
const isValid = require('../middleware/validation');

const router = express.Router();

router.post('/signup', validator.signup, isValid, attach({ service }), controller.signup);

router.get('/activate/:token', validator.activation, isValid, attach({ service }), controller.activation);

router.post('/login', validator.login, isValid, attach({ service }), controller.login);

router.post('/reset-request', validator.resetRequest, isValid, attach({ service }), controller.resetRequest);

router.get('/reset-token/:token', validator.resetToken, isValid, attach({ service }), controller.resetToken);

router.post('/reset-password', validator.resetPassword, isValid, attach({ service }), controller.resetPassword);

module.exports = router;
