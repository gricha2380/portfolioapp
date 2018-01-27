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
const superagent = require ('superagent'); // for performing backend AJAX calls

/* INSTANTIATING APP FUNCTIONS */
const stock = new nf.default();
const app = express();
let __USERID__ = null; //login identifier

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
    const ref = firebaseApp.database().ref(`users/${__USERID__}/assets`); //firebase database
    console.log('inside getAssets');
    return ref.once('value').then(snap => snap.val());
}

function getOneAsset(id) {
    const ref = firebaseApp.database().ref(`users/${__USERID__}/assets`); //firebase database
    console.log('inside getOneAssset', id);
    return ref.orderByChild('id').equalTo(parseInt(id)).once('value').then(snap => snap.val());      
}

function checkLogin(info) {
    const ref = firebaseApp.database().ref(); //firebase database
    console.log('inside login, username:', info.username);
    //return ref.orderByChild('screenname').equalTo(info.username).once('value').then(snap => snap.val());      
    return ref.child('users').orderByChild('screenname').equalTo(info.username).once('value').then(snap => snap.val());
}

function saveSnapshot() {
    const ref = firebaseApp.database().ref(`users/${__USERID__}/snapshots`); //firebase database
    console.log('inside snapshots');
    return ref.once('value').then(snap => snap.val());
}

function getSnapshots() {
    console.log('getting snapshots now!')
    const ref = firebaseApp.database().ref(`users/${__USERID__}/snapshots`); //firebase database
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

let coinAPI = "https://api.coinmarketcap.com/v1/ticker/";

/********************* ROUTES *********************/

/* ROUTE 1: fetch all assets */
app.get('/portfolio', (request, response) => {
    console.log("showing all assets route")
    response.set('Cache-Control', 'public, max-age=300, s-maxage=600'); //enable firebase caching. Max-age in seconds
    let promises = [];

    // LEARN: do await and async keywords. Are those avaiable in the version of node I'm using?
    promises.push(getAssets().then(asset => {
        for (let a in asset) {
            if (asset[a].type=='stock') {
                promises.push(stock.getInfo(asset[a].symbol)
                .then((res) => {
                    asset[a].exchange = res.exchange;
                    asset[a].price = res.price;
                    asset[a].priceChange = res.priceChange;
                    asset[a].priceChangePercent = res.priceChangePercent;
                }).catch(console.error))
            }
            if (asset[a].type=='crypto') {
                promises.push(superagent.get(coinAPI+asset[a].name)
                    .then(res =>  {
                        asset[a].price = res.body[0].price_usd,
                        asset[a].priceChangePercent = res.body[0].percent_change_24h;
                        asset[a].priceChange = parseFloat(asset[a].priceChangePercent * (asset[a].price * .01));
                    }).catch(console.error))
            }
        }
        /* Wait for all promises to resolve. This fixed the big issue */
        Promise.all(promises).then(function(results) {
        // response.send(asset);
        response.render('portfolio', { asset }); // render index page and send back data in asset var
        }.bind(this));
    }).catch(console.error));
});

/* ROUTE 2: save snapshot */
app.get('/save', (request, response) => {
    /* TODO: check cridentials */
    const db = firebaseApp.database().ref(`users/${__USERID__}/snapshots`); //firebase database

    let totalValue = {
        date: formatDate(),unix: Date.now(),portfolioValue: 0,portfolioGrowth: 0,portfolioGains: 0,stockValue: 0,        stockGrowth: 0,stockGains: 0, stockCount: 0, cryptoValue: 0, cryptoGrowth: 0, cryptoGains: 0, cryptoCount: 0
    };
    let promises = [];

    promises.push(getAssets().then(asset => {
        /* how can I use map, rduce & filter to arrive at the necessary values? */
        for (let a in asset) {
            if (asset[a].type=='stock') {
                promises.push(stock.getInfo(asset[a].symbol)
                .then((res) => {
                    asset[a].price = res.price;
                    asset[a].priceChange = res.priceChange;
                    asset[a].priceChangePercent = res.priceChangePercent;

                    totalValue.portfolioValue += (asset[a].quantity * asset[a].price);
                    totalValue.portfolioGrowth += (asset[a].price / asset[a].purchasePrice) - 1;
                    totalValue.portfolioGains += (asset[a].price - asset[a].purchasePrice) * asset[a].quantity;
                    totalValue.stockValue += (asset[a].quantity * asset[a].price);
                    totalValue.stockGrowth += (asset[a].price / asset[a].purchasePrice) - 1;
                    totalValue.stockGains += (asset[a].price - asset[a].purchasePrice) * asset[a].quantity;
                    totalValue.stockCount++;
                }).catch(console.error))
            }
            if (asset[a].type=='crypto') {
                promises.push(superagent.get(coinAPI+asset[a].name)
                .then((res) => {
                    asset[a].price = res.body[0].price_usd,
                    asset[a].priceChangePercent = res.body[0].percent_change_24h;
                    asset[a].priceChange = parseFloat(asset[a].priceChangePercent * (asset[a].price * .01));

                    totalValue.portfolioValue += (asset[a].quantity * asset[a].price);
                    totalValue.portfolioGrowth += (asset[a].price / asset[a].purchasePrice) - 1;
                    totalValue.portfolioGains += (asset[a].price - asset[a].purchasePrice) * asset[a].quantity;
                    totalValue.cryptoValue += (asset[a].quantity * asset[a].price);
                    totalValue.cryptoGrowth += (asset[a].price / asset[a].purchasePrice) - 1;
                    totalValue.cryptoGains += (asset[a].price - asset[a].purchasePrice) * asset[a].quantity;
                    totalValue.cryptoCount++;           
                }).catch(console.error))
            }
        }   
        
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
        const db = firebaseApp.database().ref(`users/${__USERID__}/assets`); //firebase database
        // console.log('request...',request);
        // console.log('request body here',request.body);
        //let {name, symbol, type, purchasePrice, quantity, exchange} = request.body;
        let item = {
            "name": request.body.name,
            "symbol": request.body.symbol,
            "type": request.body.type,
            "purchasePrice": request.body.purchasePrice,
            "quantity": request.body.quantity,
            "exchange" : request.body.exchange,
            "id" : request.body.id
        }
        // db.push(item); // submit items
        db.child(request.body.id).set(item);
        console.log('new asset created',request.body.name);
        response.send(`${request.body.name} asset created`)
    }
});

/* ROUTE 4: edit asset populate */
app.get('/find/:id', (request, response) => {
    console.log("lookingforid", request.params.id);
    let promises = [];
    // promises.push(getAssets().then(asset => {
    promises.push(getOneAsset(request.params.id).then(asset => {
        
           /* Wait for all promises to resolve. This fixed the big issue */
           Promise.all(promises).then(function(results) {
            // response.send(asset);
            response.send({asset}); // render index page and send back data in asset var
        }.bind(this));
    }).catch(console.error));
});

/* ROUTE 5: edit asset save */
app.post('/edit/:id', (request, response) => {
    console.log('this is the request body', request.body)
    let rb = request.body;
    if (!rb.name || !rb.symbol || !rb.type || !rb.purchasePrice || !rb.quantity || !rb.exchange) {
        response.status(400).send(JSON.stringify(request.body));
    } else {
        console.log("updating asset", request.body)
        const db = firebaseApp.database().ref(`users/${__USERID__}/assets/${rb.currentID}`); //firebase database
        // console.log('request...',request);
        // console.log('request body here',request.body);
        let item = {
            "name": rb.name,
            "symbol": rb.symbol,
            "type": rb.type,
            "purchasePrice": rb.purchasePrice,
            "quantity": rb.quantity,
            "exchange" : rb.exchange
        }
        // db.push(item); // submit items
        db.update(item);
        console.log('asset updated',rb.name);
        response.send(`${rb.name} asset updated`)
    }
});

/* ROUTE 6: Portfolio Overview */
app.get('/overview', (request, response) => {
    console.log("showing all assets route")
    let totalValue = {
        portfolioValue: 0, portfolioGrowth: 0, portfolioGains: 0, stockValue: 0, stockGrowth: 0, stockGains: 0, cryptoValue: 0, cryptoGrowth: 0, cryptoGains: 0
    };

    let promises = [];

    promises.push(getAssets().then(asset => {
        
        for (let a in asset) {
            if (asset[a].type=='stock') {
                // console.log('current stock content ', a)
                promises.push(stock.getInfo(asset[a].symbol)
                .then((res) => {
                    asset[a].price = res.price;
                    totalValue.portfolioValue += (asset[a].quantity * asset[a].price);
                    totalValue.portfolioGrowth += (asset[a].price / asset[a].purchasePrice) - 1;
                    totalValue.portfolioGains += (asset[a].price - asset[a].purchasePrice) * asset[a].quantity;
                    totalValue.stockValue += (asset[a].quantity * asset[a].price);
                    totalValue.stockGrowth += (asset[a].price / asset[a].purchasePrice) - 1;
                    totalValue.stockGains += (asset[a].price - asset[a].purchasePrice) * asset[a].quantity;
                }).catch(console.error))
            }
            if (asset[a].type=='crypto') {
                promises.push(superagent.get(coinAPI+asset[a].name)
                .then((res) => {    
                    asset[a].price = res.body[0].price_usd,
                    totalValue.portfolioValue += (asset[a].quantity * asset[a].price);
                    totalValue.portfolioGrowth += (asset[a].price / asset[a].purchasePrice) - 1;
                    totalValue.portfolioGains += (asset[a].price - asset[a].purchasePrice) * asset[a].quantity;
                    totalValue.cryptoValue += (asset[a].quantity * asset[a].price);
                    totalValue.cryptoGrowth += (asset[a].price / asset[a].purchasePrice) - 1;
                    totalValue.cryptoGains += (asset[a].price - asset[a].purchasePrice) * asset[a].quantity;
                }).catch(console.error))
            }
        }
           /* Wait for all promises to resolve. This fixed the big issue */
           Promise.all(promises).then(function(results) {
            // response.send(asset);
            response.render('overview', { totalValue }); // render index page and send back data in asset var
        }.bind(this));
    }).catch(console.error));
});

/* ROUTE 7: retrieve snapshots */
app.get('/historical', (request, response) => {
    console.log("retrieving snapshot")
    let promises = [];

    // LEARN: do await and async keywords. Are those avaiable in the version of node I'm using?
    promises.push(getSnapshots().then(asset => {
           /* Wait for all promises to resolve. This fixed the big issue */
           Promise.all(promises).then(function(results) {
            // response.send(asset);
            console.log('here is snapshot',asset)
            response.render('historical', { asset }); // render index page and send back data in asset var
        }.bind(this));
    }).catch(console.error));
});

/* ROUTE 8: show stats */
app.get('/stats', (request, response) => {
    // let snapshots = fetch(getSnapshots()).then(response => {
    //         console.log('this was snapshot response...')
    //         console.log(response);
    //     })
    let snapshots = [];

    console.log("showing stats")
    response.set('Cache-Control', 'public, max-age=300, s-maxage=600'); //enable firebase caching. Max-age in seconds
    let promises = [];

    promises.push(getSnapshots().then(snap => {
        snapshots.push(snap)
        console.log('new snap',snap)
    }))
    console.log('total snapshot', snapshots)

    // LEARN: do await and async keywords. Are those avaiable in the version of node I'm using?
    promises.push(getAssets().then(asset => {
        for (let a in asset) {
            if (asset[a].type=='stock') {
                promises.push(stock.getInfo(asset[a].symbol)
                .then((res) => {
                    asset[a].exchange = res.exchange;
                    asset[a].price = res.price;
                    asset[a].priceChange = res.priceChange;
                    asset[a].priceChangePercent = res.priceChangePercent;
                }).catch(console.error))
            }
            if (asset[a].type=='crypto') {
                promises.push(superagent.get(coinAPI+asset[a].name)
                    .then((res) =>  {
                        asset[a].price = res.body[0].price_usd,
                        asset[a].priceChangePercent = res.body[0].percent_change_24h;
                        asset[a].priceChange = parseFloat(asset[a].priceChangePercent * (asset[a].price * .01));
                    }).catch(console.error))
            }
        }
        
        // promises.push();
        // let snapshots = 'hello I is snapshot';
        // let snapshots = JSON.stringify(getSnapshots());
        


        /* Wait for all promises to resolve. This fixed the big issue */
        Promise.all(promises).then(function(results) {
        // response.send(asset);
        // also grab snapshot process. Note: consolidate this with route 8
        console.log('here are snapshots',snapshots)
        snapshots = JSON.stringify(snapshots);
        response.render('stats', { asset, snapshots}); // render index page and send back data in asset var
        }.bind(this));
    }).catch(console.error));
});

app.get('/', (request, response) => {
    // do conditional reroute for authentication
    response.redirect('/overview');
});

app.get('/login', (request, response) => {
    response.render('index', { response });
    // response.redirect('/overview');
});

app.post('/login', (request, response) => {
    // response.render('index', { response });
    // response.redirect('/overview');
    let promises = [];

    console.log('this is the request body for login', request.body)
    console.log('username',request.body.username)
    let rb = request.body;
    if (!rb.username || !rb.password) {
        response.status(400).send(JSON.stringify(request.body));
    } else {
        console.log("connecting to login database")

        promises.push(checkLogin(request.body).then((creds) => {
            if (!creds) response.status(401).send('username not found!!');
            console.log('creds yall',creds);
            console.log('cred first spot',creds[1]);            
            // JSON.stringify(creds);
            // creds[1]= creds;
            creds.forEach(e => {
                console.log('here is e',e)
                if (e.screenname) {
                    console.log('inside foreach inner')
                    if (e.screenname === request.body.username && e.password === request.body.password) {
                        console.log("it's a match!")
                        __USERID__ = e.id;
                        //response.send(`it matches! ${e.screenname} ${e.password}`)
                        response.status(242).send({'response':'it matches!'});
                        // response.status(242).send({'response':'all good'});
                        // response.send(`asset created and matched`)
                        // response.send('you got it!');
                    } else if (e.screenname === request.body.username){
                        console.log('wrong password, boo')
                        // response.send(`wrong password... ${e.screenname} ${e.password}`)
                        // response.json({'response':'wrong passsword'})
                        response.status(401).send({'response':'wrong password, buddy!'});
                    }
                    else {
                        // response.send(`wrong user name... ${e.screenname} ${e.password}`)
                        response.json({'response':'wrong username'})
                    }
                }
                
    
            });
            
            Promise.all(promises).then(function(results) {
                // response.send(asset);
                // response.render('here is the answer', { results }); // render index page and send back data in asset var
            }.bind(this));

        }).catch(console.error))
    }
});

app.get('*', (request, response) => {
    console.log('unknown route request');
    response.send('Sorry, unknown route.');
});
//app.get('*', (req, res) => res.redirect(CLIENT_URL)); // listen for all routes, send to homepage

/********************* LISTEN *********************/
exports.app = functions.https.onRequest(app);