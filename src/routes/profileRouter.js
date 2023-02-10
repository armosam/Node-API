const express = require('express');
const { profileController: controller } = require('../controllers/index');
const { profileValidator: validator } = require('../validations/index');
const { upload, resizeImage } = require('../middleware/imageUpload');
const { attach, ProfileService: service } = require('../services/index');
const { isAuth } = require('../middleware/auth');
const isValid = require('../middleware/validation');
const { AVATAR_SIZE } = require('../config');

const router = express.Router();

router.get('/', isAuth, attach({ service }), controller.getProfile);

router.put('/', isAuth, upload.single('avatar'), validator.updateProfile, isValid, resizeImage(AVATAR_SIZE), attach({ service }), controller.updateProfile);

router.get('/avatar', isAuth, attach({ service }), controller.getProfileAvatar);

router.post('/avatar', isAuth, upload.single('avatar'), validator.uploadProfileAvatar, isValid, resizeImage(AVATAR_SIZE), attach({ service }), controller.uploadProfileAvatar);

router.delete('/avatar', isAuth, attach({ service }), controller.deleteProfileAvatar);

router.post('/logout', isAuth, attach({ service }), controller.logout);

router.post('/logout-all', isAuth, attach({ service }), controller.logoutAll);

module.exports = router;
