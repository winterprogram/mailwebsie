const express = require('express')
const app = express()

const bodyparser = require('body-parser')
app.use(bodyparser.json())

const admin = require("firebase-admin");
const serviceAccount = require("./../freechers-3a71a-firebase-adminsdk-lawi2-5439473ac6.json");

let fcmpush = (title, body, token) => {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://freechers-3a71a.firebaseio.com"
    });
    var registrationToken = 'AAAAKuRKyMA:APA91bEO0RhCnM-S1uCYZOtPN4cUGop4oyNcaWGxEqB3SV2Y51coke6oFq8Io5d8VPdc1KNkHIe9_si4rSMoLqS9maZLteuj2wy881722teAZtWESA_v8iTJp-xcytWMeJHcf-LHt_dz';

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
