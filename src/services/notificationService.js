const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { ENV_PROD } = require('../config');
const ErrorException = require('../helpers/ErrorException');

class NotificationService {
    SENDGRID_PROVIDER = 'sendgrid';

    STANDARD_PROVIDER = 'standard';

    CONSOLE_OUTPUT_PROVIDER = 'output';

    constructor(transport) {
        if (!transport) {
            transport = this.getTransport(this.SENDGRID_PROVIDER);
        }
        if (!ENV_PROD) {
            transport = this.getTransport(this.CONSOLE_OUTPUT_PROVIDER);
        }
        this.transport = transport;
    }

    getTransport(serviceProvider) {
        let mailTransport = '';

        switch (serviceProvider) {
        case this.STANDARD_PROVIDER:
            mailTransport = nodemailer.createTransport({
                host: process.env.MAIL_HOST,
                port: process.env.MAIL_PORT,
                secure: process.env.MAIL_SECURITY, // use SSL
                auth: {
                    user: process.env.MAIL_USER_NAME,
                    pass: process.env.MAIL_PASSWORD,
                },
            });
            break;
        case this.CONSOLE_OUTPUT_PROVIDER:
            mailTransport = {
                sendMail: (payload) => {
                    console.debug('Development environment does not send real email message:', payload);
                    return Promise.resolve({ message: 'success' });
                },
            };
            break;
        case this.SENDGRID_PROVIDER:
            mailTransport = nodemailer.createTransport(sendgridTransport({
                auth: {
                    api_key: process.env.SEND_GRID_API_KEY,
                },
            }));
            break;
        default:
            throw new Error('Unknown email service provider');
        }
        return mailTransport;
    }

    sendEmailNotification(to, subject, html) {
        try {
            const from = process.env.FROM_EMAIL_ADDRESS;
            const payload = {
                from,
                to,
                subject,
                html,
            };
            return this.transport.sendMail(payload);
        } catch (err) {
            throw new ErrorException(503, err.message);
        }
    }

    // ************************** Account Notifications *******************************
    sendAccountCreatedByAdminEmailNotification(user) {
        const subject = 'Welcome To Our Application';
        const message = `Dear ${user.name}, <br><br>Your account has been created by administration. <br><br>Welcome to our project.`;
        return this.sendEmailNotification(user.email, subject, message);
    }

    sendAccountUpdatedByAdminEmailNotification(user) {
        const subject = 'Your Account Has Been Updated By Administration';
        const message = `Dear ${user.name}, <br><br>Your account has been updated by administration. <br><br>Please ignore this email if you know about it, otherwise please login and check your account.`;
        return this.sendEmailNotification(user.email, subject, message);
    }

    sendAccountRemovedByAdminEmailNotification(user) {
        const subject = 'Your Account Has been Removed By Administration';
        const message = `Dear ${user.name}, <br><br>We Are so sorry to hear about that. <br><br>Your account has been remove by administration. <br><br>Please let us know if you are interested to stay with us.`;
        return this.sendEmailNotification(user.email, subject, message);
    }

    sendAccountCreatedEmailNotification(user, baseUrl) {
        const tokenUrl = `${baseUrl}/auth/activate/${user.resetToken}`;
        const subject = 'Welcome To Our Application';
        const message = `Dear ${user.name}, <br><br>Your account has been created successfully. <br><br>To confirm and complete the activation of you accout <a href="${tokenUrl}">please click this link</a>.`;
        return this.sendEmailNotification(user.email, subject, message);
    }

    sendAccountActivatedEmailNotification(user) {
        const subject = 'Your Account Has Been Activated';
        const message = `Dear ${user.name}, <br><br>Your account has been activated successfully. <br><br>Please login your account and complete setup of your profile.`;
        return this.sendEmailNotification(user.email, subject, message);
    }

    sendAccountResetPasswordEmailNotification(user, baseUrl) {
        const tokenUrl = `${baseUrl}/auth/reset-token/${user.resetToken}`;
        const subject = 'Password Reset Instruction';
        const message = `<h1>Password Reset Instruction</h1>
            <p><div><h3>Dear ${user.name},</h3>
            <div>You have requested to reset the password for your account. <br><br> <a href="${tokenUrl}">Please click to the link to start password reset.</a></div>
            <br><br>
            <hr><div>@copy; 2023</div></div></p>`;
        return this.sendEmailNotification(user.email, subject, message);
    }

    sendAccountUpdatedEmailNotification(user) {
        const subject = 'Your Account Has Been Updated';
        const message = `Dear ${user.name}, <br><br>Your account has been updated recently. <br><br>Please ignore this email if you did changes in your account, otherwise please login and check your account.`;
        return this.sendEmailNotification(user.email, subject, message);
    }
}

module.exports = NotificationService;
