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
const c = require('./../models/Coupongen')
const coupon = mongoose.model('coupons')
// adding empty check 
const emptyCheck = require('./../libs/emptyCheck')
const logger = require('../libs/logger')
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


let coupongen = (req, res) => {

    // will expect data that is auth parameter from user
    let verifyclaim = () => {

        return new Promise((resolve, reject) => {
            // data = mertoken.find().select('-_v-_ID').lean()
            // console.log(data)

            mertoken.find({ merchantid: req.headers.merchantid }).exec((err, result) => {
                // console.log(result[0].authtoken)
                jwt.verifyToken(result[0].authtoken, ((error, userdata) => {
                    // console.log(error)
                    if (error) {
                        let response = api.apiresponse(true, 'token expired please logout user', 503, error)
                        // console.log(error)
                        reject(response)
                    } else if (emptyCheck.emptyCheck(userdata)) {
                        let response = api.apiresponse(true, ' token can\'t be blank logout user', 500, null)
                        reject(response)
                    } else {
                        let response = api.apiresponse(false, 'token stisfies the claim', 200, userdata)
                        resolve(response)
                    }
                }
                ))

                if (err) {
                    let response = api.apiresponse(true, ' some error at stage 1.1 verifyclaim', 503, null)
                    reject(response)
                } else if (emptyCheck.emptyCheck(result)) {
                    let response = api.apiresponse(true, ' user not found', 400, null)
                    reject(response)
                } else {
                    let response = api.apiresponse(false, 'userfound', 200, result)
                    resolve(response)
                }
            })
        })
    }

    let usergencoupon = () => {
        return new Promise((resolve, reject) => {
            mertoken.find({ merchantid: req.headers.merchantid }).exec((err, result) => {
                if (err) {
                    let response = api.apiresponse(true, ' some error at stage 1 usergencoupon', 500, null)
                    reject(response)
                } else if (emptyCheck.emptyCheck(result)) {
                    let response = api.apiresponse(true, ' data can\t be blank stage 1 usergencoupon', 404, null)
                    reject(response)
                } else {
                    // console.log(result[0].merchantid)
                    coupon.find({ merchantid: result[0].merchantid }).exec((err, data) => {
                        console.log(data)
                        if (err) {
                            let response = api.apiresponse(true, 'error while finding data', 500, null)
                            reject(response)
                        } else if (emptyCheck.emptyCheck(data)) {
                            // let response = api.apiresponse(true, 'data is blank in 2 usergencoupon', 404, null)
                            let couponcode = randomize('Aa0', 6)
                            let valid = 1
                            let coupondata = new coupon({
                                merchantid: req.headers.merchantid,
                                couponcode: couponcode,
                                startdate: req.body.startdate,
                                enddate: req.body.enddate,
                                discount: req.body.discount,
                                faltdiscountupto: req.body.faltdiscountupto,
                                valid: valid
                            })
                            coupondata.save((err, datainfo) => {
                                if (err) {
                                    let response = api.apiresponse(true, ' some error at storing data', 500, null)
                                    reject(response)
                                } else if (emptyCheck.emptyCheck(datainfo)) {
                                    let response = api.apiresponse(true, ' data is blank', 404, null)
                                    reject(response)
                                } else {
                                    // let response = api.apiresponse(false, ' data is stored', 404, datainfo)
                                    resolve(datainfo)
                                }
                            })
                            // resolve(data)
                            // reject(response)
                        } else if ((data[0].valid) == 1) {
                            let response = api.apiresponse(true, '1st coupon of the merchant is active', 400, null)
                            reject(response)
                        } else {

                            let couponcode = randomize('Aa0', 6)
                            let valid = 1
                            let coupondata = new coupon({
                                merchantid: req.headers.merchantid,
                                couponcode: couponcode,
                                startdate: req.body.startdate,
                                enddate: req.body.enddate,
                                discount: req.body.discount,
                                faltdiscountupto: req.body.faltdiscountupto,
                                valid: valid
                            })
                            coupondata.save((err, datainfo) => {
                                if (err) {
                                    let response = api.apiresponse(true, ' some error at storing data', 500, null)
                                    reject(response)
                                } else if (emptyCheck.emptyCheck(datainfo)) {
                                    let response = api.apiresponse(true, ' data is blank', 404, null)
                                    reject(response)
                                } else {
                                    // let response = api.apiresponse(false, ' data is stored', 404, datainfo)
                                    resolve(datainfo)
                                }
                            })
                        }
                    })
                }
            })
        })
    }

    verifyclaim(req, res).then(usergencoupon).then((resolve) => {
        // console.log(resolve)
        let response = api.apiresponse(false, ' data is stored', 200, resolve)
        res.send(response)
    }).catch((err) => {
        console.log(err)
        res.send(err)
    })
}



// edit coupon

let editcoupon = (req, res) => {

    let verifyclaim = () => {

        return new Promise((resolve, reject) => {
            // data = mertoken.find().select('-_v-_ID').lean()
            // console.log(data)

            mertoken.find({ merchantid: req.headers.merchantid }).exec((err, result) => {
                // console.log(result[0].authtoken)
                jwt.verifyToken(result[0].authtoken, ((error, userdata) => {
                    // console.log(error)
                    if (error) {
                        let response = api.apiresponse(true, 'token expired please logout user', 503, error)
                        // console.log(error)
                        reject(response)
                    } else if (emptyCheck.emptyCheck(userdata)) {
                        let response = api.apiresponse(true, ' token can\'t be blank logout user', 500, null)
                        reject(response)
                    } else {
                        let response = api.apiresponse(false, 'token stisfies the claim', 200, userdata)
                        resolve(response)
                    }
                }
                ))

                if (err) {
                    let response = api.apiresponse(true, ' some error at stage 1.1 verifyclaim', 503, null)
                    reject(response)
                } else if (emptyCheck.emptyCheck(result)) {
                    let response = api.apiresponse(true, ' user not found', 400, null)
                    reject(response)
                } else {
                    let response = api.apiresponse(false, 'userfound', 200, result)
                    resolve(response)
                }
            })
        })
    }

    let couponexist = () => {
        return new Promise((resolve, reject) => {
            coupon.find({ merchantid: req.headers.merchantid }).exec((err, result) => {
                if (err) {
                    logger.error('something went wrong during couponexist', 'couponexist:editcupon()', 10)
                    let response = api.apiresponse(true, 'something went wrong during couponexist', 500, null)
                    reject(response)
                } else if (emptyCheck.emptyCheck(result)) {
                    logger.error('coupon exist didn\'t exist for this merchant', 'couponexist:editcupon()', 10)
                    let response = api.apiresponse(true, 'coupon exist didn\'t exist for this merchant', 404, null)
                    reject(response)
                } else if (result.valid == 0) {
                    logger.error('coupon is expired for this merchant', 'couponexist:editcupon()', 10)
                    let response = api.apiresponse(true, 'coupon is expired for this merchant', 400, null)
                    reject(response)
                } else if (result.couponcode) {
                    // let couponcode = randomize('Aa0', 6)
                    let valid = 1
                    let coupondata = new coupon({
                        // merchantid: req.headers.merchantid,
                        // couponcode: couponcode,
                        startdate: req.body.startdate,
                        enddate: req.body.enddate,
                        discount: req.body.discount,
                        faltdiscountupto: req.body.faltdiscountupto,
                        valid: valid
                    })

                    coupondata.save((error, data) => {
                        if (error) {
                            logger.error('error while saving coupon data', 'couponsave()', 10)
                            let response = api.apiresponse(true, 'error while saving coupon data', 400, null)
                            reject(response)
                        } else if (emptyCheck.emptyCheck(data)) {
                            logger.error('error edit coupon data can\'t be blank', 'couponsave()', 10)
                            let response = api.apiresponse(true, 'error edit coupon data can\'t be blank', 500, null)
                            reject(response)
                        } else {
                            logger.info('coupon edit saved successfully', 'couponsave()')
                            resolve(data)
                        }
                    })
                }
            })
        })
    }
    verifyclaim(req,res).then(couponexist).then((resolve) => {
        logger.info('coupon edit saved successfully - 2', 'final promis')
        let response = api.apiresponse(false, ' data is stored', 200, resolve)
        res.send(response)
    }).catch((err) => {
        console.log(err)
        res.send(err)
    })
}


// delete coupon

let deletecoupon = (req, res) => {

    let verifyclaim = () => {

        return new Promise((resolve, reject) => {

            mertoken.find({ merchantid: req.headers.merchantid }).exec((err, result) => {

                jwt.verifyToken(result[0].authtoken, ((error, userdata) => {

                    if (error) {
                        logger.error('token expired please logout user', 'merchantresetpass:verifyclaim()', 10)
                        let response = api.apiresponse(true, 'token expired please logout user', 503, error)
                        reject(response)
                    } else if (emptyCheck.emptyCheck(userdata)) {
                        logger.error(' token can\'t be blank logout user', 'merchantresetpass:verifyclaim()', 10)
                        let response = api.apiresponse(true, ' token can\'t be blank logout user', 500, null)
                        reject(response)
                    } else {
                        let response = api.apiresponse(false, 'token stisfies the claim', 200, userdata)
                        resolve(response)
                    }
                }
                ))

                if (err) {
                    let response = api.apiresponse(true, ' some error at stage 1.1 verifyclaim', 503, null)
                    reject(response)
                } else if (emptyCheck.emptyCheck(result)) {
                    let response = api.apiresponse(true, ' user not found', 400, null)
                    reject(response)
                } else {
                    let response = api.apiresponse(false, 'userfound', 200, result)
                    resolve(response)
                }
            })
        })
    }

    let deletes = () => {
        return new Promise((resolve, reject) => {
            coupon.find({ merchantid: req.headers.merchantid }).exec((err, result) => {
                if (err) {
                    logger.error('something went wrong during deletecoupon', 'deletecoupon:deletes()', 10)
                    let response = api.apiresponse(true, 'something went wrong during deletecoupon', 500, null)
                    reject(response)
                } else if (emptyCheck.emptyCheck(result)) {
                    logger.error('coupon exist didn\'t exist for this merchant', 'deletecoupon:deletes()', 10)
                    let response = api.apiresponse(true, 'coupon exist didn\'t exist for this merchant', 404, null)
                    reject(response)
                } else if (result.valid == 1) {
                    coupon.update({ valid: 1 }, { $set: { valid: 0 } }).exec((error, data) => {
                        if (error) {
                            logger.error('something went wrong during updating valid 1 to 0', 'deletecoupon:update()', 10)
                            let response = api.apiresponse(true, 'something went wrong during updating valid 1 to 0', 500, null)
                            reject(response)
                        } else if (emptyCheck.emptyCheck(data)) {
                            logger.error('something went wrong received blank data', 'deletecoupon:update()', 5)
                            let response = api.apiresponse(true, 'something went wrong blank data', 500, null)
                            reject(response)
                        } else {
                            logger.info('updated 1 to 0', 'update success')
                            resolve(data)
                        }
                    })
                }
            })
        })
    }
    verifyclaim(req,res).then(deletes).then((resolve) => {
        logger.info('coupon delete successfully - 2', 'final promis')
        let response = api.apiresponse(false, ' coupon delete', 200, resolve)
        res.send(response)
    }).catch((err) => {
        logger.error('something went wrong coupon update failed -2', 'deletecoupon:update()', 1)
        console.log(err)
        res.send(err)
    })

}


let getcoupon = (req, res) => {
    coupon.find({ merchantid: req.headers.merchantid }).exec((err, result) => {
        console.log(result)
        if (err) {
            logger.error('error while fetching merchant coupon details', 'findmerchant : getcoupon()', 10)
            let response = api.apiresponse(true, 'error while fetching merchant coupon details', 500, null)
            res.send(response)
        } else if (emptyCheck.emptyCheck(result)) {
            logger.error('error while fetching merchant coupon details', 'findmerchant : getcoupon()', 10)
            let response = api.apiresponse(true, 'error while fetching merchant coupon details', 500, null)
            res.send(response)   
        }        
        else{
            logger.info('Coupon is fetched','Remark it as red/green depending on valid')
            let response = api.apiresponse(false,'coupon is fetched',200,result)
            res.send(response)
        }
    })

}

module.exports = {
    coupongen: coupongen,
    editcoupon: editcoupon,
    deletecoupon: deletecoupon,
    getcoupon:getcoupon
}