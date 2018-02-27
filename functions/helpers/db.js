const firebase = require('firebase-admin'); //for firebase database
const functions = require('firebase-functions'); //for firebase storage

const PORT = process.env.PORT || 3000; // set a port. Look to environment variable if avaialble
const firebaseApp = firebase.initializeApp(
    functions.config().firebase // use credentials from configured project
);

module.exports.PORT = PORT;
module.exports.firebaseApp = firebaseApp;