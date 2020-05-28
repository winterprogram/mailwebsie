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
                //console.log(userdistance)
                if (userdistance <= 15) {
                    // console.log(resultobject[i])
                    logger.info('merchant destination is less than 15 Km', 'calculateDistance:userMerchantDisplay()')
                    listofmerchant.push(resultobject[i])
                } else {
                    logger.error('merchant is far >15 Km', 'calculateDistance:userMerchantDisplay()', 10)
                }
            }
            // console.log(listofmerchant)
            if (emptyCheck.emptyCheck(listofmerchant)) {
                logger.error('merchant is far >15 Km', 'calculateDistance:userMerchantDisplay()', 10)
                let response = api.apiresponse(true, 404, 'merchant is far >15 Km', null)
                reject(response)

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
                        "longitude": "$geocode.longitude",
                        "merchantname": "$geocode.shopname"
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
            let userlatitude = req.headers.userlatitude;
            let userlongitude = req.headers.userlongitude;
            //console.log(typeof(userlatitude));
            for (let i in validCoupon) {
                // console.log(validCoupon[i])
                //console.log(validCoupon[i].latitude);
                //console.log(typeof(validCoupon[i].latitude));
                logger.info('caculating user to coupon distance', 'merchantToUser:userCouponDisribution()')
                //console.log('user'+userlatitude);
                let userdistance = (geolib.getDistance(
                    { latitude: Number(userlatitude), longitude: Number(userlongitude) },
                    { latitude: Number(validCoupon[i].latitude), longitude: Number(validCoupon[i].longitude) }
                )) * 0.001
                //console.log('userdistance'+userdistance)
                if (userdistance <= 5) {
                    //console.log(validCoupon[i])
                    logger.info('coupon found with in 5KM radius', 'merchantToUser:userCouponDisribution()')
                    listOfAllCouponWithInRangeTwo.push(validCoupon[i])
                }
                //  else if (userdistance <= 5) {
                //     logger.info('coupon found with in 5KM radius', 'merchantToUser:userCouponDisribution()')
                //     listOfAllCouponWithInRangeFive.push(validCoupon[i])
                // }
            }
            if (listOfAllCouponWithInRangeTwo.length > 0) {
                logger.info('coupon found with in 2KM radius -2', 'merchantToUser:userCouponDisribution()')
                // console.log(listOfAllCouponWithInRangeTwo)
                resolve(listOfAllCouponWithInRangeTwo)
            } else {
                logger.error('no coupon found with in 5KM', 'merchantToUser:userCouponDisribution()', 5)
                let response = api.apiresponse(true, 404, 'no coupon found with in 5KM', null)
                reject(response)
            }

            // }
        })

    }

    let sortCouponToUsercategory = (listOfAllCouponWithInRangeTwo) => {
        return new Promise((resolve, reject) => {
            signup.find({ userid: req.headers.userid }).lean().exec((err, resultData) => {
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
                    // let sortcategorylist = listOfAllCouponWithInRangeTwo.filter(i => category.includes(i.category))
                    // sortcategorylist.sort()
                    let iceCreamList = []
                    let cafeFastFood = [];
                    let beautySalonSpa = [];
                    let restaurantBar = [];
                    let boutiques = [];
                    //console.log(category)
                    // for (let x in category) {
                    // listOfAllCouponWithInRangeTwo.filter(i => i.category.indexOf(category[x]) == -1);
                    search(listOfAllCouponWithInRangeTwo)
                    //console.log(listOfAllCouponWithInRangeTwo)
                    // }
                    // search category selected by user and seperate
                    function search(myArray) {
                        //console.log(myArray)
                        for (var i = 0; i < myArray.length; i++) {
                            if (myArray[i].category == "Ice-Cream Parlour") {
                                iceCreamList.push(myArray[i])
                                // return myArray[i];
                            } else if (myArray[i].category == "Cafe/Fast Food") {
                                cafeFastFood.push(myArray[i])
                            } else if (myArray[i].category == "Beauty Salon/Spa") {
                                beautySalonSpa.push(myArray[i])
                            } else if (myArray[i].category == "Restaurant/Bar") {
                                restaurantBar.push(myArray[i])
                            } else if (myArray[i].category == "Boutiques") {
                                boutiques.push(myArray[i])
                            }
                        }
                    }
                    //console.log(beautySalonSpa)
                    resolve([category, iceCreamList, cafeFastFood, beautySalonSpa, restaurantBar, boutiques])
                }
            })

        })
    }
    let couponToUser = ([category, iceCreamList, cafeFastFood, beautySalonSpa, restaurantBar, boutiques]) => {
        return new Promise((resolve, reject) => {

            let userCategory = category;
            let couponSortList = [];
            //console.log(beautySalonSpa)

            // pick random element from array of objects of coupon
            if (iceCreamList.length > 0) {
                couponSortList.push(iceCreamList[Math.floor(Math.random() * iceCreamList.length)])
            }

            if (cafeFastFood.length > 0) {
                couponSortList.push(cafeFastFood[Math.floor(Math.random() * cafeFastFood.length)])
            }
            if (beautySalonSpa.length > 0) {
                couponSortList.push(beautySalonSpa[Math.floor(Math.random() * beautySalonSpa.length)])
            }

            if (restaurantBar.length > 0) {
                couponSortList.push(restaurantBar[Math.floor(Math.random() * restaurantBar.length)])
            }

            if (boutiques.length > 0) {
                couponSortList.push(boutiques[Math.floor(Math.random() * boutiques.length)])
            }

            console.log(couponSortList)
            // sort by priority/*  */

            let sortcategorylist = couponSortList.filter(i => category.includes(i.category))
            let firstuserCoupon = sortcategorylist
            console.log("After sorting")
            userCoupon.find({ userid: req.headers.userid }).lean().exec((err, data) => {
                // console.log(data)
                if (err) {
                    logger.error('error while fetching user with userid and category', 'couponToUser:userCouponDisribution()', 5)
                    let response = api.apiresponse(true, 403, 'error while fetching user with userid and category', null)
                    reject(response)
                } else if (emptyCheck.emptyCheck(data)) {



                    // add header params here
                    let purchasedAmount = parseInt(req.headers.amount_paid);

                    if (purchasedAmount < 100) {
                        console.log('I\'am not here')
                        logger.error('user is not eligible for coupon', 'couponToUser:userCouponDisribution()', 5)
                        let response = api.apiresponse(true, 503, 'user is not eligible for coupon', null)
                        reject(response)
                    }
                    if ((purchasedAmount < 500 && purchasedAmount >= 100)) {
                        console.log("I am here -1")

                        for (let x = firstuserCoupon.length; x > 2; x--) {
                            console.log(firstuserCoupon.length)
                            firstuserCoupon.pop()
                        }

                        for (let x = 0; x < firstuserCoupon.length; x++) {
                            console.log("I am here - 1")
                            let datetoday = moment().format('DD-MM-YYYY')
                            let b = datetoday.split("-")
                            let zero = "0";
                            let c = (Number(b[0]) + 7).toString()
                            let enddate = `${c.length > 1 ? c : zero.concat(c)}-${b[1]}-${b[2]}`
                            let valid = "1";
                            let firstLot = new userCoupon({
                                userid: req.headers.userid,
                                couponcode: firstuserCoupon[x].couponcode,
                                category: firstuserCoupon[x].category,
                                merchantid: firstuserCoupon[x].merchantid,
                                discount: firstuserCoupon[x].discount,
                                faltdiscountupto: firstuserCoupon[x].faltdiscountupto,
                                merchantname: firstuserCoupon[x].merchantname,
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
                    }
                    if ((purchasedAmount < 1000 && purchasedAmount >= 500)) {
                        console.log("I am here - 2")
                        for (let x = firstuserCoupon.length; x > 3; x--) {
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
                                userid: req.headers.userid,
                                couponcode: firstuserCoupon[x].couponcode,
                                category: firstuserCoupon[x].category,
                                merchantid: firstuserCoupon[x].merchantid,
                                discount: firstuserCoupon[x].discount,
                                faltdiscountupto: firstuserCoupon[x].faltdiscountupto,
                                merchantname: firstuserCoupon[x].merchantname,
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
                    }
                    if ((purchasedAmount < 2000 && purchasedAmount >= 1000)) {
                        console.log("I am here - 3")
                        for (let x = firstuserCoupon.length; x > 4; x--) {
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
                                userid: req.headers.userid,
                                couponcode: firstuserCoupon[x].couponcode,
                                category: firstuserCoupon[x].category,
                                merchantid: firstuserCoupon[x].merchantid,
                                discount: firstuserCoupon[x].discount,
                                faltdiscountupto: firstuserCoupon[x].faltdiscountupto,
                                merchantname: firstuserCoupon[x].merchantname,
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
                    }
                    if (purchasedAmount >= 2000) {
                        console.log(firstuserCoupon)
                        console.log("I am here - 4")
                        for (let x = firstuserCoupon.length; x > 5; x--) {
                            // let item = firstuserCoupon[Math.floor(Math.random() * firstuserCoupon.length)];
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
                                userid: req.headers.userid,
                                couponcode: firstuserCoupon[x].couponcode,
                                category: firstuserCoupon[x].category,
                                merchantid: firstuserCoupon[x].merchantid,
                                discount: firstuserCoupon[x].discount,
                                faltdiscountupto: firstuserCoupon[x].faltdiscountupto,
                                merchantname: firstuserCoupon[x].merchantname,
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
                    }
                } else {
                    let purchasedAmount = parseInt(req.headers.amount_paid);


                    if (purchasedAmount < 100) {
                        console.log('I\'am not here')
                        logger.error('user is not eligible for coupon', 'couponToUser:userCouponDisribution()', 5)
                        let response = api.apiresponse(true, 503, 'user is not eligible for coupon', null)
                        reject(response)
                    }
                    if ((purchasedAmount < 500 && purchasedAmount >= 100)) {
                        console.log("I am here -1")

                        for (let x = firstuserCoupon.length; x > 2; x--) {
                            console.log(firstuserCoupon.length)
                            firstuserCoupon.pop()
                        }

                        for (let x = 0; x < firstuserCoupon.length; x++) {
                            console.log("I am here - 1")
                            let datetoday = moment().format('DD-MM-YYYY')
                            let b = datetoday.split("-")
                            let zero = "0";
                            let c = (Number(b[0]) + 7).toString()
                            let enddate = `${c.length > 1 ? c : zero.concat(c)}-${b[1]}-${b[2]}`
                            let valid = "1";
                            let firstLot = new userCoupon({
                                userid: req.headers.userid,
                                couponcode: firstuserCoupon[x].couponcode,
                                category: firstuserCoupon[x].category,
                                merchantid: firstuserCoupon[x].merchantid,
                                discount: firstuserCoupon[x].discount,
                                faltdiscountupto: firstuserCoupon[x].faltdiscountupto,
                                merchantname: firstuserCoupon[x].merchantname,
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
                    }
                    if ((purchasedAmount < 1000 && purchasedAmount >= 500)) {
                        console.log("I am here - 2")
                        for (let x = firstuserCoupon.length; x > 3; x--) {
                            firstuserCoupon.pop()
                        }
                        for (let x = 0; x < firstuserCoupon.length; x++) {
                            let datetoday = moment().format('DD-MM-YYYY')
                            let b = datetoday.split("-")
                            let zero = "0";
                            let c = (Number(b[0]) + 7).toString()
                            let enddate = `${c.length > 1 ? c : zero.concat(c)}-${b[1]}-${b[2]}`
                            let valid = "1";
                            let firstLot = new userCoupon({
                                userid: req.headers.userid,
                                couponcode: firstuserCoupon[x].couponcode,
                                category: firstuserCoupon[x].category,
                                merchantid: firstuserCoupon[x].merchantid,
                                discount: firstuserCoupon[x].discount,
                                faltdiscountupto: firstuserCoupon[x].faltdiscountupto,
                                merchantname: firstuserCoupon[x].merchantname,
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
                    if ((purchasedAmount < 2000 && purchasedAmount >= 1000)) {
                        console.log("I am here - 3")
                        for (let x = firstuserCoupon.length; x > 4; x--) {
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
                                userid: req.headers.userid,
                                couponcode: firstuserCoupon[x].couponcode,
                                category: firstuserCoupon[x].category,
                                merchantid: firstuserCoupon[x].merchantid,
                                discount: firstuserCoupon[x].discount,
                                faltdiscountupto: firstuserCoupon[x].faltdiscountupto,
                                merchantname: firstuserCoupon[x].merchantname,
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
                        for (let x = firstuserCoupon.length; x > 5; x--) {
                            firstuserCoupon.pop()
                        }
                        for (let x = 0; x < firstuserCoupon.length; x++) {
                            //console.log("I am here")
                            let datetoday = moment().format('DD-MM-YYYY')
                            let b = datetoday.split("-")
                            let zero = "0";
                            let c = (Number(b[0]) + 7).toString()
                            let enddate = `${c.length > 1 ? c : zero.concat(c)}-${b[1]}-${b[2]}`
                            let valid = "1";
                            let firstLot = new userCoupon({
                                userid: req.headers.userid,
                                couponcode: firstuserCoupon[x].couponcode,
                                category: firstuserCoupon[x].category,
                                merchantid: firstuserCoupon[x].merchantid,
                                discount: firstuserCoupon[x].discount,
                                faltdiscountupto: firstuserCoupon[x].faltdiscountupto,
                                merchantname: firstuserCoupon[x].merchantname,
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
                    }
                }
            })
        })
    }

    addGeoCode(req, res).then(findValidCoupon).then(findCouponNeartoUser).then(sortCouponToUsercategory).then(couponToUser).then((resolve) => {
        logger.info('coupon distributed to user successfully ', 'userCouponDisribution()')
        let response = api.apiresponse(false, 200, 'coupon distributed to user successfully ', resolve)
        res.send(response)
    }).catch((err) => {
        logger.error('no merchant available with valid coupon', 'userCouponDisribution()', 10)
        // console.log('a' + err)
        res.send(err)
    })
}

let getAllCouponForUser = (req, res) => {
    let userCouponDetail = () => {
        return new Promise((resolve, reject) => {
            userCoupon.find({ userid: req.headers.userid }).lean().exec((err, result) => {
                if (err) {
                    logger.error('error fetching coupon for user', 'userCouponDetail:getAllCouponForUser()', 5)
                    let response = api.apiresponse(true, 403, 'error fetching coupon for user', null)
                    reject(response)
                } else if (emptyCheck.emptyCheck(result)) {
                    logger.error('error blank data while fetching coupon for user', 'userCouponDetail:getAllCouponForUser()', 1)
                    let response = api.apiresponse(true, 404, 'error blank data while fetching coupon for user', null)
                    reject(response)
                } else {
                    logger.info('coupon for user fetched', 'userCouponDetail:getAllCouponForUser()')
                    let response = api.apiresponse(false, 200, 'coupon for user fetched', result)
                    resolve(response)
                }
            })
        })
    }
    userCouponDetail(req, res).then((resolve) => {
        logger.info('coupon for user fetched', 'userCouponDetail:getAllCouponForUser()')
        res.send(resolve)
    }).catch((err) => {
        logger.error('error blank data while fetching coupon for user', 'userCouponDetail:getAllCouponForUser()', 1)
        res.send(err)
    })

}


let couponSectionDuringCheckout = (req, res) => {
    let findUserAndMerchantTogether = () => {
        return new Promise((resolve, reject) => {
            userCoupon.find({ $and: [{ userid: req.headers.userid }, { merchantid: req.headers.merchantid }, { valid: "1" }] }).lean().exec((err, result) => {
                if (err) {
                    logger.error('error fetching coupon for user', 'userCouponDetail:getAllCouponForUser()', 5)
                    let response = api.apiresponse(true, 403, 'error fetching coupon for user', null)
                    reject(response)
                } else if (emptyCheck.emptyCheck(result)) {
                    logger.error('error blank data while fetching coupon for user', 'userCouponDetail:getAllCouponForUser()', 1)
                    let response = api.apiresponse(true, 404, 'error blank data while fetching coupon for user', null)
                    reject(response)
                } else {
                    logger.info('coupon for user fetched', 'userCouponDetail:getAllCouponForUser()')
                    let response = api.apiresponse(false, 200, 'coupon for user fetched', result)
                    resolve(response)
                }
            })
        })
    }
    findUserAndMerchantTogether(req, res).then((resolve) => {
        logger.info('coupon for user fetched', 'userCouponDetail:getAllCouponForUser()')
        res.send(resolve)
    }).catch((err) => {
        logger.error('error blank data while fetching coupon for user', 'userCouponDetail:getAllCouponForUser()', 1)
        res.send(err)
    })
}



let purgecouponforUser = (req, res) => {

    let deletecouponforpurge = () => {
        return new Promise((resolve, reject) => {
            // let day = (Number(moment().format('DD'))+1).toString();
            // let month = moment().format('MM')
            // let year = moment().format('YYYY')
            // let datetoday = `${day}-${month}-${year}`
            let datetoday = moment().format('DD-MM-YYYY')
            // console.log(datetoday)
            userCoupon.find({ valid: "1" }).exec((err, result) => {
                // console.log(result)
                if (err) {
                    logger.error('cron service error at purge for user', 'deletecouponforpurge :purgecoupon()', 5)
                    let response = api.apiresponse('cron service error at purge for user', 'deletecouponforpurge :purgecoupon()', 500, null)
                    reject(response)
                } else if (emptyCheck.emptyCheck(result)) {
                    logger.error('cron service error at purge for user received blank data', 'deletecouponforpurge :purgecoupon()', 5)
                    let response = api.apiresponse('cron service error at purge for user received blank data', 'deletecouponforpurge :purgecoupon()', 500, null)
                    reject(response)
                } else {
                    for (let i = 0; i < result.length; i++) {
                        let a = result[i].enddate
                        let b = a.split("-")
                        let zero = "0";
                        // let c = ((b[0])).toString()
                        let c = (Number(b[0]) + 1).toString()
                        let enddate = `${c.length > 1 ? c : zero.concat(c)}-${b[1]}-${b[2]}`
                        console.log(enddate)
                        if (enddate == datetoday) {
                            logger.info('cron servise updated for user', 'deletecouponforpurge()')
                            userCoupon.updateMany({ valid: "1", enddate: result[i].enddate }, { $set: { valid: "0" } }).exec((error, data) => {
                                //  console.log(result)
                                if (error) {
                                    logger.error('cron service error at purge for user', 'deletecouponforpurge :purgecoupon()', 5)
                                    let response = api.apiresponse(true, 'cron service error at purge for user', 'deletecouponforpurge :purgecoupon()', 500, null)
                                    reject(response)
                                } else if (emptyCheck.emptyCheck(data)) {
                                    logger.error('cron service error at purge for user received blank data', 'deletecouponforpurge :purgecoupon()', 5)
                                    let response = api.apiresponse(true, 'cron service error at purge for user received blank data', 'deletecouponforpurge :purgecoupon()', 404, null)
                                    reject(response)
                                } else {
                                    logger.info('Cron service purge done for user ', 'deletecouponforpurge :purgecoupon() ')
                                    resolve(data)

                                }
                            })
                        }
                    }

                }
            })
        })
    }

    deletecouponforpurge(req, res).then((resolve) => {
        logger.info('corn purge done for merchant', 'deletecouponforpurge')
        let response = api.apiresponse(false, 'corn purge done for merchant', 200, null)
        res.send(response)
    }).catch((err) => {
        logger.error('error at corn purge for merchant', 'deletecouponforpurge', 5)
        let response = api.apiresponse(true, 'error at corn purge for merchant', 500, null)
        // console.log(err)
        res.send(response)
    })
}

let redeemedCouponByUser = (req, res) => {
    let findcouponandUser = () => {
        return new Promise((resolve, reject) => {
            userCoupon.update({
                $and:
                    [{ merchantid: req.headers.merchantid },
                    { userid: req.headers.userid },
                    { couponcode: req.headers.couponcode }]
            },
                { $set: { valid: "0", isRedmeed: true } }).exec((error, data) => {
                    if (error) {
                        logger.error('error while updating coupon for user after using it', 'findcouponandUser :redeemedCouponByUser()', 5)
                        let response = api.apiresponse(true, 500, 'error while updating coupon for user after using it', 'findcouponandUser :redeemedCouponByUser()', null)
                        reject(response)
                    } else if (data.nModified == 0) {
                        logger.error('error no coupon found for merchant', 'findcouponandUser :redeemedCouponByUser()', 5)
                        let response = api.apiresponse(true, 404, 'error no coupon found for merchant', 'findcouponandUser :redeemedCouponByUser()', null)
                        reject(response)
                    } else {
                        logger.info('coupon reedemed for user ', 'findcouponandUser :redeemedCouponByUser()')
                        resolve(data)

                    }
                })
        })
    }

    findcouponandUser(req, res).then((resolve) => {
        logger.info('coupon reedemed for user successfully ', 'findcouponandUser :redeemedCouponByUser()')
        let response = api.apiresponse(false, 200, 'coupon reedemed for user successfully', resolve)
        res.send(response)
    }).catch((err) => {
        logger.error('error occured at the redeemedCouponByUser', 'findcouponandUser :redeemedCouponByUser()', 4)
        res.send(err)
    })
}


module.exports = {
    userMerchantDisplay: userMerchantDisplay,
    userCouponDisribution: userCouponDisribution,
    getAllCouponForUser: getAllCouponForUser,
    couponSectionDuringCheckout: couponSectionDuringCheckout,
    purgecouponforUser: purgecouponforUser,
    redeemedCouponByUser: redeemedCouponByUser
}