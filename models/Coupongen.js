const mongoose = require('mongoose')
const Schema = mongoose.Schema
// const Schema = mongoose.Schema

let coupondata = new Schema({
    merchantid: {
        type: String,
        index: true
    },
    couponcode: {
        type: String,
        index: true
    },
    discount: {
        type: String,
        required: false

    },
    faltdiscountupto: {
        type: String,
        required: true
    },
    startdate: {
        type: String
    },
    enddate: {
        type: String
    },
    valid: {
        type: String
    }
})

let couponinfo = mongoose.model('coupons', coupondata)

module.exports = {
    couponinfo: couponinfo
}