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
const superagent = require('superagent'); // for performing backend AJAX calls
const nodemailer = require('nodemailer'); // email & text message
const async = require('asyncawait/async');
const await = require('asyncawait/await');

/* INSTANTIATING APP FUNCTIONS */
const stock = new nf.default();
const app = express();
let __USERID__ = null; //login identifier
const config = functions.config();

/********************* TEMPLATING *********************/
app.engine('hbs', engines.handlebars); // use consolidate to attach handlebars templating
app.set('views', './views'); // set views folder to our directory
app.set('view engine', 'hbs'); // use our engine

/********************* DATABASE CONFIG *********************/
const PORT = process.env.PORT || 3000; // set a port. Look to environment variable if avaialble
const firebaseApp = firebase.initializeApp(
    functions.config().firebase // use credentials from configured project
);

/********************* CRON SCHEDULER *********************/
exports.hourly_job =
functions.pubsub.topic('daily-tick').onPublish((event) => {
    console.log("Running every day, like clock work...")
    saveSnapshot();
});

//gcloud app deploy app.yaml \cron.yaml

/********************* ROUTE HELPERS *********************/
app.use(cors()); // if cross origin becomes an issue
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

let getAssets = () => {
    let holder = [], value;

    console.log('userID',__USERID__)
    // if (!__USERID__) __USERID__ = 0; // proof of login bug 
    const ref = firebaseApp.database().ref(`users/${__USERID__}/assets`); //firebase database
    // console.log('inside getAssets');

    // return ref.once('value').then(snap => {
    //     console.log('promise snap',snap.val());
    //     holder.push(snap.val())
    //     snap.val()
    // });
    // return ref.once('value').then(snap => {
    //     return snap.val();
    // });
    
    // return new Promise((resolve,reject)=>{
    //     console.log('holder content', holder)
    //     resolve(holder)
    // })
    return new Promise((resolve, reject) => resolve(ref.once('value').then(snap => snap.val())))

    // return new Promise((resolve,reject) => {
    //     const ref = firebaseApp.database().ref(`users/${__USERID__}/assets`); //firebase database
    //     resolve(ref.once('value').then(snap => {
    //         console.log('promise snap',snap.val());
    //         snap.val()
    //     }))
    // }) 
}

let getOneAsset = (id) => {
    const ref = firebaseApp.database().ref(`users/${__USERID__}/assets`); //firebase database
    // console.log('inside getOneAssset', id);
    return new Promise((resolve, reject) => {resolve(ref.orderByChild('id').equalTo(parseInt(id)).once('value').then(snap => snap.val()))});      
}

let checkLogin = (info) => {
    console.log('inside checkLogin')
    const ref = firebaseApp.database().ref(); //firebase database
    return ref.child('users').orderByChild('screenname').equalTo(info.username).once('value').then(snap => snap.val())
    // return new Promise((resolve, reject) => { 
    //     resolve(ref.child('users').orderByChild('screenname').equalTo(info.username).once('value').then(snap => snap.val()))
    // })
}

let saveSnapshot = () => {
    console.log('inside saveSnapshot')
    /* TODO: check cridentials */
    const ref = firebaseApp.database().ref(`users/`); //firebase database
    
    // itterate through whole list of users
    ref.once('value').then(user => {
        user.val().forEach((r)=>{
            console.log(`processing snapshot for ID ${r.id}`);
            processSnapshot(r.id)
        })
    });
    
    let processSnapshot = (userID) => {
        console.log('now starting snapshot function...')
        const db = firebaseApp.database().ref(`users/${userID}/snapshots`); //firebase database
        
        let totalValue = {
            date: formatDate('slash'),unix: Date.now(),portfolioValue: 0,portfolioGrowth: 0,portfolioGains: 0,stockValue: 0,        stockGrowth: 0,stockGains: 0, stockCount: 0, cryptoValue: 0, cryptoGrowth: 0, cryptoGains: 0, cryptoCount: 0
        };
        
        getAssets().then(asset => {
            let promises = [];
            for (let a in asset) {
                if (asset[a].type=='stock') {
                    promises.push(processStock(asset[a].symbol.toLowerCase())
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
                        // console.log('math time stock',(asset[a].price / asset[a].purchasePrice) - 1);
                        console.log('while looping, portfolio value is...',totalValue)
                        return totalValue.portfolioValue;
                    }).catch(console.error))
                }
                if (asset[a].type=='crypto') {
                    promises.push(processCrypto(coinAPI+asset[a].name)
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
                        // console.log('math time crypto',(asset[a].price / asset[a].purchasePrice) - 1);
                        console.log('while looping, portfolio value is...',totalValue)
                        return totalValue.portfolioValue;
                    }).catch(console.error))
                }
            }
            
            // return totalValue;
            Promise.all(promises).then(function(results) {
                // console.log('after looping portfolio value is...',totalValue)
                totalValue.portfolioGrowth = parseFloat(totalValue.portfolioGrowth / (totalValue.cryptoCount + totalValue.stockCount)) * 100;
                totalValue.stockGrowth = parseFloat(totalValue.stockGrowth / totalValue.stockCount) * 100;
                totalValue.cryptoGrowth = parseFloat(totalValue.cryptoGrowth / totalValue.cryptoCount) * 100;
                console.log('what be totalValue?',totalValue)
                db.push(totalValue); // submit items
                // console.log('snapshot saved in totalValue',totalValue);
                // return totalValue;
                return new Promise((resolve, reject) => resolve(totalValue))    
            })
        }) // end getassets
    };
    
}

let getSnapshots = () => {
    const ref = firebaseApp.database().ref(`users/${__USERID__}/snapshots`); //firebase database
    // return new Promise((resolve, reject) => resolve(ref.orderByChild('date').once('value').then(snap => snap.val())))
    return ref.orderByChild('date').once('value').then(snap => snap.val());
}

let formatDate = (style) => {
    if (style == 'slash' || !style) {
        let d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();
        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;
        return [month, day, year].join('/');
    }
    else if (style == 'word') {
        let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
        let d = new Date();
        let dateNow = d.getDate();
        let monthNow = d.getMonth();
        let yearNow = d.getFullYear();
        return months[monthNow] +' '+ dateNow + ', ' + yearNow +' ';
    }
    else if (style == 'full') {
        let d = new Date()
        let weekday = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
        let months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
        return weekday[d.getDay()] +' '+ months[d.getMonth()] +' '+ d.getDate() +', '+ d.getFullYear();
    }
}

let rand = (from, to) => {
    return Math.floor((Math.random() * to) + from);
}

let sendEmail = (recipient, data, totalValue) => {
    
    let userEmail = process.env.portfolioUserEmail || functions.config().email.address;
    let userPassword = process.env.portfolioUserPassword || functions.config().email.password;
    console.log(`survey recipent is ${recipient}`)
    console.log(`local env email address ${process.env.portfolioUserEmail}`)
    // console.log('probably data', data);
    console.log('probably data portfolio', data.portfolio);
    let table = {
        'start':'<table>',
        'end':'</table>',
        'rowStart':'<tr>',
        'rowEnd' : '</tr>',
        'tdStart':'<td>',
        'tdEnd':'</td>',
        'theadStart':'<thead>',
        'theadEnd':'</thead>',
        'tbodyStart':'<tbody>',
        'tbodyEnd':'</tbody>'
    }
    let p = `style="padding: .5rem 1rem;"`;
    data.tableTemp = [
        {
            "symbol":"AAPL",
            "price": rand(1,200),
            "pricePaid": rand(1,180),
            "quantity": 8,
            "cost": rand(50,200),
            "value": rand(50,200),
            "growth":rand(80,150),
            "gain":rand(80,150),
            "gain24":rand(-80,150)
        },
        {
            "symbol":"AMZN",
            "price": rand(1,200),
            "pricePaid": rand(1,180),
            "quantity": 8,
            "cost": rand(50,200),
            "value": rand(50,200),
            "growth":rand(80,150),
            "gain":rand(80,150),
            "gain24":rand(-80,150)
        },
        {
            "symbol":"GOOG",
            "price": rand(1,200),
            "pricePaid": rand(1,180),
            "quantity": 8,
            "cost": rand(50,200),
            "value": rand(50,200),
            "growth":rand(80,150),
            "gain":rand(80,150),
            "gain24":rand(-80,150)
        },
        {
            "symbol":"MSFT",
            "price": rand(1,200),
            "pricePaid": rand(1,180),
            "quantity": 8,
            "cost": rand(50,200),
            "value": rand(50,200),
            "growth":rand(80,150),
            "gain":rand(80,150),
            "gain24":rand(-80,150)
        }
    ]
    table.content = `<table style="border-collapse: collapse; margin: auto"><thead style="background-color: #1b1d25;color: #8d8e91;"><td ${p}>Symbol</td><td ${p}>Price</td><td ${p}>Price Paid</td><td ${p}>Qnty</td><td ${p}>Cost</td><td ${p}>Value</td><td ${p}>Growth</td><td ${p}> Gain</td><td ${p}>Gain 24hr</td></thead><tbody style="background: #efefef;">`;
    // for (let x = 0; x < data.tableTemp.length; x++) {
    //     table.content += `<tr><td ${p}><b>${data.tableTemp[x].symbol}</b></td><td ${p}>$${data.tableTemp[x].price}</td><td ${p}>$${data.tableTemp[x].pricePaid}</td><td ${p}>${data.tableTemp[x].quantity}</td><td ${p}>$${data.tableTemp[x].cost}</td><td ${p}>$${data.tableTemp[x].value}</td><td ${p}>${data.tableTemp[x].growth}%</td><td ${p}>$${data.tableTemp[x].gain}</td>`
    //     parseFloat(data.tableTemp[x].gain24)>0 ? table.content += `<td ${p}><span style="color:green">$${data.tableTemp[x].gain24}</span></td></tr>` : table.content += `<td ${p}><span style="color:red">$${data.tableTemp[x].gain24}</span></td></tr>`;
    // }
    for (let x = 0; x < data.portfolio.length; x++) {
        let price = parseFloat(data.portfolio[x].price),
        pricePaid = parseFloat(data.portfolio[x].purchasePrice), 
        quantity = parseFloat(data.portfolio[x].quantity),
        marketValue = price * quantity,
        cost = pricePaid * quantity,
        value = quantity * price,
        growth = (marketValue / cost) * 100,
        gain = (price * quantity) - (pricePaid * quantity),
        gain24 = parseFloat(data.portfolio[x].priceChange);

        table.content += `<tr><td ${p}><b>${data.portfolio[x].symbol.toUpperCase()}</b></td><td ${p}>$${price.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')}</td><td ${p}>$${pricePaid.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')}</td><td ${p}>${quantity}</td><td ${p}>$${cost.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')}</td><td ${p}>$${value.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')}</td><td ${p}>${growth.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')}%</td><td ${p}>$${gain.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')}</td>`
        gain24 > 0 ? table.content += `<td ${p}><span style="color:green">$${gain24.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')}</span></td></tr>` : table.content += `<td ${p}><span style="color:red">$${gain24.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')}</span></td></tr>`;
    }
    table.content += table.tbodyEnd + table.end;
    
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.portfolioUserEmail || config.email.address,
            pass: process.env.portfolioUserPassword || config.email.password
        }
    });
    
    let mailOptions = {
        from: '"Portfolio App 2.0" <gregor@gregorrichardson.com>',
        to: recipient,
        subject: 'Portfolio Update',
        html: 
        `<div style="text-align: center; color: black">
        <h3 style="color: black">Portfolio Update</h3>
        <div style="color: black">${formatDate('full')}</div>
        <div style="color: black"><b>Portfolio Value: $${totalValue.portfolioValue.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')}</b></div>
        <div>
        <span style="color: black">(</span>
        <span style="color: green">$${totalValue.portfolioGains.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')}</span>
        <span style="color: black">/</span>
        <span style="color: green">${totalValue.portfolioGrowth.toFixed(2)}%</span>
        <span style="color: black">)</span>
        </div>
        </div>
        
        <div style="margin: 50px auto">
        ${table.content}
        </div>
        <div style="text-align:center"><a href="https://portfolioapp2380.firebaseapp.com">View Portfolio</a></div>
        `
    };
    
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
            // return emailData.portfolio;
            return response.status(200).send({'response':'email sent!'});
        }
    });
}

let sendText = (recipient, data, totalValue) => {
    
    let userEmail = process.env.portfolioUserEmail || functions.config().email.address;
    let userPassword = process.env.portfolioUserPassword || functions.config().email.password;
    
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.portfolioUserEmail || config.email.address,
            pass: process.env.portfolioUserPassword || config.email.password
        }
    });
    
    let mailOptions = {
        from: '"Portfolio App 2.0" <gregor@gregorrichardson.com>',
        to: recipient,
        subject: 'Portfolio Update',
        text: 
        `${formatDate('word')}\n\nPortfolio Value: $${totalValue.portfolioValue.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')}\n($${totalValue.portfolioGains.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')}/${totalValue.portfolioGrowth.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')}%)`
    };
     
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log(`Success. SMS sent to ${recipient}`, info.response);
        }
    });
}

let processStock = (symbol) => {
    return new Promise((resolve, reject) => resolve(stock.getInfo(symbol)))
}

let processCrypto = (symbol) => {
    return new Promise((resolve, reject) => resolve(superagent.get(symbol)))
}

let coinAPI = "https://api.coinmarketcap.com/v1/ticker/";

let processLoop = (asset) => {
    let promises = [];
    // return new Promise((resolve, reject) => {
        for (let a in asset) {
            if (asset[a].type=='stock') {
                promises.push(processStock(asset[a].symbol.toLowerCase())
                .then((res) => {
                    asset[a].exchange = res.exchange;
                    asset[a].price = res.price;
                    asset[a].priceChange = res.priceChange;
                    asset[a].priceChangePercent = res.priceChangePercent;
                    // fullAsset.push(asset[a]);
                    console.log('getAsset during processing loop',asset[a])
                    // console.log('fullAsset',fullAsset)
                    return asset[a]
                }).catch(console.error))
            }
            if (asset[a].type=='crypto') {
                promises.push(processCrypto(coinAPI+asset[a].name)
                .then(res =>  {
                    asset[a].price = res.body[0].price_usd,
                    asset[a].priceChangePercent = res.body[0].percent_change_24h;
                    asset[a].priceChange = parseFloat(asset[a].priceChangePercent * (asset[a].price * .01));
                    console.log('getAsset during processing loop',asset[a])
                    // fullAsset.push(asset[a])
                    // console.log('fullAsset',fullAsset)
                    return asset[a]
                }).catch(console.error))
            }
        }
        Promise.all(promises).then((results) =>{
            return new Promise((resolve, reject) => resolve(asset))    
        })
    // })
}

const isAuthorized = requestBody => {
    // console.log('inside isAuthorized',requestBody)
   return new Promise((resolve, reject) => { 
        resolve(checkLogin(requestBody))
    })
}

/********************* ROUTES *********************/
app.post('/login', (request, response) => {
    console.log('login contents',request.body)
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
    getSnapshots().then(asset => {
            response.render('historical', { asset });
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
        
        Promise.all(promises).then(function(results) {            
            snapshots = JSON.stringify(snapshots);
            if (request.body.refresh) {response.send(asset, snapshots)}
            else {response.render('stats', { asset, snapshots})}
        });

    }).catch(console.error));
});

/* ROUTE 9: Send Email */
app.post('/email/send', (request, response) => {
    let snapshots = [];
    let promises = [];
    let recipient = '';
    let emailData = {};
    let totalValue = {
        portfolioValue: 0, portfolioGrowth: 0, portfolioGains: 0, stockValue: 0, stockGrowth: 0, stockGains: 0, cryptoValue: 0, cryptoGrowth: 0, cryptoGains: 0
    };

    const ref = firebaseApp.database().ref(`users/${__USERID__}/email`); //firebase database
    ref.once('value').then(snap => {
        recipient = snap.val();
        console.log('email recipient is now', recipient);
        // email stats
        promises.push(getAssets().then(asset => {
            for (let a in asset) {
                if (asset[a].type=='stock') {
                    promises.push(stock.getInfo(asset[a].symbol.toLowerCase())
                    .then((res) => {
                        asset[a].exchange = res.exchange;
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
                    }).catch(console.error))
                }
            }
            
            Promise.all(promises).then(function(results) {            
                emailData.portfolio = asset;
                console.log('this is emailData portfolio right before send', emailData.portfolio)
                sendEmail(recipient, emailData, totalValue);
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
    const ref = firebaseApp.database().ref(`users/${__USERID__}/phone`); //firebase database
    ref.once('value').then(snap => {
        recipient = snap.val();
        console.log('email phone is now', recipient);
        recipient= recipient+`@messaging.sprintpcs.com`;
        promises.push(getAssets().then(asset => {
            for (let a in asset) {
                if (asset[a].type=='stock') {
                    promises.push(stock.getInfo(asset[a].symbol.toLowerCase())
                    .then((res) => {
                        asset[a].exchange = res.exchange;
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
                    }).catch(console.error))
                }
            }
            
            Promise.all(promises).then(function(results) {            
                emailData.portfolio = asset;
                console.log('this is emailData portfolio right before send', emailData.portfolio)
                // sendEmail(recipient, emailData, totalValue);
                sendText(recipient, emailData, totalValue);
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

app.get('/hello', (request, response) => {
    // throw 'hello to the people'
    console.log('functions config here',functions.config())
    response.send('this is environemtn var' + functions.config().email.address);
});

app.get('*', (request, response) => {
    // console.log('unknown route request');
    response.send('Sorry, unknown route.');
});
//app.get('*', (req, res) => res.redirect(CLIENT_URL)); // listen for all routes, send to homepage

/********************* LISTEN *********************/
exports.app = functions.https.onRequest(app);