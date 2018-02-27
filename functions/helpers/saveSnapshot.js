const firebaseApp = require('../helpers/db').firebaseApp;
let __USERID__ = require('../helpers/user').USERID; //log

let saveSnapshot = () => {
    console.log('inside saveSnapshot')
    /* TODO: check cridentials */
    const ref = firebaseApp.database().ref(`users/`); //firebase database
    
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

module.exports.saveSnapshot = saveSnapshot;