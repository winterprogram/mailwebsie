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
const geolib = require('geolib');

let userMerchantDisplay = (req, res) => {

    let getallmerchants = () => {
        return new Promise((resolve, reject) => {
            merchant.find({}).lean().exec((err, result) => {
                if (err) {
                    logger.error('error while fetching merchant data', 'getallmerchants:userMerchantDisplay()', 10)
                    let response = api.apiresponse(true, 500, 'error while fetching merchant data', null)
                    reject(response)
                } else if (emptyCheck.emptyCheck(result)) {
                    logger.error('no user found', 'getallmerchants:userMerchantDisplay()', 10)
                    let response = api.apiresponse(true, 500, 'no user found', null)
                    reject(response)
                } else {
                    logger.info('user fetched', 'getallmerchants:userMerchantDisplay()')
                    let resultobject = Object(result)
                    // console.log(resultobject)
                    resolve(resultobject)
                }

            })
        })
    }

    let calculateDistance = (resultobject) => {
        return new Promise((resolve, reject) => {
            let userdistance = req.headers.useruserdistance
            for (let i = 0; i < resultobject.length; i++) {    
                geolib.getDistance(userdistance, {
                    latitude: resultobject[i].latitude,
                    longitude: resultobject[i].longitude,
                })
            } 
            resolve()
        })
       
    }
    getallmerchants(req, res).then(calculateDistance).then((resolve) => {
        logger.info('user fetched', 'getallmerchants:userMerchantDisplay()')
        let response = api.apiresponse(false, 200, 'no user found', resolve)
        res.send(response)
    }).catch((err) => {
        logger.error('no user found', 'getallmerchants:userMerchantDisplay()', 10)
        let response = api.apiresponse(true, 500, 'no user found', err)
        res.send(response)

    })

}

module.exports = {
    userMerchantDisplay: userMerchantDisplay
}