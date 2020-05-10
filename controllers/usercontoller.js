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
const c = require('./../models/Coupongen')
const coupon = mongoose.model('coupons')
const a = require('./../models/UserCoupon')
const userCoupon = mongoose.model('coupondistribution')
const signup = mongoose.model('signupforuser')
const moment = require('moment')

let userMerchantDisplay = (req, res) => {

    let getallmerchants = () => {
        return new Promise((resolve, reject) => {
            merchant.find({ city: req.headers.city }).lean().exec((err, result) => {
                if (err) {
                    logger.error('error while fetching merchant data', 'getallmerchants:userMerchantDisplay()', 10)
                    let response = api.apiresponse(true, 500, 'error while fetching merchant data', null)
                    reject(response)
                } else if (emptyCheck.emptyCheck(result)) {
                    logger.error(`no user found ${req.headers.city}`, 'getallmerchants:userMerchantDisplay()', 10)
                    let response = api.apiresponse(true, 500, `no user found ${req.headers.city}`, null)
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
                    { latitude: Number(userlatitude), longitude: Number(userlongitude) },
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

let userCouponDisribution = (req, res) => {
    let addGeoCode = () => {
        return new Promise((resolve, reject) => {
            coupon.aggregate([
                {
                    $lookup:
                    {
                        from: "signupforusermerchants",
                        localField: "merchantid",
                        foreignField: "merchantid",
                        as: "geocode"
                    }
                },
                {
                    $unwind: "$geocode"
                },
                {
                    $project: {
                        "_id": 0,
                        "createdon": 1,
                        "merchantid": 1,
                        "couponcode": 1,
                        "startdate": 1,
                        "enddate": 1,
                        "discount": 1,
                        "faltdiscountupto": 1,
                        "valid": 1,
                        "category": "$geocode.category",
                        "latitude": "$geocode.latitude",
                        "longitude": "$geocode.longitude"
                    }
                }
            ]).exec((err, result) => {
                // console.log(result)
                if (err) {
                    logger.error('error while fetching merchants with active coupon', 'findAllActiveCoupon:userCouponDisribution()', 5)
                    let response = api.apiresponse(true, 403, 'error while fetching merchants with active coupon', null)
                    reject(response)
                } else if (emptyCheck.emptyCheck(result)) {
                    logger.error('No Merchant found with coupon', 'findAllActiveCoupon:userCouponDisribution()', 1)
                    let response = api.apiresponse(true, 404, 'No Merchant found with coupon', null)
                    reject(response)
                } else {
                    logger.info('coupon fetched', 'getallmerchants:userMerchantDisplay()')
                    // console.log(result)
                    resolve(result)
                }
            })
        })
    }

    let findValidCoupon = (result) => {
        return new Promise((resolve, reject) => {
            let validCoupon = [];
            let nonValidcoupon = [];
            for (let i in result) {
                if (result[i].valid == "1") {
                    validCoupon.push(result[i])
                }
                else {
                    nonValidcoupon.push(result[i])
                }
            }
            if (validCoupon.length != 0) {
                logger.info('merchant > 0 available with valid coupon', 'findAllActiveCoupon:userCouponDisribution()')
                // console.log(validCoupon)
                resolve(validCoupon)
            } else {
                // console.log(nonValidcoupon)
                logger.error('all merchant\'s coupon are valid = 0', 'findValidCoupon:userCouponDisribution()', 1)
                let response = api.apiresponse(true, 404, 'all merchant\'s coupon are valid = 0', nonValidcoupon)
                reject(response)
            }
        })
    }

    let findCouponNeartoUser = (validCoupon) => {
        return new Promise((resolve, reject) => {
            // console.log(validCoupon)
            logger.info('user found', 'finduser:userCouponDisribution()')
            // console.log(resultData)
            // resolve(resultData)
            let listOfAllCouponWithInRangeTwo = [];
            // let listOfAllCouponWithInRangeFive = []
            let userlatitude = "18.995279";
            let userlongitude = "73.116272";
            for (let i in validCoupon) {
                // console.log(validCoupon)
                logger.info('caculating user to coupon distance', 'merchantToUser:userCouponDisribution()')
                let userdistance = (geolib.getDistance(
                    { latitude: Number(userlatitude), longitude: Number(userlongitude) },
                    { latitude: Number(validCoupon[i].latitude), longitude: Number(validCoupon[i].longitude) }
                )) * 0.001
                // console.log(userdistance)
                if (userdistance <= 5) {
                    logger.info('coupon found with in 5KM radius', 'merchantToUser:userCouponDisribution()')
                    listOfAllCouponWithInRangeTwo.push(validCoupon[i])
                }
                //  else if (userdistance <= 5) {
                //     logger.info('coupon found with in 5KM radius', 'merchantToUser:userCouponDisribution()')
                //     listOfAllCouponWithInRangeFive.push(validCoupon[i])
                // }
            }
            if (listOfAllCouponWithInRangeTwo.length != 0) {
                logger.info('coupon found with in 2KM radius -2', 'merchantToUser:userCouponDisribution()')
                // console.log(listOfAllCouponWithInRangeTwo)
                resolve(listOfAllCouponWithInRangeTwo)
            } else {
                logger.error('no coupon found with in 5KM', 'merchantToUser:userCouponDisribution()', 5)
                reject(listOfAllCouponWithInRangeTwo)
            }

            // }
        })

    }

    let sortCouponToUsercategory = (listOfAllCouponWithInRangeTwo) => {
        return new Promise((resolve, reject) => {
            signup.find({ userid: "TidWCS" }).lean().exec((err, resultData) => {
                // console.log(resultData[0].categoryselected:) 
                if (err) {
                    logger.error('error while fetching user with userid', 'finduser:userCouponDisribution()', 5)
                    let response = api.apiresponse(true, 403, 'error while fetching user with userid', null)
                    reject(response)
                } else if (emptyCheck.emptyCheck(resultData)) {
                    logger.error('No user found with userid', 'finduser:userCouponDisribution()', 1)
                    let response = api.apiresponse(true, 404, 'No user found with userid', null)
                    reject(response)
                } else {
                    let category = resultData[0].categoryselected;
                    //sorting the array of merchant coupon depending on user category list priority
                    let sortcategorylist = listOfAllCouponWithInRangeTwo.filter(i => category.includes(i.category))
                    sortcategorylist.sort()
                    resolve([category, sortcategorylist])
                }
            })

        })
    }
    let couponToUser = ([category, sortcategorylist]) => {
        return new Promise((resolve, reject) => {
            // console.log(sortcategorylist)
            let firstuserCoupon = [];
            let userCategory = category;
            let couponSortList = sortcategorylist;
            // sort by priority
            couponSortList.sort(function (c = couponSortList, d = userCategory) {
                for (let i in d) {
                    let Ac = c.category;
                    let Bc = d[i];
                    if (Ac < Bc) {
                        return -1;
                    }
                }
            })
            for (let i in userCategory) {
                let couponDist = couponSortList.find(o => o.category == userCategory[i]);
                if (couponDist != undefined) {
                    firstuserCoupon.push(couponDist)
                    console.log(firstuserCoupon)
                }
            }

            // console.log(couponSortList)
            // for (let i in userCategory) {
            userCoupon.find({ userid: "TidWCS" }).lean().exec((err, data) => {
                console.log(data)
                if (err) {
                    logger.error('error while fetching user with userid and category', 'couponToUser:userCouponDisribution()', 5)
                    let response = api.apiresponse(true, 403, 'error while fetching user with userid and category', null)
                    reject(response)
                } else if (emptyCheck.emptyCheck(data)) {
                    // console.log(data)
                    console.log(emptyCheck.emptyCheck(data))
                    // add header params here
                    let purchasedAmount = 1200;
                    if (( purchasedAmount < 500 && purchasedAmount >= 100)) {
                        console.log("I am here -1")
                        for (let x = firstuserCoupon.length; x > 2; x++) {
                            firstuserCoupon.pop()
                        }
                        for (let x = 0; x < firstuserCoupon.length; x++) {
                            // console.log("I am here")
                            let datetoday = moment().format('DD-MM-YYYY')
                            let b = datetoday.split("-")
                            let zero = "0";
                            let c = (Number(b[0]) + 7).toString()
                            let enddate = `${c.length > 1 ? c : zero.concat(c)}-${b[1]}-${b[2]}`
                            let valid = "1";
                            let firstLot = new userCoupon({
                                userid: "TidWCS",
                                couponcode: firstuserCoupon[x].couponcode,
                                category: firstuserCoupon[x].category,
                                enddate: enddate,
                                valid: valid
                            })
                            firstLot.save((error, couponData) => {
                                if (error) {
                                    logger.error('error while saving coupon data for user', 'couponToUser:userCouponDisribution()', 1)
                                    let response = api.apiresponse(true, 403, 'error while saving coupon data for user', null)
                                    reject(response)
                                } else if (emptyCheck.emptyCheck(couponData)) {
                                    logger.error('error blank data while saving coupon data for user', 'couponToUser:userCouponDisribution()', 1)
                                    let response = api.apiresponse(true, 404, 'error blank data while saving coupon data for user', null)
                                    reject(response)
                                } else {
                                    logger.info('data saved for coupon data', 'couponToUser:userCouponDisribution()')
                                    resolve(couponData)
                                }
                            })
                        }


                        // resolve(firstuserCoupon)
                    }
                    if ( (purchasedAmount < 1000 && purchasedAmount >= 500)) {
                        console.log("I am here - 2")
                        for (let x = firstuserCoupon.length; x > 3; x++) {
                            firstuserCoupon.pop()
                        }
                        for (let x = 0; x < firstuserCoupon.length; x++) {
                            // console.log("I am here")
                            let datetoday = moment().format('DD-MM-YYYY')
                            let b = datetoday.split("-")
                            let zero = "0";
                            let c = (Number(b[0]) + 7).toString()
                            let enddate = `${c.length > 1 ? c : zero.concat(c)}-${b[1]}-${b[2]}`
                            let valid = "1";
                            let firstLot = new userCoupon({
                                userid: "TidWCS",
                                couponcode: firstuserCoupon[x].couponcode,
                                category: firstuserCoupon[x].category,
                                enddate: enddate,
                                valid: valid
                            })
                            firstLot.save((error, couponData) => {
                                if (error) {
                                    logger.error('error while saving coupon data for user', 'couponToUser:userCouponDisribution()', 1)
                                    let response = api.apiresponse(true, 403, 'error while saving coupon data for user', null)
                                    reject(response)
                                } else if (emptyCheck.emptyCheck(couponData)) {
                                    logger.error('error blank data while saving coupon data for user', 'couponToUser:userCouponDisribution()', 1)
                                    let response = api.apiresponse(true, 404, 'error blank data while saving coupon data for user', null)
                                    reject(response)
                                } else {
                                    logger.info('data saved for coupon data', 'couponToUser:userCouponDisribution()')
                                    resolve(couponData)
                                }
                            })
                        }


                        // resolve(firstuserCoupon)
                    }
                    if (( purchasedAmount < 2000 && purchasedAmount >= 1000)) {
                        console.log("I am here - 3")
                        for (let x = firstuserCoupon.length; x > 4; x++) {
                            firstuserCoupon.pop()
                        }
                        for (let x = 0; x < firstuserCoupon.length; x++) {
                            // console.log("I am here")
                            let datetoday = moment().format('DD-MM-YYYY')
                            let b = datetoday.split("-")
                            let zero = "0";
                            let c = (Number(b[0]) + 7).toString()
                            let enddate = `${c.length > 1 ? c : zero.concat(c)}-${b[1]}-${b[2]}`
                            let valid = "1";
                            let firstLot = new userCoupon({
                                userid: "TidWCS",
                                couponcode: firstuserCoupon[x].couponcode,
                                category: firstuserCoupon[x].category,
                                enddate: enddate,
                                valid: valid
                            })
                            firstLot.save((error, couponData) => {
                                if (error) {
                                    logger.error('error while saving coupon data for user', 'couponToUser:userCouponDisribution()', 1)
                                    let response = api.apiresponse(true, 403, 'error while saving coupon data for user', null)
                                    reject(response)
                                } else if (emptyCheck.emptyCheck(couponData)) {
                                    logger.error('error blank data while saving coupon data for user', 'couponToUser:userCouponDisribution()', 1)
                                    let response = api.apiresponse(true, 404, 'error blank data while saving coupon data for user', null)
                                    reject(response)
                                } else {
                                    logger.info('data saved for coupon data', 'couponToUser:userCouponDisribution()')
                                    resolve(couponData)
                                }
                            })
                        }


                        // resolve(firstuserCoupon)
                    }
                    if (purchasedAmount >= 2000) {
                        console.log("I am here - 4")
                        for (let x = firstuserCoupon.length; x > 5; x++) {
                            firstuserCoupon.pop()
                        }
                        for (let x = 0; x < firstuserCoupon.length; x++) {
                            // console.log("I am here")
                            let datetoday = moment().format('DD-MM-YYYY')
                            let b = datetoday.split("-")
                            let zero = "0";
                            let c = (Number(b[0]) + 7).toString()
                            let enddate = `${c.length > 1 ? c : zero.concat(c)}-${b[1]}-${b[2]}`
                            let valid = "1";
                            let firstLot = new userCoupon({
                                userid: "TidWCS",
                                couponcode: firstuserCoupon[x].couponcode,
                                category: firstuserCoupon[x].category,
                                enddate: enddate,
                                valid: valid
                            })
                            firstLot.save((error, couponData) => {
                                if (error) {
                                    logger.error('error while saving coupon data for user', 'couponToUser:userCouponDisribution()', 1)
                                    let response = api.apiresponse(true, 403, 'error while saving coupon data for user', null)
                                    reject(response)
                                } else if (emptyCheck.emptyCheck(couponData)) {
                                    logger.error('error blank data while saving coupon data for user', 'couponToUser:userCouponDisribution()', 1)
                                    let response = api.apiresponse(true, 404, 'error blank data while saving coupon data for user', null)
                                    reject(response)
                                } else {
                                    logger.info('data saved for coupon data', 'couponToUser:userCouponDisribution()')
                                    resolve(couponData)
                                }
                            })
                        }


                        // resolve(firstuserCoupon)
                    }
                }
                // start from here else
            })
            // }

        })
    }






    addGeoCode(req, res).then(findValidCoupon).then(findCouponNeartoUser).then(sortCouponToUsercategory).then(couponToUser).then((resolve) => {
        logger.info('merchant available with valid coupon', 'findAllActiveCoupon:userCouponDisribution()')
        let response = api.apiresponse(false, 200, 'merchant available with valid coupon', resolve)
        res.send(response)
    }).catch((err) => {
        logger.error('no merchant available with valid coupon', 'findAllActiveCoupon:userCouponDisribution()', 10)
        let response = api.apiresponse(true, 500, 'no merchant available with valid coupon', null)
        res.send(response)
    })
}










module.exports = {
    userMerchantDisplay: userMerchantDisplay,
    userCouponDisribution: userCouponDisribution
}