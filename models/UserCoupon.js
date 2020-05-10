const mongoose = require('mongoose');
const Schema = mongoose.Schema

let usercoupon = new Schema({
    userid: {
        type: String
    },
    couponcode: {
        type: String
    },
    category: {
        type: String
    },
    enddate: {
        type: String
    },
    valid: {
        type: String
    }
})

let merchantToUser = mongoose.model('coupondistribution', usercoupon)

module.exports = {
    merchantToUser: merchantToUser
}