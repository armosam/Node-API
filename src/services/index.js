const attach = require('../middleware/service');

const AuthService = require('./authService');
const ProfileService = require('./profileService');
const UserService = require('./userService');
const FeedService = require('./feedService');
const DocumentService = require('./documentService');
const NotificationService = require('./notificationService');

module.exports = {
    attach,
    AuthService: new AuthService(),
    ProfileService: new ProfileService(),
    UserService: new UserService(),
    FeedService: new FeedService(),
    DocumentService: new DocumentService(),
    NotificationService: new NotificationService(),
};
