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
// adding node mailer
const email = require('./../events/mailsender')
// events
const event = require('events')
const eventemiter = new event.EventEmitter();


let userlogin = (req, res) => {

    let mobileDigitCheck = () => {
        return new Promise((resolve, reject) => {
            if (emptyCheck.emptyCheck(req.body.mobileNumber)) {
                let api = api.apiresponse(true, 'mobilenumber can\'t be empty', 400, null)
                reject(api)
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
                    let api = api.apiresponse(true, 'error at last stage ', 500, null)
                    // send user to signup 
                    reject(api)
                } else if (data) {
                    //  console.log(data[0].password)
                    passencry.passcheck(req.body.password, data[0].password, ((error, result) => {
                        if (error) {
                            let api = api.apiresponse(true, 'password didn\'t match / wrong password', 404, null)
                            reject(api)
                        } else {
                            let apis = api.apiresponse(false, 'password  match', 200, data)
                            resolve(apis)
                        }
                    }))
                } else {
                    let api = api.apiresponse(true, 'mobienumber doesn\'t exist please login ', 500, null)
                    // send user to signup 
                    reject(api)
                }
            })

        }
        )
    }
    mobileDigitCheck(req, res).then(userLoginFinal).then((resolve) => {
        // console.log(resolve.data[0])
        resolve = resolve.data[0]
        resolve._id = undefined
        resolve.password = undefined
        resolve.createdon = undefined
        resolve.__v = undefined
        resolve.dob = undefined
        resolve.mobileNumber = undefined
        resolve.email = undefined
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