const fs = require('fs');
const yaml = require('js-yaml');

try {
    let fileContents = fs.readFileSync('./Zebra.yml', 'utf8');
    let data = yaml.load(fileContents);

    console.log(data.services[0].authentication.scheme);
} catch (e) {
    console.log(e);
}

var apimlerror = {
  "messages": [
    {
      "messageType": "ERROR",
      "messageNumber": "ZWEAG130E",
      "messageContent": "Token is not valid for URL '/api/v1/gateway/auth/query'",
      "messageKey": "org.zowe.apiml.security.query.invalidToken"
    }
  ]
}

var queryerror = {
  "messages": [
    {
      "messageType": "ERROR",
      "messageNumber": "ZWEAT100E",
      "messageContent": "Token is expired for URL '/api/v1/gateway/auth/query'",
      "messageKey": "org.zowe.apiml.security.expiredToken"
    }
  ]
}

var apimlsuccess = {
  "domain": "Dummy provider",
  "userId": "user",
  "creation": "2021-08-16T16:20:34.000+0000",
  "expiration": "2021-08-17T16:20:34.000+0000",
  "expired": false
}