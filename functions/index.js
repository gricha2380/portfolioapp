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
const stock = new nf.default();

/* INSTANTIATING APP FUNCTIONS */
// const stock = nf.default;
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

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('/');
}

/********************* ROUTES *********************/
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

// ROUTE 1: fetch all assets
app.get('/all', (request, response) => {
    console.log("showing all assets route")
    let promises = [];

    promises.push(getAssets().then(asset => {
        
        console.log('one or many?', asset)
        asset.forEach((a,i) => {
            if (a.type=='stock') {
                console.log('current stock content ', a)
                promises.push(stock.getInfo(a.symbol)
                .then((res) => {
                    a.exchange = res.exchange;
                    a.price = res.price;
                    a.priceChange = res.priceChange;
                    a.priceChangePercent = res.priceChangePercent;
                    console.log('new stock asset here', a);
                    // response.send(asset);
                }).catch(console.error))
            }
            if (a.type=='crypto') {
                console.log('current crypto content', a)
               //promises.push(coinTicker('gdax','BTC_USD')
                promises.push(coinTicker(a.exchange, a.symbol+'_USD')
                .then((res) => {    
                    console.log('inside asset response build...', res)
                    // capture 24h change, 24h gain, current price
                    // append data to existing object & return 
                    a.price = res.last;
                    a.priceChange = 0; //TODO
                    a.priceChangePercent = 0; //TODO
                    console.log('new crypto asset', asset);
                    console.log('returning new crypto');
                }).catch(console.error))
            }
        })
           // Wait for all promises to resolve. This fixed the big issue
           Promise.all(promises).then(function(results) {
            // response.send(asset);
            response.render('index', { asset }); // render index page and send back data in asset var
        }.bind(this));
    }).catch(console.error));
});

// caching example. Useful for portfolio app
// app.get('/all', (request, response) => {
//     console.log("showing all assets")
//     response.set('Cache-Control', 'public, max-age=300, s-maxage=600'); //enable firebase caching. Max-age in seconds
//     getAssets().then(asset => {
//         response.json({assets : asset})
//     });
// });

app.post('/add', (request, response) => {
    console.log("Making a new asset")
    const db = firebaseApp.database().ref('users/0/assets'); //firebase database
    // console.log('request...',request);
    console.log('request body here',request.body);
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
});

app.get('/new', (request, response) => {
    console.log("serving new asset HTML page")
    //response.sendFile('new.html', {root: '../public'});
    // response.sendFile('public/add.html', {root: '../'}); //example: giving path with no root
    response.send('what route is that?')
});

app.get('/', (request, response) => {
    // response.redirect('/all');
    response.send('what route is that?')
});

app.get('/index', (request, response) => {
    // response.sendFile('index.html', {root: '../public'});
    // response.sendFile('./public/index.html', {root: '.'}); //example: giving path with no root
    // response.redirect('/all');
    response.send('index request?')
});

app.get('/save', (request, response) => {
    // check cridentials
    // compute the following: date, port. value, ,port gains, port growth, crypto value, crypto gains, ctypto growth, crypto %, stock value, stock gains, stock growth, stock %
    // save to firebase
    const db = firebaseApp.database().ref('users/0/assets'); //firebase database
    let item = {
        "date": formatDate()
        // "portfolioValue": "portfolioValue() to sum current value",
        // "portfolioGains":"function to sum current dollar change",
        // "portfolioGrowth":"functinon to sum current percent change",
        // "cryptoValue": "function to sum va"
    }
    
    let portfolioValue = (e) => {
        let promises = [];

        promises.push(getAssets().then(asset => {
            // how can I use map, rduce & filter to arrive at the necessary values?
            console.log('pulling all assets', asset)
            asset.map(a => {
                if (a.type=='stock') {
                    console.log('current stock content ', a)
                    promises.push(stock.getInfo(a.symbol)
                    .then((res) => {
                        a.price = res.price;
                        a.priceChange = res.priceChange;
                        a.priceChangePercent = res.priceChangePercent;
                        console.log('new stock asset here', a);
                        // response.send(asset);
                    }).catch(console.error))
                }
                if (a.type=='crypto') {
                    console.log('current crypto content', a)
                //promises.push(coinTicker('gdax','BTC_USD')
                    promises.push(coinTicker(a.exchange, a.symbol+'_USD')
                    .then((res) => {    
                        console.log('inside asset response build...', res)
                        // capture 24h change, 24h gain, current price
                        // append data to existing object & return 
                        a.price = res.last;
                        a.priceChange = 0; //TODO
                        a.priceChangePercent = 0; //TODO
                        console.log('new crypto asset', asset);
                        console.log('returning new crypto');
                    }).catch(console.error))
                }
            }).reduce((a,c) => {
                item.portfolioValue = a + (c.quantity * c.price);
                item.portfolioGrowth = (a + c.priceChangePercent) / asset.length;
                item.portfolioGains = (a + c.portfolioGains) / asset.length;
                if (c.type=='stock') {
                    item.stockValue = a + (c.quantity * c.price);
                    item.stockGrowth = (a + c.priceChangePercent) / asset.length;
                    item.stockGains = (a + c.portfolioGains) / asset.length;
                } else if (c.type=='crypto') {
                    item.cryptoValue = a + (c.quantity * c.price);
                    item.cryptoGrowth = (a + c.priceChangePercent) / asset.length;
                    item.cryptoGains = (a + c.portfolioGains) / asset.length;
                }
            })
            // numArray.reduce((accumulator, current)) => accumulator + current)
            // Wait for all promises to resolve. This fixed the big issue
            Promise.all(promises).then(function(results) {
                response.send(asset);
            }.bind(this));
        }).catch(console.error));

        push (item.portfolioValue = portfolio.value);
        push (item.portfolioGains = portfolio.gains);
        push (item.portfolioGrowth = portfolio.growth);
        push (item.cryptoValue = portfolio.crypto.value);
        push (item.cryptoValue = portfolio.crypto.gains);
        push (item.cryptoValue = portfolio.crypto.growth);
        push (item.stocksValue = portfolio.stocks.value);
        push (item.stocksValue = portfolio.stocks.gains);
        push (item.stocksValue = portfolio.stocks.growth);
    } //end portfolio value
    portfolioValue();
    console.log('new item value', item)
    db.push(item); // submit items
    console.log('snapshot saved');
});

app.get('*', (request, response) => {
    console.log('unknown route request');
    response.send('Sorry, unknown route.');
});
//app.get('*', (req, res) => res.redirect(CLIENT_URL)); // listen for all routes, send to homepage

/********************* LISTEN *********************/
exports.app = functions.https.onRequest(app);