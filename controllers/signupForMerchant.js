const express = require('express')
const app = express()
// to genearte userId
const randomize = require('randomatic')
// adding schema
const model = require('./../models/Merchantsignup')
const mongoose = require('mongoose')
const merchant = mongoose.model('signupforusermerchant')
// adding empty check 
const emptyCheck = require('./../libs/emptyCheck')
//adding api response structure 
const api = require('./../libs/apiresponse')
// adding password encry lib
const logger = require('../libs/logger')
const passencry = require('./../libs/passEncry')
// events
const event = require('events')
const eventemiter = new event.EventEmitter();
// node mailer
const nodemailer = require("nodemailer");

eventemiter.on('welcomemail', (email) => {
    console.log(email)
    async function main() {

        let testAccount = await nodemailer.createTestAccount();

        let transporter = nodemailer.createTransport({
            host: '',
            port: 587,
            secure: false,
            auth: {
                user: '', //add user password
                pass: ''
            }
        });

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: '"Fred Foo 👻" ', // sender address
            to: email, // list of receivers
            subject: "Hello ✔", // Subject line
            text: "Hello world?", // plain text body
            html: "<b>Hello world?</b>" // html body
        });
        console.log(`mail is sent successfullt to ${email}`)

        console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    }

    main().catch(console.error);



})
// mailer ends here

// check for user email with "@ and ." mobile number to be 10 digit and password criteria minimum 6 digit 
let merchantData = (req, res) => {
    // basic check
    let firstCheckEmail = () => {
        return new Promise((resolve, reject) => {

            let regex = /^[a-zA-z]+\W?\w+\W+[a-z]+\W+\w+/
            // console.log(req.body.email)
            if ((req.body.email).match(regex)) {
                logger.info('', '')
                let response = api.apiresponse(false, 200, "Email passed the check", null)
                // console.log(req.body.fullname)
                resolve(response)
            } else {
                let response = api.apiresponse(true, 500, 'email doesn\'t pass', null)
                reject(response)
            }
        })
    }

    // check for password 
    // let passcheck = () => {
    //     return new Promise((resolve, reject) => {
    //         let regex = /^[a-zA-Z]+\d+/
    //         let pass = req.body.password;
    //         // console.log(pass)
    //         if (pass.match(regex) && (pass.length >= 6)) {
    //             // console.log(pass)
    //             let response = api.apiresponse(false, 200, "password passed the check", null)
    //             resolve(response)
    //         } else {
    //             let response = api.apiresponse(true, 500, 'password doesn\'t pass', null)
    //             reject(response)
    //         }

    //     })
    // }

    //mobile no check for 10 digit
    let mobilenoCheck = () => {
        return new Promise((resolve, reject) => {
            merchant.find({ mobilenumber: req.body.mobilenumber }).exec((err, result) => {
                // console.log(req.body.Category)
                if (err) {
                    let response = api.apiresponse(true, 500, 'something went wrong while checking mobile number', null)
                    reject(response)
                }
                else if (emptyCheck.emptyCheck(result)) {
                    let regex = /^[0-9]{10}/
                    let mobile = req.body.mobilenumber

                    if (mobile.match(regex)) {
                        let response = api.apiresponse(false, 200, "mobileno passed the check", null)
                        //  console.log(mobile)
                        resolve(response)
                    } else {
                        let response = api.apiresponse(true, 500, 'mobileno doesn\'t pass', null)
                        reject(response)
                    }
                }
                else {
                    let response = api.apiresponse(true, 500, 'user already exist', err)
                    reject(response)
                }

            })

        })
    }

    // save data
    let savedata = () => {
        return new Promise((resolve, reject) => {
            merchant.find({ email: req.body.email }).exec((err, data) => {
                // console.log(data)
                if (err) {
                    logger.error('omething went wrong while creating user during inital stage', 'savedata() for merchant', 10)
                    let response = api.apiresponse(true, 500, 'something went wrong while creating user during inital stage', null)
                    reject(response)
                } else if (emptyCheck.emptyCheck(data)) {

                    let merchantid = randomize('Aa0', 6)
                    let valid = "1";
                    let userinfo = new merchant({
                        merchantid: merchantid,
                        fullname: req.body.fullname,
                        mobilenumber: req.body.mobilenumber,
                        password: passencry.passhash(req.body.password),
                        email: (req.body.email),
                        city: req.body.city,
                        zipcode: req.body.zipcode,
                        latitude:req.body.latitude,
                        longitude:req.body.longitude,
                        shopname: req.body.shopname,
                        address: req.body.address,
                        geolocation: req.body.geolocation,
                        category: req.body.category,
                        valid: valid,
                        onlineBu: req.body.onlineBu,
                        createdon: Date.now()
                    })
                    userinfo.save((err, result) => {
                        // console.log(result)
                        if (err) {
                            logger.error('failed to create a new user', 'savedata() for merchant', 10)
                            let response = api.apiresponse(true, 500, 'failed to create a new user', err)
                            reject(response)
                        } else if (emptyCheck.emptyCheck(result)) {
                            logger.error('blank data received', 'savedata() for merchant', 10)
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

    firstCheckEmail(req, res).then(mobilenoCheck).then(savedata).then((resolve) => {
        // console.log(resolve)
        // let email = resolve.email
        // addtimeout as per the email api call limit 
        logger.info('user registered', 'user registered')
        setTimeout(() => {
            eventemiter.emit('welcomemail', ((resolve.email).toString()))
        }, 1000)

        let response = api.apiresponse(false, 200, 'user registered', resolve)
        res.send(response)
    }).catch((err) => {
        console.log("errorhandler");
        console.log(err);

        res.send(err)
    })
}

module.exports = {
    merchantData: merchantData
}