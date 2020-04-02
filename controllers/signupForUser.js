const express = require('express')
const app = express()
// to genearte userId
const randomize = require('randomatic')
// adding schema
const model = require('./../models/Signup')
const mongoose = require('mongoose')
const signup = mongoose.model('signupforuser')
// adding email and password check lib
const check = require('./../libs/regex')
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



// check for user email with "@ and ." mobile number to be 10 digit and password criteria minimum 6 digit 
let userData = (req, res) => {
    // basic check
    let firstCheckEmail = () => {
        return new Promise((resolve, reject) => {
            let regex = /^[a-zA-z]+\W?\w+\W+[a-z]+\W+\w+/
            console.log(req.body.email)
            if ((req.body.email).match(regex)) {
                let response = api.apiresponse(false, 200, "Email passed the check", null)
                console.log(req.body.email)
                resolve(response)
            } else {
                let response = api.apiresponse(true, 500, 'something went wrong', null)
                reject(response)
            }
        })
    }

    // check for password 
    let passcheck = () => {
        return new Promise((resolve,reject)=>{
            let regex = /^[a-zA-Z]+\d+/
            let pass = req.body.password;
            console.log(pass)
            if (pass.match(regex) && (pass.length >= 6)) {
                console.log(pass)
                let response = api.apiresponse(false, 200, "password passed the check", null)
                resolve(response)
            } else {
                let response = api.apiresponse(true, 500, 'something went wrong', null)
                reject(response)
            }
    
        })
    }
        
    //mobile no check for 10 digit
    let mobilenoCheck = () => {
        return new Promise((resolve, reject) => {
            let regex = /^[0-9]{10}/
            let mobile = req.body.mobileNumber
            console.log(mobile)
            if (mobile.match(regex)) {
                let response = api.apiresponse(false, 200, "mobileno passed the check", null)
                console.log(mobile)
                resolve(response)
            } else {
                let response = api.apiresponse(true, 500, 'something went wrong', null)
                reject(response)
            }
        })
    }

    // save data
    let savedata = () => {
        return new Promise((resolve, reject) => {
            signup.findOne({ email: req.body.email}).exec((err, data) => {
                if (err) {
                    let response = api.apiresponse(true, 500, 'something went wrong', null)
                    reject(response)
                } else if (emptyCheck.emptyCheck(data)) {
                    console.log(data)
                    let userId = randomize('Aa0', 6)
                    let valid = "1";
                    let userinfo = new signup({
                        userId: userId,
                        fullName: (req.body.fullName).toLowerCase(),
                        mobileNumber: req.body.mobileNumber,
                        password: passencry.passhash(req.body.password),
                        email: (req.body.email).toLowerCase(),
                        city: req.body.city,
                        zipcode: req.body.zipcode,
                        gender: req.body.gender,
                        valid: valid,
                        dob: req.body.dob,
                        createdon: Date.now()
                    })
                    userinfo.save((err, result) => {
                        if (err) {
                            let response = api.apiresponse(true, 500, 'failed to create a new user', null)
                            reject(response)
                        } else if (emptyCheck.emptyCheck(result)) {
                            let response = api.apiresponse(true, 404, 'blank data received', null)
                            reject(response)
                        } else {
                        
                            resolve(result)

                        }
                    })
                } else {
                    let response = api.apiresponse(true, 500, 'user already exist', err)
                    reject(response)
                }
            })





        })

    }

    firstCheckEmail(req, res).then(passcheck).then(mobilenoCheck).then(savedata).then((resolve) => {
        // eventemiter.emit('welcomemail', resolve.email)
        let response = api.apiresponse(false, "200", 'user registered', resolve)
        res.send(response)
    }).catch((err) => {
        console.log("errorhandler");
        console.log(err);
        res.status(err.status)
        res.send(err)
    })

}

module.exports = {
    userData: userData
}