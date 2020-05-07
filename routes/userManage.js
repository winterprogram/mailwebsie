const express = require('express')
const app = express()
const controller = require('../controllers/signupForUser')
const login = require('./../controllers/userlogin')
const merchantData = require('./../controllers/signupForMerchant')
const coupongen = require('./../controllers/coupongen')
const merchantlogin = require('./../controllers/userloginMerchant')
const admin = require('../controllers/admin')
const usercontroller = require('./../controllers/usercontoller')
const merchantImageUpload = require('./../controllers/imageupload')

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
     * @api {get} /formaps api to calculate distance between user and merchant
     * 
     * @apiParam {string} userlatitude Current latitude of the user. (header params)(required)
     * @apiParam {string} userlongitude Current longitude of the user. (header params)(required)
     * @apiParam {string} city City of the merchant. (header params)(required)
     *  
     * @apiSuccess {object}  API Response shows error status, message, http status code and result.
     * 
     * @apiSuccessExample {object} Success-Response:
     * {
    "error": false,
    "message": 200,
    "status": "user fetched",
    "data": [
        {
            "_id": "5ead99102588643510ebba03",
            "merchantid": "rKGFlO",
            "fullname": "orion mall",
            "mobilenumber": "9167162010",
            "password": "$2b$10$z8IhiuCs3p3j87YMpLbcruOCj6lOWZEmPtaa0FwegIlm8E8SdKpGa",
            "email": "chakladar.sandeep@gmail.com",
            "city": "mumbai",
            "zipcode": "410206",
            "latitude": "18.993292",
            "longitude": "73.115773",
            "address": "yudeguye",
            "category": "test",
            "valid": "1",
            "createdon": "2020-05-02T16:00:16.348Z",
            "__v": 0
        }
    ]
}
     * @apiErrorExample Error-Response:
      { 
       "error": true,
       "message": "no merchant found near your location",
       "status": 500,
       "data": null
        }
    */

    // merchant signup and login

    app.post('/merchantSignup', merchantData.merchantData)
    app.post('/merchantlogin', merchantlogin.merchantlogin)
    //image upload 
    app.post('/imageupload', merchantImageUpload.getPresignedUrl)
    //image upload check
    app.put('/imageuploadcheck', merchantlogin.imageuploadcheck)
    /**
     * @apiGroup Merchant images
     * @apiVersion 0.0.1
     * @api {put} /imageuploadcheck api to update boolean that if images is uploaded by merchants
     * 
     * @apiParam {string} mobilenumber Mobile number of the merchants. (header params)(required)
     * @apiParam {boolean} imageuploaded True if the images are successfully uploaded by merchant. (header params)(required)
     * @apiParam {array} imageurl download url of amazon s3. (body params)(required)
     *  
     * @apiSuccess {object}  API Response shows error status, message, http status code and result.
     * 
     * @apiSuccessExample {object} Success-Response:
     * {
    "error": false,
    "message": "resolved ",
    "status": 200,
    "data": {
        "n": 1,
        "nModified": 1,
        "ok": 1
    }
}
     * @apiErrorExample Error-Response:
      { 
       "error": true,
       "message": "error headers params are empty",
       "status": 500,
       "data": null
        }
    */

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