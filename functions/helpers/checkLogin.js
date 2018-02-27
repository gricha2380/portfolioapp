const firebaseApp = require('../helpers/db').firebaseApp;
let __USERID__ = require('../helpers/user').USERID; //login identifier

let checkLogin = (info) => {
    console.log('inside checkLogin')
    const ref = firebaseApp.database().ref(); //firebase database
    return ref.child('users').orderByChild('screenname').equalTo(info.username).once('value').then(snap => snap.val())
    // return new Promise((resolve, reject) => { 
    //     resolve(ref.child('users').orderByChild('screenname').equalTo(info.username).once('value').then(snap => snap.val()))
    // }) 
}
module.exports.checkLogin = checkLogin;