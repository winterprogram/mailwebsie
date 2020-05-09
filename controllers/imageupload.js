
const AWS = require('aws-sdk');
const ID = '';
const SECRET = '';
const BUCKET_NAME = 'merchantimagesfortimeline';
 const fs = require('fs');
 const uuid = require("uuid");
// const merchant = mongoose.model('signupforusermerchant')

const s3 = new AWS.S3({
    accessKeyId: ID,
    secretAccessKey: SECRET,
    region: "ap-south-1",
    signatureVersion: "v4",
});


const getPresignedUrl = (req, res) => {
   let fileType = req.headers.fileType
    let s3Params = {
        Bucket: BUCKET_NAME,
        Key: req.headers.key,
        ContentType: "image/"+fileType,
        ACL: "public-read",
      };
      s3.getSignedUrl("putObject", s3Params, (err, data) => {
        if (err) {
          console.log(err);
          return res.send(err);
        }
        let returnData = {
          success: true,
          message: "Url generated",
          uploadUrl: data,
          downloadUrl:
          `https://${s3Params.Bucket}.s3.ap-south-1.amazonaws.com/${s3Params.Key}`,
        };
        return res.status(201).json(returnData);
      });
 };



module.exports = {
    getPresignedUrl: getPresignedUrl
}