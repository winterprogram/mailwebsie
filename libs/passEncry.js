const bcrypt = require('bcrypt')
let saltRounds = 10;


let passhash = (pass) => {
    let salt = bcrypt.genSaltSync(saltRounds);
    let hash = bcrypt.hashSync(pass, salt);
    return hash;
}

let passcheck = (pass, oldpass, callback) => {
    bcrypt.compare(pass, oldpass, function (err, result) {
        if (err) {
            callback(err, null)
        } else {
            callback(null, result)
        }
    });
}



module.exports = {
    passhash,
    passcheck
}