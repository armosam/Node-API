const express = require('express');
const { userController: controller } = require('../controllers/index');
const { userValidator: validator } = require('../validations/index');
const { isAuth, isAdmin } = require('../middleware/auth');
const { resizeImage, upload } = require('../middleware/imageUpload');
const { attach, UserService: service } = require('../services/index');
const isValid = require('../middleware/validation');
const { AVATAR_SIZE } = require('../config');

const router = express.Router();

router.get('/', isAuth, isAdmin, validator.pageNumber, isValid, attach({ service }), controller.listAccounts);

router.post('/', isAuth, isAdmin, upload.single('avatar'), validator.createAccount, isValid, resizeImage(AVATAR_SIZE), attach({ service }), controller.createAccount);

router.get('/:id', isAuth, isAdmin, validator.userId, isValid, attach({ service }), controller.getAccount);

router.put('/:id', isAuth, isAdmin, upload.single('avatar'), validator.updateAccount, isValid, resizeImage(AVATAR_SIZE), attach({ service }), controller.updateAccount);

router.delete('/:id', isAuth, isAdmin, validator.userId, isValid, attach({ service }), controller.deleteAccount);

// Get account avatar by ID
router.get('/avatar/:id', isAuth, isAdmin, validator.userId, isValid, attach({ service }), controller.getAccountAvatar);

// Upload account avatar by ID
router.post('/avatar/:id', isAuth, isAdmin, upload.single('avatar'), validator.uploadAccountAvatar, isValid, resizeImage(AVATAR_SIZE), attach({ service }), controller.uploadAccountAvatar);

// Delete account avatar by ID
router.delete('/avatar/:id', isAuth, isAdmin, validator.userId, isValid, attach({ service }), controller.deleteAccountAvatar);

module.exports = router;
