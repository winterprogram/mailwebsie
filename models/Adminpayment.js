const mongoose = require('mongoose')
const Schema = mongoose.Schema

const adminpay = new Schema({
    merchantid: {
        type: String,
        required: true,
        index: true
    },
    merchantpayout: {
        type: String,
    },
    adminpayout: {
        type: String,
    },
    createdon: {
        type: String
    },
    isPaid: {
        type: Boolean,
        default: false
    }
})

let paymentstoadmin = mongoose.model('weeklypayout', adminpay)

module.exports = {
    paymentstoadmin: paymentstoadmin
}