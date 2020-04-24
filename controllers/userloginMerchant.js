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

let merchantlogin = (req, res) => {

    let mobileDigitCheck = () => {
        return new Promise((resolve, reject) => {
            if (emptyCheck.emptyCheck(req.body.mobilenumber)) {
                let apis = api.apiresponse(true, 'mobilenumber can\'t be empty', 400, null)
                reject(apis)
            } else {
                let regex = /^[0-9]{10}/
                let mobile = req.body.mobilenumber
                // console.log(mobile)
                if (mobile.match(regex)) {
                    let response = api.apiresponse(false, 200, "mobileno passed the check", null)
                    // console.log(mobile)
                    resolve(response)
                } else {
                    let response = api.apiresponse(true, 500, 'mobileno doesn\'t pass', null)
                    reject(response)
                }
            }


        })
    }


    let userLoginFinal = () => {
        return new Promise((resolve, reject) => {
            merchant.find({ mobilenumber: req.body.mobilenumber }).exec((err, data) => {
                // console.log(data[0].password)
                if (err) {
                    let apis = api.apiresponse(true, 'error at last stage ', 500, null)
                    // send user to signup 
                    reject(apis)
                } else if (emptyCheck.emptyCheck(data)) {
                    let apis = api.apiresponse(true, 'mobienumber doesn\'t exist please login ', 500, null)
                    // send user to signup 
                    reject(apis)
                }
                else {
                    // console.log(data)

                    //   console.log(req.body.password)
                    passencry.passcheck(req.body.password, data[0].password, ((error, result) => {
                        // console.log(result)
                        if (error) {
                            let apis = api.apiresponse(true, 'Something went wrong', 500, null)
                            reject(apis)
                        } else if ((data[0].valid == 0)) {
                            let apis = api.apiresponse(true, 'Merchant doesn\'t have right\'s to access', 503, null)
                            reject(apis)
                        }
                        else if (result == true) {
                            let apis = api.apiresponse(false, 'password  match', 200, data)
                            resolve(apis)
                        } else {
                            let apis = api.apiresponse(true, 'password didn\'t match / wrong password', 404, null)
                            reject(apis)
                        }
                    }))
                }
            })

        }
        )
    }
    let jwtTokengen = (merchantData) => {
        return new Promise((resolve, reject) => {
            jwt.generateToken(merchantData, ((err, result) => {
                if (err) {
                    let response = api.apiresponse(true, 'Error while generating Jwt token stage', 500, null)
                    reject(response)
                } else if (emptyCheck.emptyCheck(result)) {
                    let response = api.apiresponse(true, 'data while generating jwt is vacant', 404, null)
                    reject(response)
                }

                else {
                    console.log(merchantData.data[0].merchantid)
                    mertoken.deleteOne({ merchantid: merchantData.data[0].merchantid }).exec((err, result) => {
                        if (err) {
                            let response = api.apiresponse(true, 'error while deleting the merchant token', 504, null)
                            reject(response)
                        } else if (emptyCheck.emptyCheck(result)) {
                            let response = api.apiresponse(true, 'error while deleting the merchant token', 400, null)
                            reject(response)
                        } else {
                            let response = api.apiresponse(true, 'data successfully deleted adding new one', 200, result)
                            resolve(response)
                        }
                    })
                    result.merchantid = merchantData.data[0].merchantid
                    result.merchantData = merchantData.data[0]
                    let tok = new mertoken({
                        merchantid: result.merchantid,
                        authtoken: result.token,
                        secreatekey: result.tokensecreate,
                        // userinfo: (result.userData),
                        createdon: Date.now()
                    })
                    tok.save((error, authtokendetails) => {
                        if (error) {
                            let response = api.apiresponse(true, 'Error while storing Jwt token stage -2', 500, error)
                            reject(response)
                        } else if ((emptyCheck.emptyCheck(authtokendetails))) {

                            let response = api.apiresponse(true, 'Error while storing Jwt token empty data', 404, null)
                            reject(response)
                        } else {
                            // let auth = authtokendetails.toObject()
                            //  console.log(authtokendetails)
                            let a = api.apiresponse(true, 'user token stored successfully(1st login)', 403, authtokendetails)
                            resolve(a)
                        }
                    })
                    // console.log(result)
                    resolve(result)
                }
            }))
        })

    }


    mobileDigitCheck(req, res).then(userLoginFinal).then(jwtTokengen).then((resolve) => {
        // console.log(resolve.data[0])
        // resolve = resolve.data[0]
        resolve.merchantData._id = undefined
        resolve.merchantData.password = undefined
        resolve.merchantData.createdon = undefined
        resolve.merchantData.__v = undefined
        resolve.merchantData.dob = undefined
        // resolve.merchantData.mobilenumber = undefined
        // resolve.merchantData.email = undefined
        let apis = api.apiresponse(false, 'successful login', 200, resolve)
        res.send(apis)
    }).catch((err) => {
        console.log(err)
        res.send(err)
    })

}

let merchantresetpass = (req, res) => {
    let findmerchant = () => {
        return new Promise((resolve, reject) => {
            merchant.findOne({ merchantid: req.headers.merchantid }).exec((err, result) => {
                console.log(result)
                if (err) {
                    logger.error('error while fetching merchant details', 'findmerchant : merchantresetpass()', 10)
                    let response = api.apiresponse(true, 'error while fetching merchant details', 500, null)
                    reject(response)
                } else if (emptyCheck.emptyCheck(result)) {
                    logger.error('error merchnat not found in db', 'findmerchant : merchantresetpass()', 10)
                    let response = api.apiresponse(true, 'error merchnat not found in db', 404, null)
                    reject(response)
                } else {
                    logger.info('merchant info exist', 'findmerchant()')
                    resolve(result)
                }
            })
        })
    }

    let updatepass = (result) => {
        return new Promise((resolve, reject) => {
            let password = passencry.passhash(req.body.password)
            merchant.updateOne({ merchantid: result.merchantid},{$set:{password:password}}).exec((error,data)=>{
                if (error) {
                    logger.error('error while updating password', 'updatepass : merchantresetpass()', 10)
                    let response = api.apiresponse(true, 'error while fetching merchant details', 500, null)
                    reject(response)
                } else if (emptyCheck.emptyCheck(data)) {
                    logger.error('error password can\'t be blank', 'updatepass : merchantresetpass()', 10)
                    let response = api.apiresponse(true, 'error merchnat not found in db', 404, null)
                    reject(response)
                } else {
                    logger.info('password updated', 'updatepass()')
                    resolve(data)
                }
            })
        })
    }
    findmerchant(req,res).then(updatepass).then((resolve)=>{

        logger.info('password updated', 'merchantresetpass()')
        let response = api.apiresponse(false,'password updated successfully',200,resolve)
        res.send(response)
    }).catch((err)=>{
        logger.error('password update failed', 'merchantresetpass()')
        let response = api.apiresponse(false,'password update failed',404,err)
        res.send(response)
    })
}

module.exports = {
    merchantlogin: merchantlogin,
    merchantresetpass: merchantresetpass
}