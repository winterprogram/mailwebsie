const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let bank = new Schema({
    merchantid: {
        type: String
    },
    bankAccount: {
        type: String
    },
    ifscCode: {
        type: String
    },
    bankName: {
        type: String
    }
});

module.exports = mongoose.model('bankdetail', bank)