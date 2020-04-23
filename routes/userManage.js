const express = require('express')
const app = express()
const controller = require('../controllers/signupForUser')
const login = require('./../controllers/userlogin')
const merchantData = require('./../controllers/signupForMerchant')
const coupongen = require('./../controllers/coupongen')
const merchantlogin = require('./../controllers/userloginMerchant')

let routes = (app) => {
    // user signup and login
    app.post('/userSignup', controller.userData)
    app.post('/loginforUser', login.userlogin)

    // merchant signup and login

    app.post('/merchantSignup', merchantData.merchantData)
    app.post('/merchantlogin', merchantlogin.merchantlogin)

    // merchant coupon code gen
    app.post('/code', coupongen.coupongen)
    // merchnat coupon edit
    app.put('/couponedit', coupongen.editcoupon)
    // get coupon details for transaction
    app.get('/getcouponformerchant', coupongen.getcoupon)
}


module.exports = {
    routes: routes
}