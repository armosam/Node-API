const { Document } = require('../models/index');
const { ITEMS_PER_PAGE } = require('../config');
const ErrorException = require('../helpers/ErrorException');
const BaseService = require('./base');

/** Document Service class */
class DocumentService extends BaseService {
    constructor(document = null) {
        super();
        this.Document = document || Document;
        this.allowedFields = ['title', 'description', 'type'];
    }

    async listDocuments({ user, page = 1, fullList = false }) {
        const perPage = ITEMS_PER_PAGE;
        const totalCount = await this.Document.find(user.isAdmin === false ? { owner: user._id } : null).countDocuments();
        let documents = [];
        if (totalCount > 0) {
            if (fullList) {
                documents = await this.Document
                    .find(user.isAdmin === false ? { owner: user._id } : null)
                    .populate(['owner'])
                    .skip((page - 1) * perPage)
                    .limit(perPage);
            } else {
                documents = await this.Document
                    .find(user.isAdmin === false ? { owner: user._id } : null)
                    .skip((page - 1) * perPage)
                    .limit(perPage);
            }
        }

        this.emit('list_documents', documents);

        return { documents, totalCount };
    }

    async getDocument(user, id) {
        if (!id) {
            throw new ErrorException(400, 'Missing Document ID.');
        }

        const document = await this.Document.findOne({ _id: id, owner: user._id });
        if (!document) {
            throw new ErrorException(404, 'Document not found.');
        }

        this.emit('get_document', document);

        return document;
    }

    async createDocument({ user, body, file }) {
        if (!user) {
            throw new ErrorException(404, 'User not found.');
        }
        if (!body) {
            throw new ErrorException(404, 'No data provided to create a document.');
        }
        if (!file) {
            throw new ErrorException(404, 'Document file not uploaded.');
        }

        const { title, description, type } = body || {};

        const document = new this.Document({
            title, description, type, ...file, owner: user._id,
        });

        await document.save();

        this.emit('create_document', document);

        return document;
    }

    async updateDocument({ user, id, body, file }) {
        if (!user) {
            throw new ErrorException(404, 'User not found.');
        }
        if (!id) {
            throw new ErrorException(400, 'Missing Document ID.');
        }
        if (!body) {
            throw new ErrorException(404, 'No data provided to update document.');
        }
        if (!file) {
            throw new ErrorException(404, 'Document file not uploaded.');
        }

        const document = await this.Document.findOne({ _id: id, owner: user._id });
        if (!document) {
            throw new ErrorException(404, 'Document not found.');
        }

        const allowedFields = [...this.allowedFields];
        console.log(user.isAdmin);
        if (user.isAdmin === true) {
            const length = allowedFields.push('approved', 'expiresAt');
            console.log(length);
        }

        const update = Object.fromEntries(Object.entries({ ...body }).filter(([key]) => allowedFields.includes(key)));
        const documentUpdate = Object.assign(document, { ...update, ...file, owner: user._id });

        await documentUpdate.save();

        this.emit('update_document', documentUpdate);

        return documentUpdate;
    }

    async deleteDocument({ user, id }) {
        if (!user) {
            throw new ErrorException(404, 'User not found.');
        }

        if (!id) {
            throw new ErrorException(400, 'Missing Document ID.');
        }

        const document = await this.Document.findOne({ _id: id, owner: user._id });
        if (!document) {
            throw new ErrorException(404, 'Document not found.');
        }

        await this.Document.findByIdAndDelete(id);

        this.emit('delete_document', document);

        return document;
    }

    async getDocumentFile(user, id) {
        if (!id) {
            throw new ErrorException(404, 'Missing Document ID.');
        }

        const document = await this.Document.findOne({ _id: id, owner: user._id });
        if (!document) {
            throw new ErrorException(404, 'Document not found');
        }

        const file = await document.getContent();

        this.emit('get_document_file', document, file);

        return { document, file };
    }
}

module.exports = DocumentService;
