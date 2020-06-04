const express = require('express')
const app = express()
// to genearte userId
const randomize = require('randomatic')
// adding schema
const model = require('./../models/Signup')
const mongoose = require('mongoose')
const signup = mongoose.model('signupforuser')
const modelauth = require('./../models/Userauthtoken')
const tokenuser = mongoose.model('usertoken')
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

let userlogin = (req, res) => {
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
            signup.find({ mobilenumber: req.body.mobilenumber }).exec((err, data) => {
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
                    // console.log(data)
                    //  console.log(data[0].password)
                    passencry.passcheck(req.body.password, data[0].password, ((error, result) => {
                        if (error) {
                            let apis = api.apiresponse(true, 404, 'password didn\'t match / wrong password', null)
                            reject(apis)
                        } else if ((data[0].valid == 0)) {
                            let apis = api.apiresponse(true, 503, 'User doesn\'t have rights to access', null)
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


    let jwtTokengen = (userData) => {
        return new Promise((resolve, reject) => {
            jwt.generateToken(userData, ((err, result) => {
                if (err) {
                    let response = api.apiresponse(true, 500, 'Error while generating Jwt token stage', null)
                    reject(response)
                } else if (emptyCheck.emptyCheck(result)) {
                    let response = api.apiresponse(true, 404, 'data while generating jwt is vacant', null)
                    reject(response)
                } else {
                    result.userid = userData.data[0].userid
                    result.userData = userData.data[0]
                    // console.log(result)
                    let token = new tokenuser({
                        userid: result.userid,
                        authtoken: result.token,
                        secreatekey: result.tokensecreate,
                        // userinfo: (result.userData),
                        devicetoken: req.body.devicetoken,
                        createdon: Date.now()
                    })
                    token.save((error, authtokendetails) => {
                        if (error) {
                            let response = api.apiresponse(true, 500, 'Error while storing Jwt token stage -2', error)
                            reject(response)
                        } else if ((emptyCheck.emptyCheck(authtokendetails))) {
                            let response = api.apiresponse(true, 404, 'Error while storing Jwt token empty data', null)
                            reject(response)
                        } else {
                            // let auth = authtokendetails.toObject()
                            // console.log(authtokendetails)
                            let a = api.apiresponse(true, 403, 'user token stored successfully(1st login)', authtokendetails)
                            resolve(a)
                        }
                    })

                    resolve(result)

                }
            }))
        })

    }



    mobileDigitCheck(req, res).then(userLoginFinal).then(jwtTokengen).then((resolve) => {
        console.log(resolve.userData)
        // resolve.userData
        resolve.userData._id = undefined
        resolve.userData.password = undefined
        resolve.userData.createdon = undefined
        resolve.userData.__v = undefined
        resolve.userData.dob = undefined
        // resolve.mobilenumber = undefined
        // resolve.email = undefined
        resolve.userData.city = undefined

        let apis = api.apiresponse(false, 200, 'successful login', resolve)
        res.send(apis)
    }).catch((err) => {
        console.log(err)
        res.send(err)
    })

}

module.exports = {
    userlogin: userlogin
}