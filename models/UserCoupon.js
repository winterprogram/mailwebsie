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
    merchantid: {
        type: String,
        index: true
    },
    category: {
        type: String
    },
    enddate: {
        type: String
    },
    discount: {
        type: String
    },
    merchantname:{
        type: String
    },
    faltdiscountupto: {
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