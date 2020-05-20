const express = require('express')
const app = express()
// to genearte userId
const randomize = require('randomatic')
// adding schema
const model = require('./../models/Signup')
const mongoose = require('mongoose')
const merchant = mongoose.model('signupforusermerchant')
const token = require('./../models/Merchantauthtoken')
const mertoken = mongoose.model('merchantinfo')
const logger = require('../libs/logger')
// adding empty check 
const emptyCheck = require('./../libs/emptyCheck')
//adding api response structure 
const api = require('./../libs/apiresponse')
// adding password encry lib
const passencry = require('./../libs/passEncry')
// events
const event = require('events')
const eventemiter = new event.EventEmitter();
// importing jwt token lib
const jwt = require('./../libs/jswt')
const distance = require('google-distance-matrix');
const geolib = require('geolib');
const c = require('./../models/Coupongen')
const coupon = mongoose.model('coupons')
const a = require('./../models/Payment')
const payments = mongoose.model('razorpayments')
const signup = mongoose.model('signupforuser')
const moment = require('moment')


let storePayments = (req, res) => {
    let datetoday = moment().format('DD-MM-YYYY')
    let saveData = new payments({
        merchantid: req.body.merchantid,
        userid: req.body.userid,
        paymentid: req.body.paymentid,
        orderid: req.body.orderid,
        signature: req.body.signature,
        errorcode: req.body.errorcode,
        orderamount:req.body.orderamount,
        message: req.body.message,
        createdon: datetoday
    })
    saveData.save((err, data) => {
        if (err) {
            logger.error('error while saving payments', 'storePayments()', 1)
            let response = api.apiresponse(true, 403, 'error while saving payments', null)
            res.send(response)
        } else if (emptyCheck.emptyCheck(data)) {
            logger.error('error blank data while saving payments', 'storePayments()', 1)
            let response = api.apiresponse(true, 404, 'error blank data while saving payments', null)
            res.send(response)
        } else {
            logger.info('data saved for payments', 'storePayments()')
            let response = api.apiresponse(false, 200, 'data saved for payments', data)
            res.send(response)
        }
    })
}

module.exports = {
    storePayments: storePayments
}