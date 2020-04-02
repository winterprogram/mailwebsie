const express = require('express')
const controller = require('./../controllers/signupForUser')

let routes = (app) => {
    app.post('/userSignup', controller.userData)
}


module.exports = {
    routes: routes
}