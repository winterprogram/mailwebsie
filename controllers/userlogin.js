const express = require('express')
const app = express()
// to genearte userId
const randomize = require('randomatic')
// adding schema
const model = require('./../models/Signup')
const mongoose = require('mongoose')
const signup = mongoose.model('signupforuser')
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

let userlogin = (req, res) => {

    let mobileDigitCheck = () => {
        return new Promise((resolve, reject) => {
            if (emptyCheck.emptyCheck(req.body.mobileNumber)) {
                let apis = api.apiresponse(true, 'mobilenumber can\'t be empty', 400, null)
                reject(apis)
            } else {
                let regex = /^[0-9]{10}/
                let mobile = req.body.mobileNumber
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
            signup.find({ mobileNumber: req.body.mobileNumber }).exec((err, data) => {
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
                    //  console.log(data[0].password)
                    passencry.passcheck(req.body.password, data[0].password, ((error, result) => {
                        if (error) {
                            let apis = api.apiresponse(true, 'password didn\'t match / wrong password', 404, null)
                            reject(apis)
                        } else if ((data[0].valid == 0)) {
                            let apis = api.apiresponse(true, 'User doesn\'t have rights to access', 503, null)
                            reject(apis)
                        }
                        else {
                            let apis = api.apiresponse(false, 'password  match', 200, data)
                            resolve(apis)
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
                    let response = api.apiresponse(true, 'Error while generating Jwt token stage', 500, null)
                    reject(response)
                } else if (emptyCheck.emptyCheck(result)) {
                    let response = api.apiresponse(true, 'data while generating jwt is vacant', 404, null)
                    reject(response)
                } else {
                    result.userid = userData.userid
                    result.userData = userData.data[0]
                    // console.log(result)
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
        // resolve.mobileNumber = undefined
        // resolve.email = undefined
        resolve.userData.city = undefined
        
        let apis = api.apiresponse(false, 'successful login', 200, resolve)
        res.send(apis)
    }).catch((err) => {
        console.log(err)
        res.send(err)
    })

}

module.exports = {
    userlogin: userlogin
}