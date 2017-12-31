const functions = require('firebase-functions');
const express = require('express'); // load express from node_modules
const app = express(); // instantiate express to use its functionality

const bodyParser = require('body-parser'); // go inside message body

const PORT = process.env.PORT || 3000; // set a port. Look to environment variable if avaialble

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


// ROUTES
app.get('/hello', (request, response) => {
    console.log("a request came in")
    response.json({message: "Welcome to my API"})
    // response.send(`welcome to my API`)
});

app.get('/timestamp', (request, response) => {
    response.set('Cache-Control', 'public, max-age=300, s-maxage=600'); //enable firebase caching. Max-age in seconds
    console.log("a request came in")
    // response.json({message: "Welcome to my API"})
    response.send(`${Date.now()}`)
});



// Start the app so it listens for changes via Express
// app.listen(PORT, () => console.log(`Listening on ${PORT}`));

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

// Use with firebase serve command instead of app.listen
// make sure route rewrites are listed in firebase.json
exports.app = functions.https.onRequest(app);