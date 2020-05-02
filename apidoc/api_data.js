define({ "api": [
  {
    "group": "user_dashboard",
    "version": "0.0.1",
    "type": "post",
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
            "description": "<p>Current latitude of the user. (body params)(required)</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "userlongitude",
            "description": "<p>Current longitude of the user. (body params)(required)</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "email",
            "description": "<p>Email of user. (body params)(required)</p>"
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
    "name": "PostFormaps"
  }
] });
