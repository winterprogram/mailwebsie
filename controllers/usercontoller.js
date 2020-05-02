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
const distance = require('google-distance-matrix');
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
                    //  console.log(resultobject)
                    resolve(resultobject)
                }

            })
        })
    }

    let calculateDistance = (resultobject) => {
        return new Promise((resolve, reject) => {
            let userlatitude = req.headers.userlatitude;
            let userlongitude = req.headers.userlongitude;
            let listofmerchant = [];
            for (let i = 0; i < resultobject.length; i++) {
                // destinations.push(resultobject[i].latitude, resultobject[i].longitude)
                logger.info('pusing done for destination stage -1', 'calculateDistance:userMerchantDisplay()')
                let userdistance = (geolib.getDistance(
                    { latitude: Number(userlatitude), longitude: Number(userlongitude)},
                    { latitude: Number(resultobject[i].latitude), longitude: Number(resultobject[i].longitude) }
                )) * 0.001
                console.log(userdistance)
                if (userdistance <= 15) {
                    console.log(resultobject[i])
                    logger.info('merchant destination is less than 15 Km', 'calculateDistance:userMerchantDisplay()')
                    listofmerchant.push(resultobject[i])
                } else {
                    logger.error('merchant is far >15 Km', 'calculateDistance:userMerchantDisplay()', 10)
                }
            }
            // console.log(listofmerchant)
            if (emptyCheck.emptyCheck(listofmerchant)) {
                logger.error('merchant is far >15 Km', 'calculateDistance:userMerchantDisplay()', 10)
                reject(listofmerchant)

            } else {
                resolve(listofmerchant)
            }
        })

    }
    getallmerchants(req, res).then(calculateDistance).then((resolve) => {
        logger.info('user fetched', 'getallmerchants:userMerchantDisplay()')
        let response = api.apiresponse(false, 200, 'user fetched', resolve)
        res.send(response)
    }).catch((err) => {
        logger.error('no user found', 'getallmerchants:userMerchantDisplay()', 10)
        let response = api.apiresponse(true, 500, 'no merchant found near your location', null)
        res.send(response)

    })

}

module.exports = {
    userMerchantDisplay: userMerchantDisplay
}