const AWS = require('aws-sdk');
const ID = '';
const SECRET = '';
const BUCKET_NAME = 'merchantimagesfortimeline';
// const fs = require('fs');
// const merchant = mongoose.model('signupforusermerchant')

const s3 = new AWS.S3({
    accessKeyId: ID,
    secretAccessKey: SECRET
});


let uploadFile= (req, res)=> {
    // let folder = (req.user.username + "/");
    let folder = req.headers.key;
    const file = (req.body.imageUpload);
    const params = {
      Bucket: BUCKET_NAME,
      Key: (folder),
      ACL: 'public-read',
      Body: file
    };
    console.log("Folder name: " + folder);
    console.log("File: " + file);
    
    s3.putObject(params, function (err, data) {
      if (err) {
        res.send("Error: ", err);
      } else {
        res.send(data);
      }
    });
    // res.redirect("/feed");
  };




module.exports = {
    uploadFile: uploadFile
}