const firebase = require('firebase-admin'); //for firebase database
const functions = require('firebase-functions'); //for firebase storage
// if (!firebaseApp) const firebaseApp = require('../helpers/db').firebaseApp;
const firebaseApp = require('../helpers/db').firebaseApp;

let __USERID__ = require('../helpers/user').USERID; //login identifier

let getAssets = (userDeliver) => {
    let holder = [], value;

    console.log('userID check',__USERID__)
    console.log('userDeliver',userDeliver)
    // if (!__USERID__) __USERID__ = 0; // proof of login bug 
    let ref = '';
    if (userDeliver) {ref = firebaseApp.database().ref(`users/${userDeliver}/assets`)}
    else {ref = firebaseApp.database().ref(`users/${__USERID__}/assets`)}

    return new Promise((resolve, reject) => resolve(ref.once('value').then(snap => snap.val())))
}

let getOneAsset = (id) => {
    const ref = firebaseApp.database().ref(`users/${__USERID__}/assets`); //firebase database
    // console.log('inside getOneAssset', id);
    return new Promise((resolve, reject) => {resolve(ref.orderByChild('id').equalTo(parseInt(id)).once('value').then(snap => snap.val()))});      
}

module.exports.getAssets = getAssets;
module.exports.getOneAsset = getOneAsset;