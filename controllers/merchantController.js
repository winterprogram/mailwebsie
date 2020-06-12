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
        logger.error('something went wrong while storing bank data for merchant', 'saveBankDataForMerchant()', 5)
        let response = api.apiresponse(false, 500, 'something went wrong while storing bank data for merchant', err)
        res.send(response)
    }
}

let merchantEditShopName = async (req, res) => {
    try {
        let findmerchant = await merchant.find({ merchantid: req.headers.merchantid })
        if (emptyCheck.emptyCheck(findmerchant)) {
            logger.error('merchantid not found in db', 'merchantEditShopName()', 10)
            let response = api.apiresponse(true, 500, 'merchantid not found in db', null)
            res.send(response)
        } else {
            let updateShopName = await merchant.update({ merchantid: req.headers.merchantid }, { $set: { shopname: req.body.shopname } })
            console.log(updateShopName)
            if (updateShopName.nModified == 0) {
                logger.error('failed while updating merchant shopname', 'merchantEditShopName()', 10)
                let response = api.apiresponse(true, 400, 'failed while updating merchant shopname', null)
                res.send(response)
            } else {
                logger.info('merchant shop name changed', 'merchantEditShopName()')
                let response = api.apiresponse(false, 200, 'merchant shop name changed', updateShopName)
                res.send(response)
            }
        }
    } catch (err) {
        logger.error('something went wrong while updating the merchant shop name', 'merchantEditShopName()', 5)
        let response = api.apiresponse(false, 500, 'something went wrong while updating the merchant shop name', err)
        res.send(response)
    }
}

let merchantEditEmail = async (req, res) => {
    try {
        let findmerchant = await merchant.find({ merchantid: req.headers.merchantid })
        if (emptyCheck.emptyCheck(findmerchant)) {
            logger.error('merchantid not found in db', 'merchantEditEmail()', 10)
            let response = api.apiresponse(true, 500, 'merchantid not found in db', null)
            res.send(response)
        } else {
            let updateEmail = await merchant.update({ merchantid: req.headers.merchantid }, { $set: { email: req.body.email } })
            console.log(updateEmail)
            if (updateEmail.nModified == 0) {
                logger.error('failed while updating merchant email', 'merchantEditEmail()', 10)
                let response = api.apiresponse(true, 400, 'failed while updating merchant email', null)
                res.send(response)
            } else {
                logger.info('merchant email changed', 'merchantEditEmail()')
                let response = api.apiresponse(false, 200, 'merchant email changed', updateEmail)
                res.send(response)
            }
        }
    } catch (err) {
        logger.error('something went wrong while updating the merchant email', 'merchantEditEmail()', 5)
        let response = api.apiresponse(false, 500, 'something went wrong while updating the merchant email', err)
        res.send(response)
    }
}


let merchantEditAddress = async (req, res) => {
    try {
        let findmerchant = await merchant.find({ merchantid: req.headers.merchantid })
        if (emptyCheck.emptyCheck(findmerchant)) {
            logger.error('merchantid not found in db', 'merchantEditAddress()', 10)
            let response = api.apiresponse(true, 500, 'merchantid not found in db', null)
            res.send(response)
        } else {
            let updateAddress = await merchant.update({ merchantid: req.headers.merchantid }, { $set: { address: req.body.address } })
            if (updateAddress.nModified == 0) {
                logger.error('failed while updating merchant address', 'merchantEditAddress()', 10)
                let response = api.apiresponse(true, 400, 'failed while updating merchant address', null)
                res.send(response)
            } else {
                logger.info('merchant address changed', 'merchantEditAddress()')
                let response = api.apiresponse(false, 200, 'merchant address changed', updateAddress)
                res.send(response)
            }
        }
    } catch (err) {
        logger.error('something went wrong while updating the merchant address', 'merchantEditAddress()', 5)
        let response = api.apiresponse(false, 500, 'something went wrong while updating the merchant address', err)
        res.send(response)
    }
}

let merchantEditZipCode = async (req, res) => {
    try {
        let findmerchant = await merchant.find({ merchantid: req.headers.merchantid })
        if (emptyCheck.emptyCheck(findmerchant)) {
            logger.error('merchantid not found in db', 'merchantEditZipCode()', 10)
            let response = api.apiresponse(true, 500, 'merchantid not found in db', null)
            res.send(response)
        } else {
            let updatezipcode = await merchant.update({ merchantid: req.headers.merchantid }, { $set: { zipcode: req.body.zipcode } })
            if (updatezipcode.nModified == 0) {
                logger.error('failed while updating merchant zipcode', 'merchantEditZipCode()', 10)
                let response = api.apiresponse(true, 400, 'failed while updating merchant zipcode', null)
                res.send(response)
            } else {
                logger.info('merchant zipcode changed', 'merchantEditZipCode()')
                let response = api.apiresponse(false, 200, 'merchant zipcode changed', updatezipcode)
                res.send(response)
            }
        }
    } catch (err) {
        logger.error('something went wrong while updating the merchant zipcode', 'merchantEditZipCode()', 5)
        let response = api.apiresponse(false, 500, 'something went wrong while updating the merchant zipcode', err)
        res.send(response)
    }
}

let merchantEditCity = async (req, res) => {
    try {
        let findmerchant = await merchant.find({ merchantid: req.headers.merchantid })
        if (emptyCheck.emptyCheck(findmerchant)) {
            logger.error('merchantid not found in db', 'merchantEditCity()', 10)
            let response = api.apiresponse(true, 500, 'merchantid not found in db', null)
            res.send(response)
        } else {
            let updateCity = await merchant.update({ merchantid: req.headers.merchantid }, { $set: { city: req.body.city } })
            if (updateCity.nModified == 0) {
                logger.error('failed while updating merchant city', 'merchantEditCity()', 10)
                let response = api.apiresponse(true, 400, 'failed while updating merchant city', null)
                res.send(response)
            } else {
                logger.info('merchant city changed', 'merchantEditCity()')
                let response = api.apiresponse(false, 200, 'merchant city changed', updateCity)
                res.send(response)
            }
        }
    } catch (err) {
        logger.error('something went wrong while updating the merchant city', 'merchantEditCity()', 5)
        let response = api.apiresponse(false, 500, 'something went wrong while updating the merchant city', err)
        res.send(response)
    }
}


let merchantEditGeoLocation = async (req, res) => {
    try {
        let findmerchant = await merchant.find({ merchantid: req.headers.merchantid })
        if (emptyCheck.emptyCheck(findmerchant)) {
            logger.error('merchantid not found in db', 'merchantEditCity()', 10)
            let response = api.apiresponse(true, 500, 'merchantid not found in db', null)
            res.send(response)
        } else {
            let updateLocation = await merchant.update({ merchantid: req.headers.merchantid }, { $set: { latitude: req.body.latitude, longitude: req.body.longitude } })
            if (updateLocation.nModified == 0) {
                logger.error('failed while updating merchant geo', 'merchantEditCity()', 10)
                let response = api.apiresponse(true, 400, 'failed while updating merchant geo', null)
                res.send(response)
            } else {
                logger.info('merchant geo changed', 'merchantEditCity()')
                let response = api.apiresponse(false, 200, 'merchant geo changed', updateLocation)
                res.send(response)
            }
        }
    } catch (err) {
        logger.error('something went wrong while updating the merchant geo', 'merchantEditCity()', 5)
        let response = api.apiresponse(false, 500, 'something went wrong while updating the merchant geo', err)
        res.send(response)
    }
}

let updateBankDetails = async (req, res) => {
    try {
        let findMerchant = await bankData.find({ merchantid: req.headers.merchantid })
        console.log(findMerchant)
        if (emptyCheck.emptyCheck(findMerchant)) {
            logger.error('entry of the merchant doesn\'t exist', 'updateBankDetails()', 10)
            let response = api.apiresponse(true, 404, 'entry of the merchant doesn\'t exist', null)
            res.send(response)
        } else {
            let updatebank = await bankData.update({ merchantid: findMerchant[0].merchantid }, {
                $set: {
                    merchantid: req.headers.merchantid,
                    bankAccount: req.body.bankAccount,
                    ifscCode: req.body.ifscCode,
                    bankName: req.body.bankName
                }
            })
            if (updatebank.nModified == 0) {
                logger.error('not a vaild input', 'updateBankDetails()', 10)
                let response = api.apiresponse(true, 400, 'not a valid input', null)
                res.send(response)
            } else {
                logger.info('bank details upadted', 'updateBankDetails()')
                let response = api.apiresponse(false, 200, 'bank data updated', updatebank)
                res.send(response)
            }
        }
    } catch (err) {
        logger.error('something went wrong while updating the merchant bank deatils', 'updateBankDetails()', 5)
        let response = api.apiresponse(false, 500, 'something went wrong while updating the merchant bank deatils', err)
        res.send(response)
    }
}

let merchantBankDeatils = async (req, res) => {
    try {
        let getBankDeatils = await bankData.find({ merchantid: req.headers.merchantid })
        if (emptyCheck.emptyCheck(getBankDeatils)) {
            logger.error('no bank deatils found', 'merchantBankDeatils()', 10)
            let response = api.apiresponse(true, 404, 'no bank deatils found', null)
            res.send(response)
        } else {
            logger.info('bank deatils found', 'merchantBankDeatils()')
            let response = api.apiresponse(false, 200, 'bank deatils found', getBankDeatils)
            res.send(response)
        }
    } catch (err) {
        logger.error('something went wrong while finding the merchant bank deatils', 'merchantBankDeatils()', 5)
        let response = api.apiresponse(false, 500, 'something went wrong while finding the merchant bank deatils', err)
        res.send(response)
    }
}
module.exports = {
    paymentTransactionOfMerchant,
    noOfDistributedCoupon,
    countOfRedeemedCoupon,
    saveBankDataForMerchant,
    merchantEditShopName,
    merchantEditEmail,
    merchantEditAddress,
    merchantEditZipCode,
    merchantEditCity,
    merchantEditGeoLocation,
    updateBankDetails,
    merchantBankDeatils
}