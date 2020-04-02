const bcrypt = require('bcrypt')
let saltRounds = 10;


let passhash = (pass) => {
    let salt = bcrypt.genSaltSync(saltRounds);
    let hash = bcrypt.hashSync(pass, salt);
    return hash;
}



module.exports = {
    passhash: passhash
}