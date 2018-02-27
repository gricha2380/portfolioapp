'use strict';

/********************* TESTING TOOLS *********************/
// Database: firebase serve --only functions,hosting
// make sure route rewrites are listed in firebase.json

/* REQUIRING DEPENDENCIES */
const functions = require('firebase-functions'); //for firebase storage
// const firebase = require('firebase-admin'); //for firebase database
const express = require('express'); // load express from node_modules
const engines = require('consolidate'); // allows popular templating libaries to work with Express
const cors = require('cors'); // avoid cross browser scripting errors
const bodyParser = require('body-parser'); // go inside message body
const nf = require('nasdaq-finance'); // stock API
const coinTicker = require('coin-ticker'); // crypto API
const superagent = require('superagent'); // for performing backend AJAX calls
// const nodemailer = require('nodemailer'); // email & text message
const session = require('express-session'); // session tracking

/* INSTANTIATING APP FUNCTIONS */
const stock = new nf.default();
const app = express();

const config = functions.config();

/********************* TEMPLATING *********************/
app.engine('hbs', engines.handlebars); // use consolidate to attach handlebars templating
app.set('views', './views'); // set views folder to our directory
app.set('view engine', 'hbs'); // use our engine

/********************* DATABASE CONFIG *********************/
const PORT = require('./helpers/db').PORT;
const firebaseApp = require('./helpers/db').firebaseApp;
// const PORT = process.env.PORT || 3000; // set a port. Look to environment variable if avaialble
// const firebaseApp = firebase.initializeApp(
//     functions.config().firebase // use credentials from configured project
// );
/********************* CUSTOM IMPORTS *********************/
let __USERID__ = require('./helpers/user').USERID; //login identifier
const getAssets = require('./helpers/getAssets').getAssets;
const getOneAsset = require('./helpers/getAssets').getOneAsset;
const checkLogin = require('./helpers/checkLogin').checkLogin;
const saveSnapshot = require('./helpers/saveSnapshot').saveSnapshot;
const getSnapshots = require('./helpers/getSnapshots').getSnapshots;
const formatDate = require('./helpers/formatDate').formatDate;
const sendEmail = require('./helpers/sendEmail').sendEmail;
const sendText = require('./helpers/sendText').sendText;
const isAuthorized = require('./helpers/user').isAuthorized;
const coinAPI = require('./helpers/processAssets').coinAPI;
// const processStock = require('./helpers/processAssets').processStock;
// const processCrypto = require('./helpers/processAssets').processCrypto;
// const processLoop = require('./helpers/processAssets').processLoop;

/********************* CRON SCHEDULER *********************/
// exports.hourly_job =
// functions.pubsub.topic('daily-tick').onPublish((event) => {
//     console.log("Running every day, like clock work...")
//     saveSnapshot();
// });

//gcloud app deploy app.yaml \cron.yaml

/********************* ROUTE HELPERS *********************/
app.use(cors()); // if cross origin becomes an issue
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// use sessions for tracking logins
app.use(session({
    secret: 'work hard',
    resave: true,
    saveUninitialized: false
  }));

let rand = (from, to) => {
    return Math.floor((Math.random() * to) + from);
}

process.on('unhandledRejection',error => {
    console.log('process on error', error.message)
})

process.on('uncaughtException',error => {
    console.log('process on exception', error.message)
})

/********************* ROUTES *********************/
// const loginRoute = require('routes/login')
app.post('/login', (request, response) => {
    console.log('login username from body',request.body.username)
    if (!request.body.username || !request.body.password) {
        console.log('incomplete request')
        response.status(400).send(('bad'));
    } else {
        // embrace the future.
        isAuthorized(request.body)
            .then(creds => {
                console.log('pocessing results of checkLogin')
                if (!creds) {console.log('wrong username'); response.status(401).send({'response':'wrong username, buddy!'});};
                creds.forEach(e => { 
                    if (e.screenname) {
                        if (e.screenname === request.body.username && e.password === request.body.password) {
                            __USERID__ = e.id; 
                            console.log('userID is now:',__USERID__)
                            console.log('auth looks alright to me');
                            return response.status(200).send({'response':'user & passwords match!'});
                        } else if (e.screenname !== creds.username){
                            return console.log('bad username');response.status(400).send('username not found!!')
                        }
                        else {
                            // return {"status":402}
                            return console.log('wrong username');response.json({'response':'wrong username'})
                        }
                    } 
                });
            }); 
    }
});

/* ROUTE 1: fetch all assets */
app.get('/portfolio', (request, response) => {
    let promises = [];
    promises.push(getAssets().then(asset => {
        for (let a in asset) {
            if (asset[a].type=='stock') {
                promises.push(stock.getInfo(asset[a].symbol.toLowerCase())
                .then((res) => {
                    // console.log('stock exchange:', res.exchange)
                    // asset[a].exchange = res.exchange;
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
        Promise.all(promises).then(function(results) {
            if (request.body.refresh) response.send(asset);
            else {response.render('portfolio', { asset })}
        });
    }).catch(console.error));
});

/* ROUTE 2: save snapshot */
app.put('/save', (request, response) => {
    console.log('save route entered')
    new Promise((resolve, reject) => resolve(saveSnapshot()))
    .then(e=>{
        console.log('ready with snapshot response', e)
        response.send(e);
    })
});

/* ROUTE 3: add asset */
app.post('/add', (request, response) => {
    // console.log('this is the request body', request.body)
    let rb = request.body;
    if (!rb.name || !rb.symbol || !rb.type || !rb.purchasePrice || !rb.quantity || !rb.exchange) {
        response.status(400).send(JSON.stringify(request.body));
    } else {
        // console.log("Making a new asset", request)
        const db = firebaseApp.database().ref(`users/${__USERID__}/assets`); //firebase database
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
        db.child(request.body.id).set(item);
        // console.log('new asset created',request.body.name);
        response.send(`${request.body.name} asset created`)
    }
});

/* ROUTE 4: edit asset populate */
app.get('/find/:id', (request, response) => {
    // console.log("lookingforid", request.params.id);
    let promises = [];
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
    // console.log('this is the request body', request.body)
    let rb = request.body;
    if (!rb.name || !rb.symbol || !rb.type || !rb.purchasePrice || !rb.quantity || !rb.exchange) {
        response.status(400).send(JSON.stringify(request.body));
    } else {
        // console.log("updating asset", request.body)
        const db = firebaseApp.database().ref(`users/${__USERID__}/assets/${rb.currentID}`); //firebase database
        // console.log('request...',request);
        // console.log('request body here',request.body);
        // const ref = firebaseApp.database().ref(`users/${__USERID__}/assets`); //firebase database
        // console.log('inside getOneAssset', id);
        // return ref.orderByChild('id').equalTo(parseInt(id)).once('value').then(snap => snap.val());      
        
        let item = {
            "name": rb.name,
            "symbol": rb.symbol,
            "type": rb.type,
            "purchasePrice": rb.purchasePrice,
            "quantity": rb.quantity,
            "exchange" : rb.exchange
        }
        db.update(item);
        // console.log('asset updated',rb.name);
        response.send(`${rb.name} asset updated`)
    }
});

/* ROUTE 6: Portfolio Overview */
app.get('/overview', (request, response) => {
    let totalValue = {
        portfolioValue: 0, portfolioGrowth: 0, portfolioGains: 0, stockValue: 0, stockGrowth: 0, stockGains: 0, cryptoValue: 0, cryptoGrowth: 0, cryptoGains: 0
    };
    let snapshots = [];
    let promises = [];
    
    promises.push(getSnapshots().then(snap => {
        snapshots.push(snap)
    }))
    
    promises.push(getAssets().then(asset => { 
        for (let a in asset) {
            if (asset[a].type=='stock') {
                promises.push(stock.getInfo(asset[a].symbol.toLowerCase())
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
        Promise.all(promises).then(function(results) {
            snapshots = JSON.stringify(snapshots);
            if (request.body.refresh) response.send(totalValue, snapshots)
            else {response.render('overview', { totalValue , snapshots})}
            // response.render('overview', { totalValue , snapshots});
        });
    })
    .catch(console.error));
});

/* ROUTE 7: retrieve snapshots */
app.get('/historical', (request, response) => {
    // console.log('historical route',request)
    getSnapshots().then(asset => {
            if (request.body.refresh) response.send(asset);
            else {
                console.log('this is returned from getSnapshots.js',asset)
                response.render('historical', { asset })
            }
    }).catch(console.error);
});

/* ROUTE 8: show stats */
app.get('/stats', (request, response) => {
    let snapshots = [];
    let promises = [];
    
    promises.push(getSnapshots().then(snap => {
        snapshots.push(snap)
    }))
    
    promises.push(getAssets().then(asset => {
        for (let a in asset) {
            if (asset[a].type=='stock') {
                promises.push(stock.getInfo(asset[a].symbol.toLowerCase())
                .then((res) => {
                    // asset[a].exchange = res.exchange;
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
        
        Promise.all(promises).then(function(results) {            
            snapshots = JSON.stringify(snapshots);
            if (request.body.refresh) {response.send(asset, snapshots)}
            else {response.render('stats', { asset, snapshots})}
        });

    }).catch(console.error));
});

/* ROUTE 9: Send Email */
app.post('/email/send', (request, response) => {
    let snapshots = [],
    promises = [],
    recipient = '',
    emailData = {},
    totalValue = {
        portfolioValue: 0, portfolioGrowth: 0, portfolioGains: 0, stockValue: 0, stockGrowth: 0, stockGains: 0, cryptoValue: 0, cryptoGrowth: 0, cryptoGains: 0
    },
    ref,
    userDeliver;

    if (request.body.userTrigger) 
        {ref = firebaseApp.database().ref(`users/${request.body.userTrigger}/email`); console.log(`Checking param. user number from params:`,request.body.userTrigger); userDeliver = request.body.userTrigger}
    else 
        {ref = firebaseApp.database().ref(`users/${__USERID__}/email`);console.log(`Checking param. no param. Using __USERID__ instead`,__USERID__)}

    ref.once('value').then(snap => {
        recipient = snap.val();
        console.log('email recipient is now', recipient);
        // email stats
        promises.push(getAssets(userDeliver).then(asset => {
            console.log(`showing all ${asset.length} assets`, asset)
            for (let a in asset) {
                if (asset[a].type=='stock') {
                    // console.log(`one stock`)
                    promises.push(stock.getInfo(asset[a].symbol.toLowerCase())
                    .then((res) => {
                        // asset[a].exchange = res.exchange;
                        asset[a].price = res.price;
                        asset[a].priceChange = res.priceChange;
                        asset[a].priceChangePercent = res.priceChangePercent;
                        totalValue.portfolioValue += (asset[a].quantity * asset[a].price);
                        totalValue.portfolioGrowth += (asset[a].price / asset[a].purchasePrice) - 1;
                        totalValue.portfolioGains += (asset[a].price - asset[a].purchasePrice) * asset[a].quantity;
                        totalValue.stockValue += (asset[a].quantity * asset[a].price);
                        totalValue.stockGrowth += (asset[a].price / asset[a].purchasePrice) - 1;
                        totalValue.stockGains += (asset[a].price - asset[a].purchasePrice) * asset[a].quantity;
                        // console.log(`stock price ${asset[a].price} for ${asset[a].name}`)
                    }).catch(console.error))
                }
                if (asset[a].type=='crypto') {
                    // console.log(`one crypto`)
                    promises.push(superagent.get(coinAPI+asset[a].name)
                    .then((res) =>  {
                        asset[a].price = res.body[0].price_usd,
                        asset[a].priceChangePercent = res.body[0].percent_change_24h;
                        asset[a].priceChange = parseFloat(asset[a].priceChangePercent * (asset[a].price * .01));
                        totalValue.portfolioValue += (asset[a].quantity * asset[a].price);
                        totalValue.portfolioGrowth += (asset[a].price / asset[a].purchasePrice) - 1;
                        totalValue.portfolioGains += (asset[a].price - asset[a].purchasePrice) * asset[a].quantity;
                        totalValue.cryptoValue += (asset[a].quantity * asset[a].price);
                        totalValue.cryptoGrowth += (asset[a].price / asset[a].purchasePrice) - 1;
                        totalValue.cryptoGains += (asset[a].price - asset[a].purchasePrice) * asset[a].quantity;
                        // console.log(`crypto price ${asset[a].price} for ${asset[a].name}`)
                    }).catch(console.error))
                }
            }
            
            Promise.all(promises).then(function(results) {            
                emailData.portfolio = asset;
                // console.log('this is emailData portfolio right before send', emailData.portfolio)
                sendEmail(recipient, emailData, totalValue, userDeliver);
            });
    
        }).catch(console.error));
    });
    // return emailData.portfolio;
    response.status(200).send({'response':'email sent!'});
});

app.post('/text/send', (request, response) => {
    let snapshots = [];
    let recipient = '';
    let emailData = {};
    let promises = [];
    let totalValue = {
        portfolioValue: 0, portfolioGrowth: 0, portfolioGains: 0, stockValue: 0, stockGrowth: 0, stockGains: 0, cryptoValue: 0, cryptoGrowth: 0, cryptoGains: 0
    };
    let ref;
    let userDeliver;

    if (request.body.userTrigger) 
        {ref = firebaseApp.database().ref(`users/${request.body.userTrigger}/phone`); console.log(`Checking param. user number from params:`,request.body.userTrigger); userDeliver = request.body.userTrigger}
    else 
        {ref = firebaseApp.database().ref(`users/${__USERID__}/phone`);console.log(`Checking param. no param. Using __USERID__ instead`,__USERID__)}

    ref.once('value').then(snap => {
        recipient = snap.val();
        console.log('email phone is now', recipient);
        recipient= recipient+'@messaging.sprintpcs.com';
        promises.push(getAssets().then(asset => {
            for (let a in asset) {
                if (asset[a].type=='stock') {
                    promises.push(stock.getInfo(asset[a].symbol.toLowerCase())
                    .then((res) => {
                        // asset[a].exchange = res.exchange;
                        asset[a].price = res.price;
                        asset[a].priceChange = res.priceChange;
                        asset[a].priceChangePercent = res.priceChangePercent;
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
                    .then((res) =>  {
                        asset[a].price = res.body[0].price_usd,
                        asset[a].priceChangePercent = res.body[0].percent_change_24h;
                        asset[a].priceChange = parseFloat(asset[a].priceChangePercent * (asset[a].price * .01));
                        totalValue.portfolioValue += (asset[a].quantity * asset[a].price);
                        totalValue.portfolioGrowth += (asset[a].price / asset[a].purchasePrice) - 1;
                        totalValue.portfolioGains += (asset[a].price - asset[a].purchasePrice) * asset[a].quantity;
                        totalValue.cryptoValue += (asset[a].quantity * asset[a].price);
                        totalValue.cryptoGrowth += (asset[a].price / asset[a].purchasePrice) - 1;
                        totalValue.cryptoGains += (asset[a].price - asset[a].purchasePrice) * asset[a].quantity;
                        console.log(`crypto price ${asset[a].price} for ${asset[a].name}`)
                    }).catch(console.error))
                }
            }
            
            Promise.all(promises).then(function(results) {            
                emailData.portfolio = asset;
                console.log('this is emailData portfolio right before send', emailData.portfolio)
                // sendEmail(recipient, emailData, totalValue);
                sendText(recipient, emailData, totalValue, userDeliver);
            });
    
        }).catch(console.error));  
    });
    
    // return emailData.portfolio;
    response.status(200).send({'response':'text sent!'});
});


app.get('/', (request, response) => {
    // do conditional reroute for authentication
    response.redirect('/overview');
});

app.get('/login', (request, response) => {
    response.render('index', { response });
    // response.redirect('/overview');
});

app.get('*', (request, response) => {
    // console.log('unknown route request');
    response.send('Sorry, unknown route.');
});
//app.get('*', (req, res) => res.redirect(CLIENT_URL)); // listen for all routes, send to homepage

/********************* LISTEN *********************/
exports.app = functions.https.onRequest(app);