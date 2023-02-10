exports.index = (req, res) => {
    res.status(200).send('Home Page');
};

exports.about = (req, res) => {
    res.status(200).send('About us');
};

exports.contact = (req, res) => {
    res.status(200).send('Contact us');
};
