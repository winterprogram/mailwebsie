const mongoose = require('mongoose')

let emailCheck = (email) => {
    let regex = /^[a-zA-z]+\W?\w+\W+[a-z]+\W+\w+/
    if (email.match(regex)) {
        console.log('email has passed')
        return true;
    } else {
        // let a = "Email failed to pass the critria"
        return false;
    }
}

let mobileno = (mobile) => {
    let regex = /^[0-9]{10}/
    if (mobile.match(regex)) {
        return true
    } else {
        return false
    }
}

let password = (pass) => {
    let regex = /^[a-zA-Z]+\d+/
    if (pass.match(regex) && (pass.length >= 6)) {
        return true
    } else {
        return false
    }
}

module.exports = {
    emailCheck: emailCheck,
    mobileno: mobileno,
    password: password
}