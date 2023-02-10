class ErrorException extends Error {
    constructor(code, message, errors) {
        super();
        this.code = code || 500;
        this.message = message || 'Unknown Error';
        this.errors = errors;
    }
}

module.exports = ErrorException;
