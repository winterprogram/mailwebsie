let emptyCheck = (data) => {
    if (data == undefined || data == null || data == '') {
        return true;
    } else {
        return false;
    }
}


module.exports = {
    emptyCheck: emptyCheck
}