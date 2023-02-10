const morgan = require('morgan'); // Logging manager
const path = require('path'); // path module
const rfs = require('rotating-file-stream');

morgan.token('id', (req) => req.id);

// create a rotating write stream
const accessLogStream = rfs.createStream('access.log', {
    interval: '1d', // rotate daily
    path: path.join(__dirname, '..', 'config', 'logs'),
});

module.exports = morgan(':remote-addr - :remote-user [:date[iso]] ":method :url HTTP/:http-version" :status :res[content-length] bytes :response-time[digits]/:total-time[digits] ms ":referrer" ":user-agent"', { stream: accessLogStream });
