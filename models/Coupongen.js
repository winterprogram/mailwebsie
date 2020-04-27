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
        type: String,
        index: true
    },
    enddate: {
        type: String,
        index: true
    },
    valid: {
        type: String,
        index: true
    },
    createdon:{
        type:Date,
        default:Date.now()
    }
})

let couponinfo = mongoose.model('coupons', coupondata)

module.exports = {
    couponinfo: couponinfo
}