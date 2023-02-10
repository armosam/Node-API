const siteRouter = require('./siteRouter');
const authRouter = require('./authRouter');
const profileRouter = require('./profileRouter');
const userRouter = require('./userRouter');
const feedRouter = require('./feedRouter');
const documentRouter = require('./documentRouter');

const routes = (app) => {
    app.use(siteRouter);
    app.use('/auth', authRouter);
    app.use('/profile', profileRouter);
    app.use('/user', userRouter);
    app.use('/post', feedRouter);
    app.use('/document', documentRouter);
};

module.exports = routes;
