'use strict';

/********************* TESTING TOOLS *********************/
// Database: firebase serve --only functions,hosting
// make sure route rewrites are listed in firebase.json

/* REQUIRING DEPENDENCIES */
const functions = require('firebase-functions'); //for firebase storage
const firebase = require('firebase-admin'); //for firebase database
const express = require('express'); // load express from node_modules
const engines = require('consolidate'); // allows popular templating libaries to work with Express
const cors = require('cors'); // avoid cross browser scripting errors
const bodyParser = require('body-parser'); // go inside message body
const nf = require('nasdaq-finance'); // stock API
const coinTicker = require('coin-ticker'); // crypto API

/* INSTANTIATING APP FUNCTIONS */
const stock = new nf.default();
const app = express();

/********************* TEMPLATING *********************/
app.engine('hbs', engines.handlebars); // use consolidate to attach handlebars templating
app.set('views', './views'); // set views folder to our directory
app.set('view engine', 'hbs'); // use our engine

/********************* DATABASE CONFIG *********************/
const PORT = process.env.PORT || 3000; // set a port. Look to environment variable if avaialble
const firebaseApp = firebase.initializeApp(
    functions.config().firebase // use credentials from configured project
);

/********************* ROUTE HELPERS *********************/
app.use(cors()); // if cross origin becomes an issue
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

function getAssets() {
    const ref = firebaseApp.database().ref('users/0/assets'); //firebase database
    console.log('inside getAssets');
    return ref.once('value').then(snap => snap.val());
}

function saveSnapshot() {
    const ref = firebaseApp.database().ref('users/0/snapshots'); //firebase database
    console.log('inside snapshots');
    return ref.once('value').then(snap => snap.val());
}

function formatDate() {
    var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [month, day, year].join('/');
}

/********************* ROUTES *********************/

/* ROUTE 1: fetch all assets */
app.get('/all', (request, response) => {
    console.log("showing all assets route")
    let promises = [];

    promises.push(getAssets().then(asset => {
        
        // console.log('one or many?', asset)
        // asset.forEach((a,i) => {
        for (let a in asset) {
            if (asset[a].type=='stock') {
                // console.log('current stock content ', a)
                promises.push(stock.getInfo(asset[a].symbol)
                .then((res) => {
                    asset[a].exchange = res.exchange;
                    asset[a].price = res.price;
                    asset[a].priceChange = res.priceChange;
                    asset[a].priceChangePercent = res.priceChangePercent;
                    // console.log('new stock asset here', a);
                    // response.send(asset);
                }).catch(console.error))
            }
            if (asset[a].type=='crypto') {
                // console.log('current crypto content', a)
               //promises.push(coinTicker('gdax','BTC_USD')
                promises.push(coinTicker(asset[a].exchange, asset[a].symbol+'_USD')
                .then((res) => {    
                    /* append data to existing object & return  */
                    // console.log('inside asset response build...', res)
                    // capture 24h change, 24h gain, current price
                    asset[a].price = res.last;
                    asset[a].priceChange = 0; //TODO
                    asset[a].priceChangePercent = 0; //TODO
                    // console.log('new crypto asset', asset);
                    console.log('returning new crypto');
                }).catch(console.error))
            }
        }
           /* Wait for all promises to resolve. This fixed the big issue */
           Promise.all(promises).then(function(results) {
            // response.send(asset);
            response.render('index', { asset }); // render index page and send back data in asset var
        }.bind(this));
    }).catch(console.error));
});

/* caching example. Useful for portfolio app */
// app.get('/all', (request, response) => {
//     console.log("showing all assets")
//     response.set('Cache-Control', 'public, max-age=300, s-maxage=600'); //enable firebase caching. Max-age in seconds
//     getAssets().then(asset => {
//         response.json({assets : asset})
//     });
// });

/* ROUTE 2: save snapshot */
app.get('/save', (request, response) => {
    /* TODO: check cridentials */
    // compute the following: date, port. value, ,port gains, port growth, crypto value, crypto gains, crypto growth, crypto %, stock value, stock gains, stock growth, stock %
    // save to firebase
    const db = firebaseApp.database().ref('users/0/snapshots'); //firebase database

    let totalValue = {
        date: formatDate(),
        unix: Date.now(),
        portfolioValue: 0,
        portfolioGrowth: 0,
        portfolioGains: 0,
        stockValue: 0,
        stockGrowth: 0,
        stockGains: 0,
        stockCount: 0,
        cryptoValue: 0,
        cryptoGrowth: 0,
        cryptoGains: 0,
        cryptoCount: 0
    };
    let promises = [];

    promises.push(getAssets().then(asset => {
        /* how can I use map, rduce & filter to arrive at the necessary values? */
        // console.log('all assets in save', asset)

        for (let a in asset) {
            // console.log('this is outer', a)
            // console.log('this is outer', asset[a])
            if (asset[a].type=='stock') {
                // console.log('current stock content ', asset[a])
                promises.push(stock.getInfo(asset[a].symbol)
                .then((res) => {
                    // console.log('this is res', res)
                    asset[a].price = res.price;
                    asset[a].priceChange = res.priceChange;
                    asset[a].priceChangePercent = res.priceChangePercent;
                    // console.log('new stock asset here', asset[a]);
                    totalValue.portfolioValue += (asset[a].quantity * asset[a].price);
                    totalValue.portfolioGrowth += (asset[a].price / asset[a].purchasePrice) - 1;
                    totalValue.portfolioGains += (asset[a].price - asset[a].purchasePrice) * asset[a].quantity;
                    totalValue.stockValue += (asset[a].quantity * asset[a].price);
                    totalValue.stockGrowth += (asset[a].price / asset[a].purchasePrice) - 1;
                    totalValue.stockGains += (asset[a].price - asset[a].purchasePrice) * asset[a].quantity;
                    totalValue.stockCount++;
                    
                    // response.send(asset[a]);
                }).catch(console.error))
            }
            if (asset[a].type=='crypto') {
                // console.log('current crypto content', a)
                promises.push(coinTicker(asset[a].exchange, asset[a].symbol+'_USD')
                .then((res) => {    
                    // console.log('inside crypto asset response build...', res)
                    // capture 24h change, 24h gain, current price
                    /* append data to existing object & return */
                    asset[a].price = res.last;
                    asset[a].priceChange = 0; //TODO
                    asset[a].priceChangePercent = 0; //TODO
                    // console.log('current crypto value quantity', asset[a].quantity);
                    totalValue.portfolioValue += (asset[a].quantity * asset[a].price);
                    totalValue.portfolioGrowth += (asset[a].price / asset[a].purchasePrice) - 1;
                    totalValue.portfolioGains += (asset[a].price - asset[a].purchasePrice) * asset[a].quantity;
                    totalValue.cryptoValue += (asset[a].quantity * asset[a].price);
                    totalValue.cryptoGrowth += (asset[a].price / asset[a].purchasePrice) - 1;
                    totalValue.cryptoGains += (asset[a].price - asset[a].purchasePrice) * asset[a].quantity;
                    totalValue.cryptoCount++;
                    // response.sendFile(asset[a]);
                }).catch(console.error))
            }
          //  response.send(asset)
        }
        //console.log('this is the asset', asset,'this is totalValue', totalValue)        

        
        /* Wait for all promises to resolve. This fixed the big issue */
        Promise.all(promises).then(function(results) {
            totalValue.portfolioGrowth = (totalValue.portfolioGrowth / (totalValue.cryptoCount + totalValue.stockCount)) * 100;
            totalValue.stockGrowth = (totalValue.stockGrowth / totalValue.stockCount) * 100;
            totalValue.cryptoGrowth = (totalValue.cryptoGrowth / totalValue.cryptoCount) * 100;
            db.push(totalValue); // submit items
            console.log('snapshot saved');
            response.send(totalValue);
        }.bind(this));
    }).catch(console.error));

});

/* ROUTE 3: add asset */
app.post('/add', (request, response) => {
    console.log('this is the request body', request.body)
    let rb = request.body;
    if (!rb.name || !rb.symbol || !rb.type || !rb.purchasePrice || !rb.quantity || !rb.exchange) {
        response.status(400).send(JSON.stringify(request.body));
    } else {
        console.log("Making a new asset", request)
        const db = firebaseApp.database().ref('users/0/assets'); //firebase database
        // console.log('request...',request);
        // console.log('request body here',request.body);
        //let {name, symbol, type, purchasePrice, quantity, exchange} = request.body;
        let item = {
            "name": request.body.name,
            "symbol": request.body.symbol,
            "type": request.body.type,
            "purchasePrice": request.body.purchasePrice,
            "quantity": request.body.quantity,
            "exchange" : request.body.exchange
        }
        db.push(item); // submit items
        console.log('new asset created',request.body.name);
        response.send(`${request.body.name} asset created`)
    }
});

app.get('/', (request, response) => {
    // response.redirect('/all');
    response.send('what route is that?')
});

app.get('/index', (request, response) => {
    // response.sendFile('index.html', {root: '../public'});
    response.redirect('/all');
});

app.get('*', (request, response) => {
    console.log('unknown route request');
    response.send('Sorry, unknown route.');
});
//app.get('*', (req, res) => res.redirect(CLIENT_URL)); // listen for all routes, send to homepage

/********************* LISTEN *********************/
exports.app = functions.https.onRequest(app);