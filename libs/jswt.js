const jwt = require('jsonwebtoken')
const randomize = require('randomatic');
const secretKey = '805df177eed7be9022261f4978d3e461';


let generateToken = (data, cb) => {

    try {
        let claims = {
            jwtid: randomize('Aa0', 6),
            iat: Date.now(),
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24),
            sub: 'authToken',
            iss: 'userlogin',
            data: data
        }
        let tokenDetails = {
            token: jwt.sign(claims, secretKey),
            tokensecreate: secretKey
        }
        cb(null, tokenDetails)
    } catch (err) {
        console.log(err)
        cb(err, null)
    }
}// end generate token 

let verifyClaim = (token, cb) => {
    // verify a token symmetric
    jwt.verify(token, secretKey, function (err, decoded) {
        if (err) {
            console.log("error while verify token");
            console.log(err);
            cb(err, null)
        }
        else {
            console.log("user verified");
            // console.log(decoded);
            cb(null, decoded);
        }


    });


}// end verify claim 

module.exports = {
    generateToken: generateToken,
    verifyToken: verifyClaim
}