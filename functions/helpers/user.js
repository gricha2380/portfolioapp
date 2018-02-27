const checkLogin = require('../helpers/checkLogin').checkLogin;

let __USERID__ = 0;
const isAuthorized = requestBody => {
    // console.log('inside isAuthorized',requestBody)
   return new Promise((resolve, reject) => { 
        resolve(checkLogin(requestBody))
    })
}
module.exports.USERID = __USERID__;
module.exports.isAuthorized = isAuthorized;