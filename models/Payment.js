const mongoose = require('mongoose')
const Schema = mongoose.Schema

const paymentId = new Schema({
    merchantid: {
        type: String,
        required: true,
        index: true
    },
    userid: {
        type: String,
        required: true
    },
    id: {
        type: String
    },
    entity: {
        type: String
    },
    amount: {
        type: Number
    },
    amount_paid: {
        type: Number
    },
    amount_due: {
        type: Number
    },
    currency: {
        type: String
    },
    receipt: {
        type: String
    },
    offer_id: {
        type: String
    },
    status: {
        type: String
    },
    attempts: {
        type: Number
    },
    notes: {
        type: Array
    },
    created_at: {
        type: Number
    },
    createdon: {
        type: String
    },
})

let paymentsfromuser = mongoose.model('razorpayments', paymentId)

module.exports = {
    paymentsfromuser: paymentsfromuser
}