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
                    // asset[a].exchange = res.exchange;
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

module.exports.coinAPI = coinAPI;
module.exports.processStock = processStock;
module.exports.processCrypto = processCrypto;
module.exports.processLoop = processLoop;