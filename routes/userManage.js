const express = require('express')
const app = express()
const controller = require('../controllers/signupForUser')
const login = require('./../controllers/userlogin')
const merchantData = require('./../controllers/signupForMerchant')
const coupongen = require('./../controllers/coupongen')
const merchantlogin = require('./../controllers/userloginMerchant')
const admin = require('../controllers/admin')
const usercontroller = require('./../controllers/usercontoller')

let routes = (app) => {
    // user signup and login
    app.post('/userSignup', controller.userData)
    app.post('/loginforUser', login.userlogin)
    // user dashboard
    app.get('/formaps', usercontroller.userMerchantDisplay)
    // merchant signup and login

    app.post('/merchantSignup', merchantData.merchantData)
    app.post('/merchantlogin', merchantlogin.merchantlogin)
    // reset password
    app.put('/resetpassmerchant', merchantlogin.merchantresetpass)

    // merchant coupon code gen
    app.post('/code', coupongen.coupongen)
    // merchant coupon edit
    app.put('/couponedit', coupongen.editcoupon)
    //merchant delete coupon
    app.put('/deletecoupon', coupongen.deletecoupon)
    // get coupon details for transaction section
    app.get('/couponsformanage', coupongen.getcoupon)
    //get all coupon details for manage coupon section
    app.get('/couponsfortrans', coupongen.getcouponfortrans)

    // admin
    app.get('/getmerchantinfo', admin.userregisterData)
}


module.exports = {
    routes: routes
}