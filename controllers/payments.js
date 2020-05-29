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
const b = require('./../models/Adminpayment')
const payout = mongoose.model('weeklypayout')
const signup = mongoose.model('signupforuser')
const moment = require('moment')
const Razorpay = require('razorpay')
const fcmpush = require('./firebase')

let instance = new Razorpay({
    key_id: '',
    key_secret: '',
})

let storePayments = (req, res) => {
    let datetoday = moment().format('DD-MM-YYYY')
    let cc = randomize('A0a', 7)
    let a = randomize('aA0', 4)
    let final = `order_${cc}_${a}`
    var options = {
        amount: req.body.amount,  // amount in the smallest currency unit
        currency: "INR",
        receipt: final,
        payment_capture: '1'
    };
    instance.orders.create(options, function (error, order) {
        let saveData = new payments({
            merchantid: req.body.merchantid,
            userid: req.body.userid,
            id: order.id,
            entity: order.entity,
            amount: (order.amount / 100),
            amount_paid: (order.amount_paid > 0 ? (order.amount_paid / 100) : order.amount_paid),
            amount_due: (order.amount_due > 0 ? (order.amount_due / 100) : order.amount_due),
            currency: order.currency,
            receipt: order.receipt,
            offer_id: order.offer_id,
            status: order.status,
            attempts: order.attempts,
            notes: order.notes,
            created_at: order.created_at,
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
    });
}


let getPaymentByOrder = (req, res) => {
    let amountPaidByUser = () => {
        return new Promise((resolve, reject) => {
            let a = req.body.order
            instance.orders.fetch(a, function (err, order) {
                console.log(order.amount_paid)
                if (order.amount_paid > 0) {
                    payments.update({ id: a }, { $set: { amount_paid: (order.amount_paid > 0 ? (order.amount_paid / 100) : order.amount_paid), amount_due: 0 } }).exec((err, data) => {
                        if (err) {
                            logger.error('error while updating payments', 'amountPaidByUser:getPaymentByOrder()', 1)
                            let response = api.apiresponse(true, 500, 'error while saving payments', null)
                            reject(response)
                        } else if (data.nModified == 0) {
                            logger.error('error blank data while updating payments', 'amountPaidByUser:getPaymentByOrder()', 1)
                            let response = api.apiresponse(true, 404, 'error blank data while updating payments', null)
                            reject(response)
                        } else {
                            logger.info('data updated for payments', 'amountPaidByUser:getPaymentByOrder()')
                            resolve(data)
                        }
                    })
                } else {
                    logger.error('amount_paid is = 0', 'amountPaidByUser:getPaymentByOrder()', 5)
                    let response = api.apiresponse(true, 500, 'amount_paid is = 0', null)
                    reject(response)
                }
            });
        })
    }

    amountPaidByUser(req, res).then((resolve) => {
        let response = api.apiresponse(false, 200, 'data updated for payments', resolve)
        title = 'Payment Success'
        body = `Payment received of ${resolve.amount_paid}`
        deviceToken = req.body.deviceToken
        setTimeout((fcmpush.fcmpush(title, body, deviceToken)), 1000)
        res.send(response)
    }).catch((err) => {
        res.send(err)
    })
}


let merchantEarning = (req, res) => {
    let getMerchantAmount = () => {
        return new Promise((resolve, reject) => {
            payments.find({ $and: [{ merchantid: req.headers.merchantid }, { isPaid: false }, { amount_paid: { $gt: 0 } }] }).exec((err, result) => {
                if (err) {
                    logger.error('error while fetching merchant payment info', 'getMerchantAmount:merchantEarning()', 1)
                    let response = api.apiresponse(true, 500, 'error while saving payments', null)
                    reject(response)
                } else if (emptyCheck.emptyCheck(result)) {
                    logger.error('error blank data while updating payments', 'getMerchantAmount:merchantEarning()', 1)
                    let response = api.apiresponse(true, 404, 'error blank data while updating payments', null)
                    reject(response)
                } else {
                    logger.info('data updated for payments', 'getMerchantAmount:merchantEarning()')
                    resolve(result)
                }
            })
        })
    }
    let fillByDate = (result) => {
        return new Promise((resolve, reject) => {
            let finalamount = [];
            for (let i in result) {
                let temp = result[i].amount_paid - (result[i].amount_paid * 0.04);
                finalamount.push(temp)
            }
            if (finalamount.length > 0) {
                logger.info('final data after commission cut', 'fillByDate:merchantEarning()')
                resolve(finalamount)
            } else {
                logger.error('error blank data while updating payments', 'fillByDate:merchantEarning()', 1)
                let response = api.apiresponse(true, 404, 'error blank data while updating payments', null)
                reject(response)
            }

        })
    }
    getMerchantAmount(req, res).then(fillByDate).then((resolve) => {
        let response = api.apiresponse(false, 200, 'data fetched for merchant', resolve)
        res.send(response)
    }).catch((err) => {
        res.send(err)
    })
}


let paidisTrue = (req, res) => {
    let findMerWithFalse = () => {
        return new Promise((resolve, reject) => {
            payments.find({ $and: [{ isPaid: false }, { amount_paid: { $gt: 0 } }] }).exec((err, result) => {
                if (err) {
                    logger.error('error while fetching merchant payment info', 'findMerWithFalse:paidisTrue()', 1)
                    let response = api.apiresponse(true, 500, 'error while saving payments', null)
                    reject(response)
                } else if (emptyCheck.emptyCheck(result)) {
                    logger.error('error blank data while updating payments', 'findMerWithFalse:paidisTrue()', 1)
                    let response = api.apiresponse(true, 404, 'error blank data while updating payments', null)
                    reject(response)
                } else {
                    logger.info('data for payout', 'findMerWithFalse:paidisTrue()')
                    resolve(result)
                }
            })
        })
    }

    let saveDataBeforeSave = (result) => {
        return new Promise((resolve, reject) => {
            // get list of all merchants
            let merchantIdTemp = [];
            for (let i = 0; i < result.length; i++) {
                let temp = result[i].merchantid;
                // merchantIdTemp.push(temp)
                // merchant wise data payout
                payments.find({ $and: [{ isPaid: false }, { merchantid: temp }, { amount_paid: { $gt: 0 } }] }).exec((error, datapay) => {
                    if (error) {
                        logger.error('error while fetching merchant payment info', 'saveDataBeforeSave:paidisTrue()', 1)
                        let response = api.apiresponse(true, 500, 'error while saving payments', null)
                        reject(response)
                    } else if (emptyCheck.emptyCheck(datapay)) {
                        logger.error('error blank data while updating payments', 'saveDataBeforeSave:paidisTrue()', 1)
                        let response = api.apiresponse(true, 404, 'error blank data while updating payments', null)
                        reject(response)
                    } else {
                        logger.info('data for payout', 'saveDataBeforeSave:paidisTrue()')
                        resolve(datapay)
                        let finalamount = [];
                        let adminAmount = [];
                        let datetoday = moment().format('DD-MM-YYYY')
                        // console.log(datapay.length)
                        for (let x = 0; x < datapay.length; x++) {
                            let temp = datapay[i].amount_paid - (datapay[i].amount_paid * 0.04);
                            finalamount.push(temp)
                            // console.log(temp)
                            let adTemp = (datapay[i].amount_paid * 0.04);
                            adminAmount.push(adTemp)
                        }

                        let final = 0;
                        let adminfinal = 0;
                        if (finalamount.length > 0) {
                            for (let i = 0; i < finalamount.length; i++) {
                                final += finalamount[i]
                            }
                            for (let x = 0; x < adminAmount.length; x++) {
                                adminfinal += adminAmount[x]
                            }
                        }
                        let weekly = new payout({
                            merchantid: datapay[0].merchantid,
                            merchantpayout: final,
                            adminpayout: adminfinal,
                            createdon: datetoday,
                            isPaid: true
                        })
                        weekly.save((err, data) => {
                            if (err) {
                                logger.error('error while saving payout data', 'saveDataBeforeSave:paidisTrue()', 1)
                                let response = api.apiresponse(true, 500, 'error while saving payments', null)
                                reject(response)
                            } else if (emptyCheck.emptyCheck(data)) {
                                logger.error('error blank data while updating payments', 'saveDataBeforeSave:paidisTrue()', 1)
                                let response = api.apiresponse(true, 404, 'error blank data while updating payments', null)
                                reject(response)
                            } else {
                                logger.info('new data for payments', 'saveDataBeforeSave:paidisTrue()')
                                resolve(data)
                            }
                        })
                    }
                })

            }
        })
    }
    let updateData = () => {
        return new Promise((resolve, reject) => {
            payments.updateMany({ isPaid: false }, { $set: { isPaid: true } }).exec((error, data) => {
                if (error) {
                    logger.error('error while fetching merchant payment info', 'updateData:paidisTrue()', 1)
                    let response = api.apiresponse(true, 500, 'error while saving payments', null)
                    reject(response)
                } else {
                    logger.info('data updated for payments', 'updateData:paidisTrue()')
                    resolve(data)
                }
            })

        })
    }
    findMerWithFalse(req, res).then(saveDataBeforeSave).then(updateData).then((resolve) => {
        let response = api.apiresponse(false, 200, 'data updated for merchant', resolve)
        res.send(response)
    }).catch((err) => {
        console.log(err)
        res.send(err)
    })

}

module.exports = {
    storePayments: storePayments,
    getPaymentByOrder: getPaymentByOrder,
    merchantEarning: merchantEarning,
    paidisTrue: paidisTrue
}