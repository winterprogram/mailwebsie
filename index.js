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


app.use(cookieparser())
app.use(bodyparser.urlencoded({ extended: false }))
app.use(bodyparser.json())

// server.listen(process.env.PORT || 3000, function(){
//     console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
//   });
app.use(middlewareOnStart.appOnstart)
// adding listerner
const server = http.createServer(app)
// server.listen(appconfigs.port)
server.listen(process.env.PORT || 3000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });
server.on('error', onError)
server.on('listening', onlisten)

function onError(err) {
    if (err) {
        console.log(err)
        console.log('server closed')
    }
}

function onlisten() {
    console.log(`server is running on port ${appconfigs.port}`)

    let db = mongoose.connect(appconfigs.db.uri, { useNewUrlParser: true, useUnifiedTopology: true })
}

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
    // console.log(mainpath)
})


mongoose.connection.on('open', (req, res, err) => {
    if (err) {
        console.log('Error while connecting to db')
    } else {
        console.log('successful while connecting to db')
    }
})

