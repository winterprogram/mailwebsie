let emptyCheck = (data) => {
    if (data == undefined || data == null || data == '') {
        return false;
    } else {
        return true;
    }
}


module.exports = {
    emptyCheck: emptyCheck
}