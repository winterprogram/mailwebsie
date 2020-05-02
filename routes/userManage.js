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
    // params: Origin for user, destination for merchants
    app.get('/formaps', usercontroller.userMerchantDisplay)
    /**
     * @apiGroup user dashboard
     * @apiVersion 0.0.1
     * @api {post} /formaps api to calculate distance  formaps
     * 
     * @apiParam {string} firstName First Name of user. (body params)(required)
     * @apiParam {string} lastName Last Name of user. (body params)(required)
     * @apiParam {string} email Email of user. (body params)(required)
     * @apiParam {number} mobileNumber Mobile Number of user. (body params)(required)
     * @apiParam {string} countryName Country Name of user. (body params)(required)
     * @apiParam {boolean} isAdmin boolean value either true/false. (body params)(required)
     * @apiParam {string} password Password of user. (body params)(required)
     * 
     * @apiSuccess {object}  API Response shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
     * {
      "error": false,
      "message": "User created",
      "status": 200,
      "data": {
          "countryCode": 91
          "countryName": "IN"
          "createdOn": "2020-04-22T20:55:36.000Z"
          "email": "chakladar.sandeep@gmail.com"
          "firstName": "Sandy"
          "isAdmin": false
          "lastName": "c"
          "mobileNumber": 9922559922    
          "userId": "Xk1Ll0"
          "__v": 0
          "_id": "5ea0af48a3754b0770171c78"
      }
  }
     * @apiErrorExample Error-Response:
      { 
       "error": true,
       "message": "error while saving data",
       "status": 500,
       "data": null
        }
    */

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