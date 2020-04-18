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


// get list of registered users 

let userregisterData = (req, res) => {
    signup.find().lean().exec((err, result) => {
        if (err) {
            let response = api.apiresponse(true, 504, "Something went wrong in get user data", null)
            res.send(response)
        } else if (emptyCheck.emptyCheck(result)) {
            let response = api.apiresponse(true, 404, "user deatils can't be fetch from server", null)
            res.send(response)
        }
        else {
            let response = api.apiresponse(false, 200, "received all user deatails", result)
            res.send(response)
        }
    })

}

let userauthdeatils = (req,res)=>{
    
}


module.exports = {
    userregisterData: userregisterData
}