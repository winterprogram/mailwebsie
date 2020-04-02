let appOnstart = (err, req, res, next) => {
    if (err) {
        res.send(`Error while intaializing the app ${err}`)
    } else {
        res.send(`No error found`)
    }
    next()
}


module.exports = {
    appOnstart: appOnstart
}