let apiresponse = (err, status,message, data) => {
    let response = {
        error: err,
        status: status,
        message: message,
        data: data
    }
    return response
}

module.exports = {
    apiresponse: apiresponse
}