const path = require('path');

exports.pathJoin = (...parts) => {
    const mainPath = path.dirname(require.main.filename);
    return path.join(mainPath, ...parts);
};

exports.main_path = path.dirname(require.main.filename);

exports.path = path;
