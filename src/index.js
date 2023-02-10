const express = require('express');
const loaders = require('./loaders');

async function startServer() {
    try {
        const app = express();
        await loaders.init(app);
    } catch (err) {
        console.error(err);
    }
}

startServer();
