const EventEmitter = require('events');
const NotificationService = require('./notificationService');

// Base Service
class BaseService extends EventEmitter {
    constructor() {
        super();

        const notification = new NotificationService();

        // Profile Events
        this.addListener('signup_account', (data, url) => {
            console.log('Signup Account event triggered', data, url);
            notification.sendAccountCreatedEmailNotification(data, url);
        });
        this.addListener('activate_account', (data) => {
            console.log('Activate Account event triggered', data);
            notification.sendAccountActivatedEmailNotification(data);
        });
        this.addListener('password_reset_request_for_account', (data, url) => {
            console.log('Password Reset Request event triggered', data, url);
            notification.sendAccountResetPasswordEmailNotification(data, url);
        });

        this.addListener('update_profile', (data) => {
            console.log('Update Profile event triggered', data);
            notification.sendAccountUpdatedEmailNotification(data);
        });
        this.addListener('upload_profile_avatar', (data) => {
            console.log('Upload Profile Avatar event triggered', data);
            notification.sendAccountUpdatedEmailNotification(data);
        });
        this.addListener('delete_profile_avatar', (data) => {
            console.log('Create Account event triggered', data);
            notification.sendAccountUpdatedEmailNotification(data);
        });

        // User Events
        this.addListener('list_accounts', (data) => {
            console.log('List Account event triggered', data);
        });
        this.addListener('get_account', (data) => {
            data.populate(['avatar']).then((user) => console.log('Get Account event triggered', user));
        });
        this.addListener('create_account', (data) => {
            console.log('Create Account event triggered', data);
            notification.sendAccountCreatedByAdminEmailNotification(data);
        });
        this.addListener('update_account', (data) => {
            console.log('Update Account event triggered', data);
            notification.sendAccountUpdatedByAdminEmailNotification(data);
        });
        this.addListener('delete_account', (data) => {
            console.log('Delete Account event triggered', data);
            notification.sendAccountRemovedByAdminEmailNotification(data);
        });
        this.addListener('get_account_avatar', (data, file) => {
            console.log('Get Account Avatar event triggered', data, file);
        });
        this.addListener('upload_account_avatar', (data) => {
            console.log('Upload Account Avatar event triggered', data);
            notification.sendAccountUpdatedEmailNotification(data);
        });
        this.addListener('delete_account_avatar', (data) => {
            console.log('Delete Account Avatar event triggered', data);
            notification.sendAccountUpdatedEmailNotification(data);
        });

        // Posts Events
        this.addListener('list_posts', (data) => {
            console.log('List Posts event triggered', data);
        });
        this.addListener('create_post', (data) => {
            console.log('Create Post event triggered', data);
        });
        this.addListener('update_post', (data) => {
            console.log('Update Post event triggered', data);
        });
    }
}

module.exports = BaseService;
