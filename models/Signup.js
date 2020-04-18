const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSignup = new Schema({
    userid: {
        type: String,
        unique: true,
        default: 'default001',
        index: true
    },
    fullName: {
        type: String,
        default: ''
    },
    mobileNumber: {
        type: String,
        default: ''
    },
    password: {
        type: String
    },
    email: {
        type: String
    },
    city: {
        type: String
    },
    zipcode: {
        type: String
    },
    gender: {
        type: String
    },
    valid: {
        type: String,
        index: true
    },
    dob: {
        type: String,
    },
    createdon:{
        type:Date
    }
})

let signup = mongoose.model('signupforuser', userSignup)

module.exports = {
    signup: signup
}