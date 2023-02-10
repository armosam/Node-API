const express = require('express');
const { feedController: controller } = require('../controllers/index');
const { feedValidator: validator } = require('../validations/index');
const { upload, resizeImage } = require('../middleware/imageUpload');
const { attach, FeedService: service } = require('../services/index');
const { isAuth } = require('../middleware/auth');
const isValid = require('../middleware/validation');

const router = express.Router();

router.get('/', isAuth, validator.pageNumber, isValid, attach({ service }), controller.getPosts);

router.get('/:id', isAuth, validator.postId, isValid, attach({ service }), controller.getPost);

router.post('/', isAuth, upload.single('photo'), validator.createPost, isValid, resizeImage(), attach({ service }), controller.createPost);

router.put('/:id', isAuth, upload.single('photo'), validator.updatePost, isValid, resizeImage(), attach({ service }), controller.updatePost);

router.delete('/:id', isAuth, validator.deletePost, isValid, attach({ service }), controller.deletePost);

// Get post image by ID
router.get('/image/:id', isAuth, validator.postId, isValid, attach({ service }), controller.getPostImage);

// Upload post image
router.post('/image/:id', isAuth, upload.single('photo'), validator.uploadPostImage, isValid, resizeImage(), attach({ service }), controller.uploadPostImage);

// Delete post image by ID
router.delete('/image/:id', isAuth, validator.deletePost, isValid, attach({ service }), controller.deletePostImage);

module.exports = router;
