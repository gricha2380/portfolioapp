// test locally with: firebase serve --only functions,hosting

const functions = require('firebase-functions'); //for firebase storage
const firebase = require('firebase-admin'); //for firebase database
const express = require('express'); // load express from node_modules
const engines = require('consolidate'); // allows popular templating libaries to work with Express

const nf = require('nasdaq-finance'); // stock API

// const stock = new NasdaqFinance();
const stock = nf.NasdaqFinance();

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
    console.log('inside assets');
    return ref.once('value').then(snap => snap.val());
}

function getAssets() {
    const ref = firebaseApp.database().ref('users/0/assets'); //firebase database
    console.log('inside getAssets');
    return ref.once('value').then(snap => snap.val());
}


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


// ROUTES

// ROUTE 1: fetch all assets from firebase datastore called assets
    // db holds: symbol, name, purchase price, quantity, brokerage, asset type, id
    // save all into local object
    // call function to find current market data
    // when data is returned send updated data object as response to client

// FUNCTION 1: get current market data (input: asset objects)
    // Check asset type. If stock, (maybe put into stock array) fetch data from https://www.npmjs.com/package/nasdaq-finance
    // If crypto, pass the name (not symbol) to coinmarketcap https://api.coinmarketcap.com/v1/ticker/ethereum
    // for all asset types capture 24h change, 24h gain, current price
    // append data to existing object & return 

// ROUTE 2: save snapshot
    // calculate the following:
        // Portfolio Value, Portfolio Gains, Portfolio Growth, 
        // Crypto Value, Crypto Gains, Crypto Growth, Crypto %, 
        // Stock Value, Stock Gains, Stock Growth, Stock %
    // once a day, save snapshot into datastore called historic, along with day time stamp
    // send response to client containing the whole list of values

// ROUTE 3: add asset
    // post route, take in: name, symbol, asset type, purchase price, quantity, brokerage 
    // add id to object. id = current_obj.length +1
    // save object to db. Send response with okay or error

// ROUTE 4: edit asset populate
    // query db for record information with return results for asset matching id
    // respond with record name, symbol, asset type, purchase price, quantity, brokerage

// Route 5: edit asset save
    // request contains name, symbol, asset type, purchase price, quantity, brokerage, id
    // save & override relevant db record with matching asset id
    // respond with okay or error

// Route 6: Text value
    // request contains username, value
    // calculate portfolio value for given user
    // repsonse contains value, name, date

// CLIENT SIDE WORK
//  compute total growth, total gain, portfolio %, market value, cost basis, 
// create charts

// FUTURE: Allow multiple users

// all via JSON
app.get('/all', (request, response) => {
    console.log("showing all assets route")
    getAssets().then(asset => {
        for (let i = 0;i<asset.length;i++) {
            console.log(asset[i].type);
            if (asset[i].type=='stock') findStockData(asset); // console.log(asset[i].name +' is a stock');//
            else if (asset[i].type=='crypto') findCryptoData(asset); //console.log(asset[i].name + ' is crypto');
            response.json({assets : asset}) // send basic json response
       }
        response.send('all done');
    });
});

// for all asset types capture 24h change, 24h gain, current price
 // append data to existing object & return 
function findStockData(asset) {
    stock.getInfo(asset.symbol)
    .then((response) => {
        
        asset.name = response.name,
        asset.price = response.price,
        asset.priceChange = response.priceChange,
        asset.priceChangePercent = response.priceChangePercent
        console.log('new asset value',asset);
        return (asset);
    })
    .catch(console.error)
    // return asset;
}

function findCryptoData(asset) {
    console.log('inside crypto function', asset);
    return asset;
}

// all via HTML
// app.get('/all', (request, response) => {
//     console.log("showing all assets")
//     getAssets().then(asset => {
//         console.log('returning a asset');
//         response.render('index', { asset }); // render index page and send back data in house var
//     });
// });

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