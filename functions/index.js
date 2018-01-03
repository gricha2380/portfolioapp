const functions = require('firebase-functions'); //for firebase storage
const firebase = require('firebase-admin'); //for firebase database
const express = require('express'); // load express from node_modules
const engines = require('consolidate'); // allows popular templating libaries to work with Express

const app = express(); // instantiate express to use its functionality

app.engine('hbs', engines.handlebars); // use consolidate to attach handlebars templating
app.set('views', './views'); // set views folder to our directory
app.set('view engine', 'hbs'); // use our engine

const bodyParser = require('body-parser'); // go inside message body

const PORT = process.env.PORT || 3000; // set a port. Look to environment variable if avaialble

const firebaseApp = firebase.initializeApp(
    functions.config().firebase // use credentials from configured project
);

function getHouses() {
    const ref = firebaseApp.database().ref('houses'); //firebase database
    console.log('inside getHouses');
    return ref.once('value').then(snap => snap.val());
}


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


// ROUTES

// all via JSON
// app.get('/all', (request, response) => {
//     console.log("showing all houses")
//     getHouses().then(house=> {
//         response.json({houses :house})
//     });
// });

// all via HTML
app.get('/all', (request, response) => {
    console.log("showing all houses")
    getHouses().then(house => {
        console.log('returning a house');
        response.render('index', { house }); // render index page and send back data in house var
    });
});

// caching example. Useful for portfolio app, but House app
// app.get('/all', (request, response) => {
//     console.log("showing all houses")
//     response.set('Cache-Control', 'public, max-age=300, s-maxage=600'); //enable firebase caching. Max-age in seconds
//     getHouses().then(house => {
//         response.json({houses : house})
//     });
// });

app.post('/new', (request, response) => {
    console.log("Making a new house")
    const db = firebaseApp.database().ref('houses'); //firebase database
    console.log(request.body);
    let {name, address, color, rooms, garage} = request.body;
    let item = {
        "name": name,
        "address": address,
        "color": color,
        "rooms": rooms,
        "garage": garage
    }
    db.push(item); // submit items
    response.send(`${name} house created`)
});

app.get('/new', (request, response) => {
    console.log("serving new house HTML page")
    response.sendFile('new.html', {root: '../public'});
    // response.sendFile('public/add.html', {root: '../'}); //example: giving path with no root

});

app.get('/', (request, response) => {
    response.redirect('/all');
});

app.get('/index', (request, response) => {
    // response.sendFile('index.html', {root: '../public'});
    // response.sendFile('./public/index.html', {root: '.'}); //example: giving path with no root
    response.redirect('/all');
});

app.get('/hello', (request, response) => {
    console.log("a hello request came in") // this will show in node CLI
    response.json({message: "Welcome to my API!"}) // this will show in the browser
    // response.send(`welcome to my API`)
});


app.get('/timestamp', (request, response) => {
    response.set('Cache-Control', 'public, max-age=300, s-maxage=600'); //enable firebase caching. Max-age in seconds
    console.log("a request came in")
    // response.json({message: "Welcome to my API"})
    response.send(`${Date.now()}`)
});

app.get('*', (request, response) => {
    console.log('unknown route request');
    response.send('Sorry, unknown route.');
});

app.post('*', (request, response) => {
    console.log('unknown post route request');
    response.send('Sorry, unknown post route.');
});
//app.get('*', (req, res) => res.redirect(CLIENT_URL)); // listen for all routes, send to homepage

// Start the app so it listens for changes via Express
// app.listen(PORT, () => console.log(`Listening on ${PORT}`));

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

// Use with firebase serve command instead of app.listen
// make sure route rewrites are listed in firebase.json
exports.app = functions.https.onRequest(app);