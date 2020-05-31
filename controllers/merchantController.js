const express = require('express')
const app = express()
// to genearte userId
const randomize = require('randomatic')
// adding schema
const model = require('./../models/Signup')
const mongoose = require('mongoose')
const signup = mongoose.model('signupforuser')
const merchant = mongoose.model('signupforusermerchant')
const token = require('./../models/Merchantauthtoken')
const mertoken = mongoose.model('merchantinfo')
const c = require('./../models/Coupongen')
const coupon = mongoose.model('coupons')
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
const logger = require('./../libs/logger')
const a = require('./../models/Payment')
const payments = mongoose.model('razorpayments')


let paymentTransactionOfMerchant = (req, res) => {
    let paymentsTrans = () => {
        return new Promise((resolve, reject) => {
            payments.aggregate([
                {
                    $match:
                    {
                        "merchantid": req.headers.merchantid,
                        "amount_paid": { $gt: 0 }
                    }
                },
                {
                    $lookup:
                    {
                        from: 'signupforusermerchants',
                        localField: 'merchantid',
                        foreignField: 'merchantid',
                        as: 'merchantname'
                    }
                },
                {
                    $unwind: '$merchantname'

                },
                {
                    $project: {
                        "_id": 0,
                        "isPaid": 1,
                        "entity": 1,
                        "amount_paid": 1,
                        "receipt": 1,
                        "createdon": 1,
                        "merchantname": "$merchantname.shopname"

                    }
                },
                {
                    $sort: {
                        "createdon": -1
                    }
                }
            ]).exec((err, data) => {
                if (err) {
                    logger.error('error while fetching merchant payment', 'paymentsTrans:paymentTransactionOfMerchant()', 5)
                    let response = api.apiresponse(true, 500, 'error while fetching merchant payment', 'paymentsTrans:paymentTransactionOfMerchant()', null)
                    reject(response)
                } else if (emptyCheck.emptyCheck(data)) {
                    logger.error('error no payments found for merchant', 'paymentsTrans:paymentTransactionOfMerchant()', 10)
                    let response = api.apiresponse(true, 404, 'error no payments found for merchant', null)
                    reject(response)
                } else {
                    logger.info('data fetched for merchant', 'paymentsTrans:paymentTransactionOfMerchant()')
                    resolve(data)
                }
            })
        })
    }

    paymentsTrans(req, res).then((resolve) => {
        logger.info('data fetched for merchant', 'paymentTransactionOfMerchant()')
        let response = api.apiresponse(false, 200, 'data fetched for merchant', resolve)
        res.send(response)
    }).catch((err) => {
        logger.error('some error occured', 'paymentTransactionOfMerchant()', 5)
        // console.log(err)
        res.send(err)
    })
}



module.exports = {
    paymentTransactionOfMerchant: paymentTransactionOfMerchant
}