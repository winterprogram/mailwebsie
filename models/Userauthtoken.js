const mongoose = require('mongoose')
const Schema = mongoose.Schema

const tokendata = new Schema({
    userid: {
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

let tokenuser = mongoose.model('usertoken', tokendata)

module.exports = {
    tokenuser: tokenuser
}