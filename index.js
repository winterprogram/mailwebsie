const express = require('express')
const app = express()
const mongoose = require('mongoose')
const fs = require('fs')
//adding appConfigs
const appconfigs = require('./appConfig/config')
const http = require('http')
//adding middleware
const middlewareOnStart = require('./middleware/errorOnInitial')
const middlewareOnRoute = require('./middleware/errorOnRoutes')
const cookieparser = require('cookie-parser')
const bodyparser = require('body-parser')
const helmet = require('helmet')
const empty = require('./libs/emptyCheck')
const api = require('./libs/apiresponse')
var cors = require('cors');
const c = require('./models/Coupongen')
const coupon = mongoose.model('coupons')
const logger = require('./libs/logger')
const crons = require('node-cron')
const moment = require('moment')
const timeZone = 'Asia/Calcutta'
const purge = require('./controllers/coupongen')
const userPurge = require('./controllers/usercontoller')
const paymentupdate = require('./controllers/payments')
const admin = require('firebase-admin');
// let serviceAccount = require('./freechers-3a71a-firebase-adminsdk-lawi2-5439473ac6.json');


// app.use(cors({origin: 'http://localhost:4200'}));

app.use(cookieparser())
app.use(bodyparser.urlencoded({ extended: false }))
app.use(bodyparser.json())


app.use(middlewareOnStart.appOnstart)
// adding listerner

const server = http.createServer(app)
server.listen(appconfigs.port)
// server.listen(process.env.PORT || 3000, function(){
//     console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
//   });
server.on('error', onError)
server.on('listening', onlisten)    

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    next();
});

crons.schedule('0  1 * * *', () => {
    console.log('running a task every minute')
    purge.purgecoupon()
    userPurge.purgecouponforUser()
    console.log('coupon purge done for user/merchant')

})

// crons.schedule('* * * * *', () => {
//     console.log('running a task every minute')
//     paymentupdate.paidisTrue()
//     console.log('coupon purge done for user/merchant')

// })


function onError(err) {
    if (err) {
        console.log(err)
        console.log('server closed')
    }
    switch (error.code) {
        case 'EACCES':
            logger.error(error.code + ':elavated privileges required', 'serverOnErrorHandler', 10);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            logger.error(error.code + ':port is already in use.', 'serverOnErrorHandler', 10);
            process.exit(1);
            break;
        default:
            logger.error(error.code + ':some unknown error occured', 'serverOnErrorHandler', 10);
            throw error;
    }
}

function onlisten() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    ('Listening on ' + bind);
    console.log(`server is running on port ${appconfigs.port}`)

    let db = mongoose.connect(appconfigs.db.uri, { useNewUrlParser: true, useUnifiedTopology: true })
}
app.use(helmet())

const socketLib = require("./libs/socket");
const socket = socketLib.setServer(server);

app.use(middlewareOnRoute.routes)
let route = './routes'
fs.readdirSync(route).forEach(function (file) {
    (~file.indexOf('.js'))
    let router = require(route + '/' + file)
    router.routes(app)
    // console.log(mainpath)
})

let model = './models'
fs.readdirSync(model).forEach(function (file) {
    (~file.indexOf('.js'))
    let mainpath = require(model + '/' + file)
    mainpath.signup
    mainpath.signupmerchant
    mainpath.tokenuser
    mainpath.couponinfo
    mainpath.bank
    // console.log(mainpath)
})


mongoose.connection.on('open', (req, res, err) => {
    if (err) {
        console.log('Error while connecting to db')
    } else {
        console.log('successful while connecting to db')
    }
})

module.exports = server