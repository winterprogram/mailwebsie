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
const payments = require('./../controllers/payments')

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

    // user coupon distribution
    app.post('/coupontouser', usercontroller.userCouponDisribution)
    /**
         * @apiGroup user dashboard
         * @apiVersion 0.0.1
         * @api {post} /coupontouser api distribute merchant coupon to user after successfull transaction. Number of coupon is decided on amount transaction by user
         * 
         * @apiParam {string} userlatitude Current latitude of the user. (header params)(required)
         * @apiParam {string} userlongitude Current longitude of the user. (header params)(required)
         * @apiParam {string} userid userid of the user. (header params)(required)
         *  
         * @apiSuccess {object}  API Response shows error status, message, http status code and result.
         * 
         * @apiSuccessExample {object} Success-Response:
 * {
        "error": false,
        "status": 200,
        "message": "coupon distributed to user successfully",
        "data": [
            {
                
               "_id" : ObjectId("5ebc5d336da6bd244055c5f2"),
	           "userid" : "FmTD3G",
	           "couponcode" : "9PA1FS",
	           "category" : "Cafe/Fast Food",
	           "enddate" : "21-05-2020",
	           "valid" : "1",
	           "__v" : 0
            }
        ]
    }
         * @apiErrorExample Error-Response:
          { 
           "error": true,
           "message": "no merchant available with valid coupon",
           "status": 500,
           "data": null
            }
        */

    // fetch coupon user wise
    app.get('/fetchCouponUser', usercontroller.getAllCouponForUser)

    /**
             * @apiGroup user dashboard
             * @apiVersion 0.0.1
             * @api {get} /fetchCouponUser api to fetch coupon for user
             * 
             * @apiParam {string} userid userid of the user. (header params)(required)
             *  
             * @apiSuccess {object}  API Response shows error status, message, http status code and result.
             * 
             * @apiSuccessExample {object} Success-Response:
     * {
            "error": false,
            "message": 200,
            "status": "coupon for user fetched",
            "data": [
        {
            "_id": "5ebc5b09fb22412e143b3f46",
            "userid": "FmTD3G",
            "couponcode": "WGgFqK",
            "category": "Ice-Cream Parlour",
            "enddate": "21-05-2020",
            "valid": "1",
            "__v": 0
        },
        {
            "_id": "5ebc5b09fb22412e143b3f47",
            "userid": "FmTD3G",
            "couponcode": "NvEW3Z",
            "category": "Cafe/Fast Food",
            "enddate": "21-05-2020",
            "valid": "1",
            "__v": 0
        }
            ]
        }
             * @apiErrorExample Error-Response:
              { 
               "error": true,
               "message": "error blank data while fetching coupon for user",
               "status": 404,
               "data": null
                }
            */
    app.get('/couponforCheckOut', usercontroller.couponSectionDuringCheckout)
    /**
                 * @apiGroup user dashboard
                 * @apiVersion 0.0.1
                 * @api {get} /couponforCheckOut api to fetch coupon as per user and merchant matching key
                 * 
                 * @apiParam {string} userid userid of the user. (header params)(required)
                 * @apiParam {string} merchantid merchantid of the merchant. (header params)(required)
                 *  
                 * @apiSuccess {object}  API Response shows error status, message, http status code and result.
                 * 
                 * @apiSuccessExample {object} Success-Response:
                 * {
                "error": false,
                "message": 200,
                "status": "coupon for user fetched",
                "data": [
               {
                "_id": "5ebd91c798fb0b295805a2b0",
                "status": "Active",
                "userid": "FmTD3G",
                "couponcode": "NvEW3Z",
                "category": "Cafe/Fast Food",
                "merchantid": "h8SghQ",
                "enddate": "22-05-2020",
                "valid": "1",
                "__v": 0
              },
             {
               "_id": "5ebd91d998fb0b295805a2b2",
               "status": "Active",
               "userid": "FmTD3G",
               "couponcode": "NvEW3Z",
               "category": "Cafe/Fast Food",
               "merchantid": "h8SghQ",
               "enddate": "22-05-2020",
               "valid": "1",
               "__v": 0
              }
                ]
            }
                 * @apiErrorExample Error-Response:
                  { 
                   "error": true,
                   "message": "error blank data while fetching coupon for user",
                   "status": 404,
                   "data": null
                    }
                */
    app.post('/payments', payments.storePayments)
    /**
                 * @apiGroup user dashboard
                 * @apiVersion 0.0.1
                 * @api {post} /payments api to store order of the user generated from razorpay
                 * 
                 * @apiParam {number} amount amount entered byuser. (body params)(required)
                 * @apiParam {string} userid userid of the user. (body params)(required)
                 * @apiParam {string} merchantid merchantid of the merchant. (body params)(required)
                 * 
                 * @apiSuccess {object}  API Response shows error status, message, http status code and result.
                 * 
                 * @apiSuccessExample {object} Success-Response:
                 *{
                   "error": false,
                   "status": 200,
                   "message": "data saved for payments",
                   "data": {
                   "notes": [],
                   "_id": "5ec58b1741eea03c2cc06ba5",
                   "id": "order_Esja9JRvG0EymB",
                   "entity": "order",
                   "amount": 50000,
                   "amount_paid": 0,
                   "amount_due": 50000,
                   "currency": "INR",
                   "receipt": "order_HIxzP4G_s40O",
                   "offer_id": null,
                   "status": "created",
                   "attempts": 0,
                   "created_at": 1590004503,
                   "createdon": "21-05-2020",
                   "__v": 0
                  }
                    }
            
            
                    */

    app.get('/transactionHistoryOfUser', usercontroller.getListOfPaymentsDoneByUser)
    /**
                    * @apiGroup user dashboard
                    * @apiVersion 0.0.1
                    * @api {get} /transactionHistoryOfUser api to get list of transactions done by user and output is sorted date wise i.e. latest transaction comes first.
                    * 
                    * @apiParam {string} userid userid of the user. (header params)(required)
                    * 
                    * @apiSuccess {object}  API Response shows error status, message, http status code and result.
                    * 
                    * @apiSuccessExample {object} Success-Response:
                    *{
                      "error": false,
                      "status": 200,
                      "message": "data fetched for user",
                      "data": [
                      {
                       "isPaid": false,
                        "userid": "azMY4k",
                       "entity": "order",
                       "amount_paid": 0,
                       "receipt": "order_66Uaf48_A1jw",
                       "createdon": "27-05-2020",
                       "merchantname": "yfx"
                      },
                     {
                       "isPaid": true,
                       "userid": "azMY4k",
                       "entity": "order",
                       "amount_paid": 0,
                       "receipt": "order_3aZvWpM_ODPt",
                       "createdon": "24-05-2020",
                       "merchantname": "yfx"
                     },
                     {
                      "isPaid": true,
                      "userid": "azMY4k",
                      "entity": "order",
                      "amount_paid": 102,
                      "receipt": "order_FYe8cZu_MxQm",
                      "createdon": "23-05-2020",
                      "merchantname": "yfx"
                    }
          
                     ]
                   }
               
                * @apiErrorExample Error-Response:
                     {
                      "error": true,
                      "status": 404,
                      "message": "error no payments found for user",
                      "data": null
                      }
                       */

    app.put('/getPaymentByOrder', payments.getPaymentByOrder)

    // update coupon code for user after successful payment
    app.put('/redeemCouponforUser', usercontroller.redeemedCouponByUser)
    /**
                * @apiGroup user dashboard
                * @apiVersion 0.0.1
                * @api {put} /redeemCouponforUser api to redeem coupon for user after successful payment
                * 
                * @apiParam {string} couponcode coupon code applied by user during transaction. (header params)(required)
                * @apiParam {string} userid userid of the user. (header params)(required)
                * @apiParam {string} merchantid merchantid of the merchant. (header params)(required)
                * 
                * @apiSuccess {object}  API Response shows error status, message, http status code and result.
                * 
                * @apiSuccessExample {object} Success-Response:
                *{
                  "error": false,
                  "status": 200,
                  "message": "coupon reedemed for user successfully",
                  "data": {
                  
                 }
                   }
               */
    app.put('/updatePassword', usercontroller.updateUserPass)
    /**
                   * @apiGroup user dashboard
                   * @apiVersion 0.0.1
                   * @api {put} /updatePassword api to update the user password.
                   * 
                   * @apiParam {string} userid userid of the user. (header params)(required)
                   * @apiParam {string} password current password of the user. (body params)(required)
                   * @apiParam {string} newpass new password of the user. (body params)(required)
                   * 
                   * @apiSuccess {object}  API Response shows error status, message, http status code and result.
                   * 
                   * @apiSuccessExample {object} Success-Response:
                   *{
                      "error": true,
                      "status": 503,
                      "message": "password didn't match",
                      "data": null
                    }

                       * @apiErrorExample Error-Response:
                     {
                      "error": true,
                      "status": 503,
                      "message": "password didn't match",
                      "data": null
                    }   
                  */

    app.put('/userCategoryUpdate', usercontroller.updateUserCategory)
    /**
                  * @apiGroup user dashboard
                  * @apiVersion 0.0.1
                  * @api {put} /updatePassword api to update the user password.
                  * 
                  * @apiParam {string} userid userid of the user. (header params)(required)
                  * @apiParam {string} categoryselected category selected by the user. (body params)(required)
                  * 
                  * @apiSuccess {object}  API Response shows error status, message, http status code and result.
                  * 
                  * @apiSuccessExample {object} Success-Response:
                  *{
                    "error": false,
                    "status": 200,
                    "message": "password updated for user",
                    "data": {
                    
                   }
                     }
                 */

    // admin
    app.get('/getmerchantinfo', admin.merchantregisterData)

    app.get('/getuserData', admin.userauthdeatils)
}


module.exports = {
    routes: routes
}