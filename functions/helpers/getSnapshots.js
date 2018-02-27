const firebaseApp = require('../helpers/db').firebaseApp;
let __USERID__ = require('../helpers/user').USERID; //log

let getSnapshots = () => {
    const ref = firebaseApp.database().ref(`users/${__USERID__}/snapshots`); //firebase database
    // return new Promise((resolve, reject) => resolve(ref.orderByChild('date').once('value').then(snap => snap.val())))
    console.log('currnent userid',__USERID__)
    // ref.orderByChild('date').once('value').then(snap => {console.log(snap.val())})
    return ref.orderByChild('date').once('value').then(snap => {
    //   console.log('this is snap', snap)
    //   console.log('and snap.val is null?', snap.val())
        return snap.val()
    })
}

module.exports.getSnapshots = getSnapshots;