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
const merchantDashboard = require('./../controllers/merchantController')
const useredit = require('./../controllers/test')
let routes = (app) => {
  // merchant signup and login
  app.post('/merchantSignup', merchantData.merchantData)
  app.post('/merchantlogin', merchantlogin.merchantlogin)

  app.get('/merchantEarning', payments.merchantEarning)
  /**
                 * @apiGroup Merchant Dashbaord
                 * @apiVersion 0.0.1
                 * @api {get} /merchantEarning api to fetch merchant payment (Total sum).
                 * 
                 * @apiParam {string} merchantid merchantid of the of the merchant. (header params)(required)
                 * 
                 * @apiSuccess {object}  API Response shows error status, message, http status code and result.
                 * {
                    "error": false,
                    "status": 200,
                    "message": "data fetched for merchant",
                    "data": {
                    "amount": 50000
                   }
                     }
                 * @apiErrorExample Error-Response:
                 *{
                   "error": true,
                   "status": 404,
                   "message": "error blank data while updating payments",
                   "data": {
                   
                  }
                    }
                */
  //image upload (aws key)
  app.post('/imageupload', merchantImageUpload.getPresignedUrl)
  //image upload check
  app.put('/imageuploadcheck', merchantlogin.imageuploadcheck)
  /**
   * @apiGroup Merchant Dashbaord
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


  app.get('/merchantTransaction', merchantDashboard.paymentTransactionOfMerchant)
  /**
       * @apiGroup Merchant Dashbaord
       * @apiVersion 0.0.1
       * @api {get} /merchantTransaction api to fetch merchant wise transaction which is sorted date wise
       * 
       * @apiParam {string} merchantid merchant id  of the merchants. (header params)(required)
       *  
       * @apiSuccess {object}  API Response shows error status, message, http status code and result.
       * 
       * @apiSuccessExample {object} Success-Response:
       * {
          "error": false,
          "status": 200,
          "message": "data fetched for merchant",
          "data": [
          {
          "isPaid": true,
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
         "message": "error headers params are empty",
         "status": 500,
         "data": null
          }
      */
  // get total distibuted coupon count
  app.get('/getCouponCountDist', merchantDashboard.noOfDistributedCoupon)

  /**
   * @apiGroup Merchant Dashbaord
   * @apiVersion 0.0.1
   * @api {get} /getCouponCountDist api to fetch total merchant coupon distibuted.
   * 
   * @apiParam {string} merchantid merchant id  of the merchants. (header params)(required)
   *  
   * @apiSuccess {object}  API Response shows error status, message, http status code and result.
   * 
   * @apiSuccessExample {object} Success-Response:
   * {
      "error": false,
      "status": 200,
      "message": "data fetched for no of coupon",
      "data": 2
      }
   * @apiErrorExample Error-Response:
  {
      "error": true,
      "status": 404,
      "message": "error no coupon found for merchant as no active coupon exist",
      "data": null
  }
  */
  // get coupon count of redeemed coupon
  app.get('/getCouponCountUsed', merchantDashboard.countOfRedeemedCoupon)
  /**
* @apiGroup Merchant Dashbaord
* @apiVersion 0.0.1
* @api {get} /getCouponCountUsed api to fetch total merchant coupon used.
* 
* @apiParam {string} merchantid merchant id  of the merchants. (header params)(required)
*  
* @apiSuccess {object}  API Response shows error status, message, http status code and result.
* 
* @apiSuccessExample {object} Success-Response:
* {
   "error": false,
   "status": 200,
   "message": "data fetched for no of coupon reedmed",
   "data": 2
   }
* @apiErrorExample Error-Response:
{
   "error": true,
   "status": 404,
   "message": "error no coupon found for merchant as no active coupon exist",
   "data": null
}
*/

  app.post('/bankdeatils', merchantDashboard.saveBankDataForMerchant)

  app.put('/merchantShopNameChange', merchantDashboard.merchantEditShopName)

  /**
* @apiGroup Merchant Dashbaord
* @apiVersion 0.0.1
* @api {get} /merchantShopNameChange api change merchant shop name.
* 
* @apiParam {string} merchantid merchant id  of the merchants. (header params)(required)
* @apiParam {string} shopname new shop-name  of the merchants. (body params)(required)
* @apiSuccess {object}  API Response shows error status, message, http status code and result.
* 
* @apiSuccessExample {object} Success-Response:
*{
"error": false,
"status": 200,
"message": "merchant shop name changed",
"data": {
    "n": 1,
    "nModified": 1,
    "ok": 1
}
}
* @apiErrorExample Error-Response:
*{
"error": true,
"status": 500,
"message": "merchantid not found in db",
"data": null
}
*/
  app.put('/merchantEmailChange', merchantDashboard.merchantEditEmail)

  /**
  * @apiGroup Merchant Dashbaord
  * @apiVersion 0.0.1
  * @api {get} /merchantEmailChange api change merchant email.
  * 
  * @apiParam {string} merchantid merchant id  of the merchants. (header params)(required)
  * @apiParam {string} email new email of the merchants. (body params)(required)
  * @apiSuccess {object}  API Response shows error status, message, http status code and result.
  * 
  * @apiSuccessExample {object} Success-Response:
  *{
  "error": false,
  "status": 200,
  "message": "merchant email changed",
  "data": {
    "n": 1,
    "nModified": 1,
    "ok": 1
  }
  }
  * @apiErrorExample Error-Response:
  *{
  "error": true,
  "status": 500,
  "message": "merchantid not found in db",
  "data": null
  }
  */

  app.put('/merchantAddressChange', merchantDashboard.merchantEditAddress)

  /**
  * @apiGroup Merchant Dashbaord
  * @apiVersion 0.0.1
  * @api {get} /merchantAddressChange api change merchant address.
  * 
  * @apiParam {string} merchantid merchant id  of the merchants. (header params)(required)
  * @apiParam {string} address new address of the merchants. (body params)(required)
  * @apiSuccess {object}  API Response shows error status, message, http status code and result.
  * 
  * @apiSuccessExample {object} Success-Response:
  *{
  "error": false,
  "status": 200,
  "message": "merchant address changed",
  "data": {
    "n": 1,
    "nModified": 1,
    "ok": 1
  }
  }
  * @apiErrorExample Error-Response:
  *{
  "error": true,
  "status": 500,
  "message": "merchantid not found in db",
  "data": null
  }
  */

  app.put('/merchantZipcodeChange', merchantDashboard.merchantEditZipCode)

  /**
  * @apiGroup Merchant Dashbaord
  * @apiVersion 0.0.1
  * @api {get} /merchantZipcodeChange api change merchant zipcode.
  * 
  * @apiParam {string} merchantid merchant id  of the merchants. (header params)(required)
  * @apiParam {string} zipcode new zipcode of the merchants. (body params)(required)
  * @apiSuccess {object}  API Response shows error status, message, http status code and result.
  * 
  * @apiSuccessExample {object} Success-Response:
  *{
  "error": false,
  "status": 200,
  "message": "merchant zipcode changed",
  "data": {
    "n": 1,
    "nModified": 1,
    "ok": 1
  }
  }
  * @apiErrorExample Error-Response:
  *{
  "error": true,
  "status": 500,
  "message": "merchantid not found in db",
  "data": null
  }
  */

  app.put('/merchantCityChange', merchantDashboard.merchantEditCity)

  /**
  * @apiGroup Merchant Dashbaord
  * @apiVersion 0.0.1
  * @api {get} /merchantCityChange api change merchant city.
  * 
  * @apiParam {string} merchantid merchant id  of the merchants. (header params)(required)
  * @apiParam {string} city new city of the merchants. (body params)(required)
  * @apiSuccess {object}  API Response shows error status, message, http status code and result.
  * 
  * @apiSuccessExample {object} Success-Response:
  *{
  "error": false,
  "status": 200,
  "message": "merchant city changed",
  "data": {
    "n": 1,
    "nModified": 1,
    "ok": 1
  }
  }
  * @apiErrorExample Error-Response:
  *{
  "error": true,
  "status": 500,
  "message": "merchantid not found in db",
  "data": null
  }
  */

  app.put('/merchantGeoChange', merchantDashboard.merchantEditGeoLocation)

  /**
  * @apiGroup Merchant Dashbaord
  * @apiVersion 0.0.1
  * @api {get} /merchantGeoChange api change merchant geocode.
  * 
  * @apiParam {string} merchantid merchant id  of the merchants. (header params)(required)
  * @apiParam {string} latitude new latitude of the merchants shop. (body params)(required)
  * @apiParam {string} longitude new longitude of the merchants shop. (body params)(required)
  * @apiSuccess {object}  API Response shows error status, message, http status code and result.
  * 
  * @apiSuccessExample {object} Success-Response:
  *{
  "error": false,
  "status": 200,
  "message": "merchant geo changed",
  "data": {
    "n": 1,
    "nModified": 1,
    "ok": 1
  }
  }
  * @apiErrorExample Error-Response:
  *{
  "error": true,
  "status": 500,
  "message": "merchantid not found in db",
  "data": null
  }
  */
  app.put('/merchantBankChange', merchantDashboard.updateBankDetails)

  /**
  * @apiGroup Merchant Dashbaord
  * @apiVersion 0.0.1
  * @api {get} /merchantBankChange api change merchant bank.
  * 
  * @apiParam {string} merchantid merchant id  of the merchants. (header params)(required)
  * 
  * 
  * @apiSuccessExample {object} Success-Response:
  *{
  "error": false,
  "status": 200,
  "message": "bank data updated",
  "data": {
    "n": 1,
    "nModified": 1,
    "ok": 1
  }
  }
  * @apiErrorExample Error-Response:
  *{
  "error": true,
  "status": 500,
  "message": "merchantid not found in db",
  "data": null
  }
  */
  app.get('/merchantBankDeatils', merchantDashboard.merchantBankDeatils)

  app.put('/editUserDetails', useredit.user)
}


module.exports = {
  routes: routes
}