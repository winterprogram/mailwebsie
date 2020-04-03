const express = require('express')
const app = express()
const controller = require('../controllers/signupForUser')
const login = require('./../controllers/userlogin')

let routes = (app) => {
    app.post('/userSignup', controller.userData)
    app.post('/loginforUser',login.userlogin)
    
}


module.exports = {
    routes: routes
}