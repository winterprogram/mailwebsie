let emptyCheck = (data) => {
    if (data == undefined || data == null || data == ''|| data == []) {
        return true;
    } else {
        return false;
    }
}

let emptyCheckreverse = (data) => {
    if (data == undefined || data == null || data == '') {
        return false;
    } else {
        return true;
    }
}

module.exports = {
    emptyCheck: emptyCheck,
    emptyCheckreverse: emptyCheckreverse
}