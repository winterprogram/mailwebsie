let routes = (err,req, res, next) => {
    if (err) {
        res.status(500).send('Routes doesn\'t exist')
    } else {
        res.send('no error found')
    }
}

module.exports = {
    routes: routes
}