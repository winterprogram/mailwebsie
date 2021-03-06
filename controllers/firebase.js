const express = require('express')
const app = express()

const bodyparser = require('body-parser')
app.use(bodyparser.json())

const admin = require("firebase-admin");
const serviceAccount = require("./../freechers-3a71a-firebase-adminsdk-lawi2.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://freechers-3a71a.firebaseio.com"
});
let fcmpush = (title, body, token) => {

   const messaging = admin.messaging()
    var payload = {
        notification: {
            title: title,
            body: body
        },
        token: token
    };

    messaging.send(payload)
        .then((result) => {
            console.log(result)
        }).catch((err) => {
            console.log(err)
        })
}


module.exports = {
    fcmpush: fcmpush
}
