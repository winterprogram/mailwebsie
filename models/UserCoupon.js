const mongoose = require('mongoose');
const Schema = mongoose.Schema

let userCoupon = new Schema({
    userid: {
        type: String
    },
    couponcode: {
        type: Array
    }
})