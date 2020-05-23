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
                let apis = api.apiresponse(true, 400, 'mobilenumber can\'t be empty', null)
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
                    let apis = api.apiresponse(true, 500, 'error at last stage ', null)
                    // send user to signup 
                    reject(apis)
                } else if (emptyCheck.emptyCheck(data)) {
                    let apis = api.apiresponse(true, 500, 'mobienumber doesn\'t exist please login ', null)
                    // send user to signup 
                    reject(apis)
                }
                else {
                    passencry.passcheck(req.body.password, data[0].password, ((error, result) => {
                        if (error) {
                            let apis = api.apiresponse(true, 500, 'Something went wrong', null)
                            reject(apis)
                        }
                        else if ((data[0].valid == 0)) {
                            let apis = api.apiresponse(true, 503, 'Merchant doesn\'t have right\'s to access', null)
                            reject(apis)
                        }
                        else if (result == true) {
                            let apis = api.apiresponse(false, 200, 'password  match', data)
                            resolve(apis)
                        } else {
                            let apis = api.apiresponse(true, 404, 'password didn\'t match / wrong password', null)
                            reject(apis)
                        }
                    }))
                }
            })

        }
        )
    }

    let jwtTokengen = (merchantData) => {
        console.log(merchantData)
        return new Promise((resolve, reject) => {
            if (merchantData.data[0].imageuploaded == false) {
                logger.error('images are not uploaded by this merchant', 'imageUploadCheck()', 5)
                let apis = api.apiresponse(true, 503, 'images are not uploaded by this merchant', null)
                reject(apis)
            } else {
                jwt.generateToken(merchantData, ((err, result) => {
                    if (err) {
                        let response = api.apiresponse(true, 500, 'Error while generating Jwt token stage', null)
                        reject(response)
                    } else if (emptyCheck.emptyCheck(result)) {
                        let response = api.apiresponse(true, 404, 'data while generating jwt is vacant', null)
                        reject(response)
                    }

                    else {
                        console.log(merchantData.data[0])
                        mertoken.deleteOne({ merchantid: merchantData.data[0].merchantid }).exec((err, result) => {
                            if (err) {
                                let response = api.apiresponse(true, 504, 'error while deleting the merchant token', null)
                                reject(response)
                            } else if (emptyCheck.emptyCheck(result)) {
                                let response = api.apiresponse(true, 400, 'error while deleting the merchant token', null)
                                reject(response)
                            } else {
                                let response = api.apiresponse(true, 200, 'data successfully deleted adding new one', result)
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
                                let response = api.apiresponse(true, 500, 'Error while storing Jwt token stage -2', error)
                                reject(response)
                            } else if ((emptyCheck.emptyCheck(authtokendetails))) {

                                let response = api.apiresponse(true, 404, 'Error while storing Jwt token empty data', null)
                                reject(response)
                            } else {
                                // let auth = authtokendetails.toObject()
                                //  console.log(authtokendetails)
                                let a = api.apiresponse(true, 403, 'user token stored successfully(1st login)', authtokendetails)
                                resolve(a)
                            }
                        })
                        // console.log(result)
                        resolve(result)
                    }
                }))
            }
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
        let apis = api.apiresponse(false, 200, 'successful login', resolve)
        res.send(apis)
    }).catch((err) => {
        console.log(err)
        res.send(err)
    })

}

let merchantresetpass = (req, res) => {

    let verifyclaim = () => {

        return new Promise((resolve, reject) => {

            mertoken.find({ merchantid: req.headers.merchantid }).exec((err, result) => {

                jwt.verifyToken(result[0].authtoken, ((error, userdata) => {

                    if (error) {
                        logger.error('token expired please logout user', 'merchantresetpass:verifyclaim()', 10)
                        let response = api.apiresponse(true, 503, 'token expired please logout user', error)
                        reject(response)
                    } else if (emptyCheck.emptyCheck(userdata)) {
                        logger.error(' token can\'t be blank logout user', 'merchantresetpass:verifyclaim()', 10)
                        let response = api.apiresponse(true, 500, ' token can\'t be blank logout user', null)
                        reject(response)
                    } else {
                        let response = api.apiresponse(false, 200, 'token stisfies the claim', userdata)
                        resolve(response)
                    }
                }
                ))

                if (err) {
                    let response = api.apiresponse(true, 503, ' some error at stage 1.1 verifyclaim', null)
                    reject(response)
                } else if (emptyCheck.emptyCheck(result)) {
                    let response = api.apiresponse(true, 400, ' user not found', null)
                    reject(response)
                } else {
                    let response = api.apiresponse(false, 200, 'userfound', result)
                    resolve(response)
                }
            })
        })
    }
    let findmerchant = () => {
        return new Promise((resolve, reject) => {
            merchant.findOne({ merchantid: req.headers.merchantid }).exec((err, result) => {
                console.log(result)
                if (err) {
                    logger.error('error while fetching merchant details', 'findmerchant : merchantresetpass()', 10)
                    let response = api.apiresponse(true, 500, 'error while fetching merchant details', null)
                    reject(response)
                } else if (emptyCheck.emptyCheck(result)) {
                    logger.error('error merchnat not found in db', 'findmerchant : merchantresetpass()', 10)
                    let response = api.apiresponse(true, 404, 'error merchnat not found in db', null)
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
            merchant.updateOne({ merchantid: result.merchantid }, { $set: { password: password } }).exec((error, data) => {
                if (error) {
                    logger.error('error while updating password', 'updatepass : merchantresetpass()', 10)
                    let response = api.apiresponse(true, 500, 'error while fetching merchant details', null)
                    reject(response)
                } else if (emptyCheck.emptyCheck(data)) {
                    logger.error('error password can\'t be blank', 'updatepass : merchantresetpass()', 10)
                    let response = api.apiresponse(true, 404, 'error merchnat not found in db', null)
                    reject(response)
                } else {
                    logger.info('password updated', 'updatepass()')
                    resolve(data)
                }
            })
        })
    }
    verifyclaim(req, res).then(findmerchant).then(updatepass).then((resolve) => {

        logger.info('password updated', 'merchantresetpass()')
        let response = api.apiresponse(false, 200, 'password updated successfully', resolve)
        res.send(response)
    }).catch((err) => {
        logger.error('password update failed', 'merchantresetpass()')
        let response = api.apiresponse(false, 404, 'password update failed', err)
        res.send(response)
    })
}

let imageuploadcheck = (req, res) => {
    merchant.updateOne({ mobilenumber: req.body.mobilenumber },
        {
            $set:
            {
                imageuploaded: req.headers.imageuploaded,
                imageurl: req.body.imageurl
            }
        }).exec((error, result) => {
            if (error) {
                logger.error('error at update image', 'imageUploadCheck()', 5)
                let apis = api.apiresponse(true, 500, 'error at update image ', null)
                // send user to signup 
                res.send(apis)
            } else if (emptyCheck.emptyCheck(result)) {
                logger.error('error headers params are empty', 'imageUploadCheck()', 5)
                let apis = api.apiresponse(true, 500, 'error headers params are empty', null)
                // send user to signup 
                res.send(apis)
            }
            else {
                logger.info('headers:- parmas updated', 'imageUploadCheck()')
                let apis = api.apiresponse(false, 200, 'resolvec ', result)
                res.send(apis)


            }
        })
}

module.exports = {
    merchantlogin: merchantlogin,
    merchantresetpass: merchantresetpass,
    imageuploadcheck: imageuploadcheck
}