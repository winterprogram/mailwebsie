const mongoose = require('mongoose');
const Schema = mongoose.Schema

let usercoupon = new Schema({
    userid: {
        type: String,
        index: true
    },
    couponcode: {
        type: String,
        index: true
    },
    category: {
        type: String
    },
    enddate: {
        type: String
    },
    valid: {
        type: String
    },
    status: {
        type: String,
        default: "Active"
    }
})

let merchantToUser = mongoose.model('coupondistribution', usercoupon)

module.exports = {
    merchantToUser: merchantToUser
}