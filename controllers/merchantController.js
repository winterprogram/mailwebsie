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
const bankData = require('./../models/BankDetail')

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
                        from: 'signupforusers',
                        localField: 'userid',
                        foreignField: 'userid',
                        as: 'username'
                    }
                },
                {
                    $unwind: '$username'

                },
                {
                    $project: {
                        "_id": 0,
                        "isPaid": 1,
                        "entity": 1,
                        "amount_paid": 1,
                        "receipt": 1,
                        "createdon": 1,
                        "username": "$username.fullname"

                    }
                },

                {
                    $sort: {
                        "createdon": -1
                    }
                }
            ]).exec((err, data) => {
                if (err) {
                    logger.error('error while fetching distributed coupon count', 'paymentsTrans:paymentTransactionOfMerchant()', 5)
                    let response = api.apiresponse(true, 500, 'error while fetching distributed coupon count', 'paymentsTrans:paymentTransactionOfMerchant()', null)
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
        res.send(err)
    })
}


let noOfDistributedCoupon = (req, res) => {
    let noOfCoupon = () => {
        return new Promise((resolve, reject) => {
            coupon.aggregate([
                {
                    $match:
                    {
                        "merchantid": req.headers.merchantid,
                        "valid": "1"
                    }
                },
                {
                    $lookup: {
                        from: "coupondistributions",
                        localField: 'couponcode',
                        foreignField: 'couponcode',
                        as: 'couponCount'
                    }
                },
                {
                    $unwind: "$couponCount"
                }
            ]).exec((err, data) => {
                if (err) {
                    logger.error('error while fetching distributed coupon count', 'noOfCoupon:noOfDistributedCoupon()', 5)
                    let response = api.apiresponse(true, 500, 'error while fetching distributed coupon count', 'noOfCoupon:noOfDistributedCoupon()', null)
                    reject(response)
                } else if (emptyCheck.emptyCheck(data)) {
                    logger.error('error no coupon found for merchant as no active coupon exist', 'noOfCoupon:noOfDistributedCoupon()', 10)
                    let response = api.apiresponse(true, 404, 'error no coupon found for merchant as no active coupon exist', null)
                    reject(response)
                } else {
                    logger.info('data fetched for no of coupon', 'noOfCoupon:noOfDistributedCoupon()')
                    resolve(data.length)
                }
            })
        })
    }

    noOfCoupon(req, res).then((resolve) => {
        logger.info('data fetched for no of coupon', 'noOfDistributedCoupon()')
        let response = api.apiresponse(false, 200, 'data fetched for no of coupon', resolve)
        res.send(response)
    }).catch((err) => {
        logger.error('something went wrong while fetching coupon count', 'noOfDistributedCoupon()', 10)
        res.send(err)
    })
}

let countOfRedeemedCoupon = async (req, res) => {
    try {
        let getCountOfRedeem = await coupon.aggregate([
            {
                $match:
                {
                    "merchantid": req.headers.merchantid,
                    "valid": "1"
                }
            },
            {
                $lookup: {
                    from: "coupondistributions",
                    localField: 'couponcode',
                    foreignField: 'couponcode',
                    as: 'couponCount'
                }
            },
            {
                $unwind: "$couponCount"
            },
            {
                $project: {
                    "_id": 0,
                    "merchantid": 1,
                    "couponcode": 1,
                    "isRedmeed": 1
                }
            },
            {
                $match: {
                    "isRedmeed": true
                }
            }
        ])
        // console.log(getCountOfRedeem)
        if (emptyCheck.emptyCheck(getCountOfRedeem)) {
            logger.error('error no coupon found for merchant as no active coupon exist', 'getCountOfRedeem:countOfRedeemedCoupon()', 10)
            let response = api.apiresponse(true, 404, 'error no coupon found for merchant as no active coupon exist', null)
            res.send(response)
        } else {
            logger.info('data fetched for no of coupon', 'getCountOfRedeem:countOfRedeemedCoupon()')
            res.send(getCountOfRedeem.length)
        }

    } catch (err) {
        logger.error('error while fetching redeemed coupon count', 'getCountOfRedeem:countOfRedeemedCoupon()', 5)
        let response = api.apiresponse(true, 500, 'error while fetching distributed coupon count', 'getCountOfRedeem:countOfRedeemedCoupon()', null)
        reject(response)
    }
}

// let countOfRedeemedCoupon = (req, res) => {
//     let getCountOfRedeem = () => {
//         return new Promise((resolve, reject) => {
//             coupon.aggregate([
//                 {
//                     $match:
//                     {
//                         "merchantid": req.headers.merchantid,
//                         "valid": "1"
//                     }
//                 },
//                 {
//                     $lookup: {
//                         from: "coupondistributions",
//                         localField: 'couponcode',
//                         foreignField: 'couponcode',
//                         as: 'couponCount'
//                     }
//                 },
//                 {
//                     $unwind: "$couponCount"
//                 },
//                 {
//                     $project: {
//                         "_id": 0,
//                         "merchantid": 1,
//                         "couponcode": 1,
//                         "isRedmeed": 1
//                     }
//                 },
//                 {
//                     $match: {
//                         "isRedmeed": true
//                     }
//                 }
//             ]).exec((err, data) => {
//                 if (err) {
//                     logger.error('error while fetching redeemed coupon count', 'getCountOfRedeem:countOfRedeemedCoupon()', 5)
//                     let response = api.apiresponse(true, 500, 'error while fetching distributed coupon count', 'getCountOfRedeem:countOfRedeemedCoupon()', null)
//                     reject(response)
//                 } else if (emptyCheck.emptyCheck(data)) {
//                     logger.error('error no coupon found for merchant as no active coupon exist', 'getCountOfRedeem:countOfRedeemedCoupon()', 10)
//                     let response = api.apiresponse(true, 404, 'error no coupon found for merchant as no active coupon exist', null)
//                     reject(response)
//                 } else {
//                     logger.info('data fetched for no of coupon', 'getCountOfRedeem:countOfRedeemedCoupon()')
//                     resolve(data.length)
//                 }
//             })
//         })
//     }
//     getCountOfRedeem(req, res).then((resolve) => {
//         logger.info('data fetched for no of coupon reedmed', 'countOfRedeemedCoupon()')
//         let response = api.apiresponse(false, 200, 'data fetched for no of coupon reedmed', resolve)
//         res.send(response)
//     }).catch((err) => {
//         logger.error('something went wrong while fetching coupon reedmed count', 'noOfDistributedCoupon()', 5)
//         res.send(err)
//     })

// }

let saveBankDataForMerchant = async (req, res) => {
    try {
        let merchantid = await bankData.find({ merchantid: req.headers.merchantid })
        if (emptyCheck.emptyCheck(merchantid)) {
            logger.info('merchant new entry', 'saveBankDataForMerchant()')
            let newBank = new bankData({
                merchantid: req.headers.merchantid,
                bankAccount: req.body.bankAccount,
                ifscCode: req.body.ifscCode,
                bankName: req.body.bankName
            })
            let saveData = await newBank.save();
            let response = api.apiresponse(false, 200, 'merchant bank details stored', saveData._doc)
            res.send(response)
        } else {
            logger.error('merchant data already exist', 'saveBankDataForMerchant()', 10)
            let response = api.apiresponse(false, 400, 'merchant bank details present', null)
            res.send(response)
        }
    } catch (err) {
        logger.error('something went wrong while storing bank data for merchant', 'saveBankDataForMerchant()')
        let response = api.apiresponse(false, 500, 'something went wrong while storing bank data for merchant', err)
        res.send(response)
    }
}

module.exports = {
    paymentTransactionOfMerchant,
    noOfDistributedCoupon,
    countOfRedeemedCoupon,
    saveBankDataForMerchant
}