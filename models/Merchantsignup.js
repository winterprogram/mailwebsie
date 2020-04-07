const mongoose = require('mongoose')
const Schema = mongoose.Schema

const merchant = new Schema({
    merchantid: {
        type: String,
        unique: true,
        default: 'default001',
        index: true
    },
    fullname: {
        type: String,
        default: ''
    },
    mobilenumber: {
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
    address: {
        type: String
    },
    geolocation: {
        type: Array
    },
    zipcode: {
        type: String
    },
    gender: {
        type: String
    },
    category: {
        type: String
    },
    valid: {
        type: String
    },
    createdon: {
        type: Date
    }
})

let signupmerchant = mongoose.model('signupforusermerchant', merchant)

module.exports = {
    signupmerchant: signupmerchant
}