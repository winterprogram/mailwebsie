define({ "api": [
  {
    "group": "Merchant_images",
    "version": "0.0.1",
    "type": "put",
    "url": "/imageuploadcheck",
    "title": "api to update boolean that if images is uploaded by merchants",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "mobilenumber",
            "description": "<p>Mobile number of the merchants. (header params)(required)</p>"
          },
          {
            "group": "Parameter",
            "type": "boolean",
            "optional": false,
            "field": "imageuploaded",
            "description": "<p>True if the images are successfully uploaded by merchant. (header params)(required)</p>"
          },
          {
            "group": "Parameter",
            "type": "array",
            "optional": false,
            "field": "imageurl",
            "description": "<p>download url of amazon s3. (body params)(required)</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "object",
            "optional": false,
            "field": "API",
            "description": "<p>Response shows error status, message, http status code and result.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n    \"error\": false,\n    \"message\": \"resolved \",\n    \"status\": 200,\n    \"data\": {\n        \"n\": 1,\n        \"nModified\": 1,\n        \"ok\": 1\n    }\n}",
          "type": "object"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error-Response:",
          "content": "{ \n \"error\": true,\n \"message\": \"error headers params are empty\",\n \"status\": 500,\n \"data\": null\n  }",
          "type": "json"
        }
      ]
    },
    "filename": "routes/userManage.js",
    "groupTitle": "Merchant_images",
    "name": "PutImageuploadcheck"
  },
  {
    "group": "user_dashboard",
    "version": "0.0.1",
    "type": "get",
    "url": "/formaps",
    "title": "api to calculate distance between user and merchant",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "userlatitude",
            "description": "<p>Current latitude of the user. (header params)(required)</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "userlongitude",
            "description": "<p>Current longitude of the user. (header params)(required)</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "city",
            "description": "<p>City of the merchant. (header params)(required)</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "object",
            "optional": false,
            "field": "API",
            "description": "<p>Response shows error status, message, http status code and result.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n    \"error\": false,\n    \"message\": 200,\n    \"status\": \"user fetched\",\n    \"data\": [\n        {\n            \"_id\": \"5ead99102588643510ebba03\",\n            \"merchantid\": \"rKGFlO\",\n            \"fullname\": \"orion mall\",\n            \"mobilenumber\": \"9167162010\",\n            \"password\": \"$2b$10$z8IhiuCs3p3j87YMpLbcruOCj6lOWZEmPtaa0FwegIlm8E8SdKpGa\",\n            \"email\": \"chakladar.sandeep@gmail.com\",\n            \"city\": \"mumbai\",\n            \"zipcode\": \"410206\",\n            \"latitude\": \"18.993292\",\n            \"longitude\": \"73.115773\",\n            \"address\": \"yudeguye\",\n            \"category\": \"test\",\n            \"valid\": \"1\",\n            \"createdon\": \"2020-05-02T16:00:16.348Z\",\n            \"__v\": 0\n        }\n    ]\n}",
          "type": "object"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error-Response:",
          "content": "{ \n \"error\": true,\n \"message\": \"no merchant found near your location\",\n \"status\": 500,\n \"data\": null\n  }",
          "type": "json"
        }
      ]
    },
    "filename": "routes/userManage.js",
    "groupTitle": "user_dashboard",
    "name": "GetFormaps"
  }
] });
