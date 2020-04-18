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
        default: '',
        index: true
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
        type: Array,
        index: true
    },
    zipcode: {
        type: String,
        index: true
    },
    shopname: {
        type: String
    },
    Category: {
        type: String,
        index: true
    },
    valid: {
        type: String,
        index: true
    },
    createdon: {
        type: Date
    }
})

let signupmerchant = mongoose.model('signupforusermerchant', merchant)

module.exports = {
    signupmerchant: signupmerchant
}