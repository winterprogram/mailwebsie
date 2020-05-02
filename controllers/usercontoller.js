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
            // let origins = req.headers.userlocation;
            let origins = ['40.7421,-73.9914']
            let destinations = [];
            for (let i = 0; i < resultobject.length; i++) {
                destinations.push(resultobject[i].latitude, resultobject[i].longitude)
            }
            console.log(destinations)
            distance.key('AIzaSyD4hyiaqk7NwtO04lEliHoMvS1Y2uNpskE');
            distance.units('imperial');
            distance.matrix(origins, destinations, function (err, distance) {
                 console.log(distance.status)
                if (err) {
                    console.log(err)
                    logger.error('error while calculating distance', 'calculateDistance:userMerchantDisplay()', 10)
                    let response = api.apiresponse(true, 500, 'error while calculating distance', null)
                    reject(response)
                } else if (!distance) {
                    console.log(distance)
                    console.log('no distances');
                    logger.error('error no distances', 'calculateDistance:userMerchantDisplay()', 10)
                    let response = api.apiresponse(true, 404, 'no distances', null)
                    reject(response)
                } else if (distance.status == 'OK') {
                    console.log(distance.status)
                    for (var i = 0; i < origins.length; i++) {
                        for (var j = 0; j < destinations.length; j++) {
                            var origin = distances.origin_addresses[i];
                            var destination = distances.destination_addresses[j];
                            if (distances.rows[0].elements[j].status == 'OK') {
                                var distance = distances.rows[i].elements[j].distance.text;
                                (console.log('Distance from ' + origin + ' to ' + destination + ' is ' + distance));
                                resolve(distance)
                            } else {
                                (console.log(destination + ' is not reachable by land from ' + origin));
                                reject(origin)
                            }
                        }
                    }
                }
            })
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