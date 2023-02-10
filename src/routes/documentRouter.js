const express = require('express');
const { documentController: controller } = require('../controllers/index');
const { documentValidator: validator } = require('../validations/index');
const { upload } = require('../middleware/documentUpload');
const { attach, DocumentService: service } = require('../services/index');
const { isAuth } = require('../middleware/auth');
const isValid = require('../middleware/validation');

const router = express.Router();

router.get('/', isAuth, validator.pageNumber, isValid, attach({ service }), controller.getDocuments);

router.get('/:id', isAuth, validator.documentId, isValid, attach({ service }), controller.getDocument);

router.post('/', isAuth, upload.single('document'), validator.createDocument, isValid, attach({ service }), controller.createDocument);

router.put('/:id', isAuth, upload.single('document'), validator.updateDocument, isValid, attach({ service }), controller.updateDocument);

router.delete('/:id', isAuth, validator.documentId, isValid, attach({ service }), controller.deleteDocument);

// Get document file by ID
router.get('/file/:id', isAuth, validator.documentId, isValid, attach({ service }), controller.getDocumentFile);

module.exports = router;
