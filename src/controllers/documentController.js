// Llist all documents
exports.getDocuments = async (req, res, next) => {
    try {
        const { page = 1 } = req.query || {};
        const { user } = req || {};
        const { documents, totalCount } = await req.service.listDocuments({ user, page, fullList: false });

        res.status(200).json({ documents, totalCount });
    } catch (err) {
        next(err);
    }
};

// Get specific document
exports.getDocument = async (req, res, next) => {
    try {
        const { id } = req.params || {};
        const { user } = req || {};
        const document = await req.service.getDocument(user, id);
        await document.populate(['owner']);

        res.status(200).json(document);
    } catch (err) {
        next(err);
    }
};

// Create a new document
exports.createDocument = async (req, res, next) => {
    try {
        const { user, body, file } = req || {};
        const document = await req.service.createDocument({ user, body, file });

        res.status(201).json(document);
    } catch (err) {
        next(err);
    }
};

// Update a specific document
exports.updateDocument = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { user, body, file } = req || {};
        const document = await req.service.updateDocument({ user, id, body, file });

        res.status(200).json(document);
    } catch (err) {
        next(err);
    }
};

// Delete a specific document
exports.deleteDocument = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { user } = req || {};
        const document = await req.service.deleteDocument({ user, id });

        res.status(200).json(document);
    } catch (err) {
        next(err);
    }
};

// Get document file
exports.getDocumentFile = async (req, res, next) => {
    try {
        const { id } = req.params || {};
        const { user } = req || {};
        const { document, file } = await req.service.getDocumentFile(user, id);

        res.setHeader('Content-Type', document?.mimetype);
        res.setHeader('Content-Disposition', `attachment: filename="${document?.filename}"`);
        file.pipe(res);
    } catch (err) {
        next(err);
    }
};
