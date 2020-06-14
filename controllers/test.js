const express = require('express')
const app = express()
// to genearte userId
const randomize = require('randomatic')
// adding schema
const model = require('./../models/Signup')
const mongoose = require('mongoose')
const signup = mongoose.model('signupforuser')
const modelauth = require('./../models/Userauthtoken')
const tokenuser = mongoose.model('usertoken')
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
const logger = require('./../libs/logger')

class UserEdit {
    async user(req, res) {
        try {
            let findUser = await signup.find({ userid: req.headers.userid })
            if (emptyCheck.emptyCheck(findUser)) {
                logger.error('no user deatils found', 'UserEdit - class', 10)
                let response = api.apiresponse(true, 404, 'no user deatils found', null)
                res.send(response)
            } else {
                let edituser = await signup.update({ userid: findUser[0].userid },
                    {
                        $set:
                        {
                            fullname: req.body.fullname,
                            mobilenumber: req.body.mobilenumber,
                            categoryselected: req.body.categoryselected,
                            email: req.body.email
                        }
                    })
                if (edituser.nModified == 0) {
                    logger.error('not a vaild input', 'UserEdit - class', 10)
                    let response = api.apiresponse(true, 400, 'not a valid input', null)
                    res.send(response)
                } else {
                    logger.info('user details upadted', 'UserEdit - class')
                    let response = api.apiresponse(false, 200, 'user data updated', edituser)
                    res.send(response)
                }
            }
        } catch (err) {
            logger.error('something went wrong while updating the user details deatils', 'UserEdit - class', 5)
            let response = api.apiresponse(false, 500, 'something went wrong while updating the user details deatils', err)
            res.send(response)
        }
    }
}


module.exports = new UserEdit();