const mongoose = require('mongoose')
const Schema = mongoose.Schema

const tokeninfo = new Schema({
    merchantid: {
        type: String,
        unique: true,
        default: 'default001',
        index: true
    },
    authtoken: {
        type: String,
        default: ''
    },
    secreatekey: {
        type: String,
        default: ''
    },
    userinfo: {
        type: String
    },
    createdon: {
        type: Date
    }
})

let mertoken = mongoose.model('merchantinfo', tokeninfo)

module.exports = {
    mertoken: mertoken
}