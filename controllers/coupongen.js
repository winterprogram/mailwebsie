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
//adding api response structure 
const api = require('./../libs/apiresponse')
// adding password encry lib
const passencry = require('./../libs/passEncry')
// events
const event = require('events')
const eventemiter = new event.EventEmitter();
// importing jwt token lib
const jwt = require('./../libs/jswt')


let coupongen = (req, res) => {

    // will expect data that is auth parameter from user
    let verifyclaim = () => {

        return new Promise((resolve, reject) => {
            // data = mertoken.find().select('-_v-_ID').lean()
            // console.log(data)

            mertoken.find({ merchantid: "Z5Kkwp" }).exec((err, result) => {
                // console.log(result[0].authtoken)
                // jwt.verifyToken(result[0].authtoken, result[0].secreatekey, ((error, userdata) => {
                //     if (error) {
                //         let response = api.apiresponse(true, ' some error at stage 1.0 verifyclaim', 503, null)
                //         reject(response)
                //     } else if (emptyCheck.emptyCheck(userdata)) {
                //         let response = api.apiresponse(true, ' token can\'t be blank logout user', 500, null)
                //         reject(response)
                //     } else {
                //         let response = api.apiresponse(false, 'token stisfies the claim', 200, userdata)
                //         resolve(response)
                //     }
                // }
                // ))

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
            mertoken.find({ merchantid: "Z5Kkwp" }).exec((err, result) => {
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
                                merchantid: "Z5Kkwp",
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
                                merchantid: "Z5Kkwp",
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


module.exports = {
    coupongen: coupongen
}