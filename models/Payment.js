const mongoose = require('mongoose')
const Schema = mongoose.Schema

const paymentId = new Schema({
    merchantid: {
        type: String
    },
    userid: {
        type: String
    },
    paymentid: {
        type: String
    },
    orderid: {
        type: String
    },
    signature: {
        type: String
    },
    errorcode: {
        type: String
    },
    message: {
        type: String
    },
    createdon:{
        type:String
    }
})

let paymentsfromuser = mongoose.model('razorpayments', paymentId)

module.exports = {
    paymentsfromuser: paymentsfromuser
}