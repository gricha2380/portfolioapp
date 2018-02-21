let runStats = () =>{
    let portfolioStats = {
        crypto:{
            total: 0, growth:0, gains:0
        },
        stock:{
            total: 0,growth:0,gains:0
        },
        total:{
            total: 0, growth:0, gains:0
        },
        exchanges:{},
        topMovers: {
            today: {
                dollarWinners:[{'value':none.neg},{'value':none.neg},{'value':none.neg},{'value':none.neg},{'value':none.neg}],
                dollarLosers:[{'value':none.pos},{'value':none.pos},{'value':none.pos},{'value':none.pos},{'value':none.pos}],
                percentWinners:[{'value':none.neg},{'value':none.neg},{'value':none.neg},{'value':none.neg},{'value':none.neg}],
                percentLosers:[{'value':none.pos},{'value':none.pos},{'value':none.pos},{'value':none.pos},{'value':none.pos}]
            },
            total : {
                dollarWinners:[{'value':none.neg},{'value':none.neg},{'value':none.neg},{'value':none.neg},{'value':none.neg}],
                dollarLosers:[{'value':none.pos},{'value':none.pos},{'value':none.pos},{'value':none.pos},{'value':none.pos}],
                percentWinners:[{'value':none.neg},{'value':none.neg},{'value':none.neg},{'value':none.neg},{'value':none.neg}],
                percentLosers:[{'value':none.pos},{'value':none.pos},{'value':none.pos},{'value':none.pos},{'value':none.pos}]
            }
        }
    }
    let mapPort = assets.map(x => {
        console.log(x)
        if (x.type == 'crypto') {
            portfolioStats.crypto.total += parseFloat(x.marketValue);
            portfolioStats.crypto.growth += parseFloat(x.totalGrowth);
            portfolioStats.crypto.gains += parseFloat(x.totalGain);
        }
        else if (x.type == 'stock') {
            portfolioStats.stock.total += parseFloat(x.marketValue);
            portfolioStats.stock.growth += parseFloat(x.totalGrowth);
            portfolioStats.stock.gains += parseFloat(x.totalGain);
        }
        portfolioStats.total.total += parseFloat(x.marketValue);
        portfolioStats.total.growth += parseFloat(x.totalGrowth);
        portfolioStats.total.gains += parseFloat(x.totalGain);

        portfolioStats.exchanges[x.exchange] ? portfolioStats.exchanges[x.exchange] += parseFloat(x.marketValue) : portfolioStats.exchanges[x.exchange] = parseFloat(x.marketValue);

        
        x.todayGain = parseFloat(x.todayGain);
        console.log('todayGain value',x.todayGain);
        console.log('todayGain converted type',typeof x.todayGain);

        // dollar winners today
        if (x.todayGain > portfolioStats.topMovers.today.dollarWinners[0].value) {
            console.log('x todatGain is greter',x.todayGain);
            portfolioStats.topMovers.today.dollarWinners[0] = {'symbol':x.symbol,'value':x.todayGain}
        }
        else if (x.todayGain > portfolioStats.topMovers.today.dollarWinners[1].value) {
            console.log('checking second level comparison');
            portfolioStats.topMovers.today.dollarWinners[1] = {'symbol':x.symbol,'value':x.todayGain}
        }
        else if (x.todayGain > portfolioStats.topMovers.today.dollarWinners[2].value) {
            console.log('comparison3 is '+ x.todayGain +' > '+portfolioStats.topMovers.today.dollarWinners[2].value);
            portfolioStats.topMovers.today.dollarWinners[2] = {'symbol':x.symbol,'value':x.todayGain}
        }
        else if (x.todayGain > portfolioStats.topMovers.today.dollarWinners[3].value) {
            portfolioStats.topMovers.today.dollarWinners[3] = {'symbol':x.symbol,'value':x.todayGain}
        }
        else if (x.todayGain > portfolioStats.topMovers.today.dollarWinners[4].value) {
            portfolioStats.topMovers.today.dollarWinners[4] = {'symbol':x.symbol,'value':x.todayGain}
        }
        console.log('all the winers',portfolioStats.topMovers.today.dollarWinners);

        // dollar losers today
        if (x.todayGain < portfolioStats.topMovers.today.dollarLosers[0].value) {
            console.log('x todatGain is greter',x.todayGain);
            portfolioStats.topMovers.today.dollarLosers[0] = {'symbol':x.symbol,'value':x.todayGain}
        }
        else if (x.todayGain < portfolioStats.topMovers.today.dollarLosers[1].value) {
            console.log('checking second level comparison');
            portfolioStats.topMovers.today.dollarLosers[1] = {'symbol':x.symbol,'value':x.todayGain}
        }
        else if (x.todayGain < portfolioStats.topMovers.today.dollarLosers[2].value) {
            console.log('comparison3 is '+ x.todayGain +' < '+portfolioStats.topMovers.today.dollarLosers[2].value);
            portfolioStats.topMovers.today.dollarLosers[2] = {'symbol':x.symbol,'value':x.todayGain}
        }
        else if (x.todayGain < portfolioStats.topMovers.today.dollarLosers[3].value) {
            portfolioStats.topMovers.today.dollarLosers[3] = {'symbol':x.symbol,'value':x.todayGain}
        }
        else if (x.todayGain < portfolioStats.topMovers.today.dollarLosers[4].value) {
            portfolioStats.topMovers.today.dollarLosers[4] = {'symbol':x.symbol,'value':x.todayGain}
        }
        console.log('todays dollar losers',portfolioStats.topMovers.today.dollarLosers);

        // percent losers today
        if (x.todayPercent < portfolioStats.topMovers.today.percentLosers[0].value) {
            console.log('x todatGain is greter',x.todayPercent);
            portfolioStats.topMovers.today.percentLosers[0] = {'symbol':x.symbol,'value':x.todayPercent}
        }
        else if (x.todayPercent < portfolioStats.topMovers.today.percentLosers[1].value) {
            console.log('checking second level comparison');
            portfolioStats.topMovers.today.percentLosers[1] = {'symbol':x.symbol,'value':x.todayPercent}
        }
        else if (x.todayPercent < portfolioStats.topMovers.today.percentLosers[2].value) {
            console.log('comparison3 is '+ x.todayPercent +' < '+portfolioStats.topMovers.today.percentLosers[2].value);
            portfolioStats.topMovers.today.percentLosers[2] = {'symbol':x.symbol,'value':x.todayPercent}
        }
        else if (x.todayPercent < portfolioStats.topMovers.today.percentLosers[3].value) {
            portfolioStats.topMovers.today.percentLosers[3] = {'symbol':x.symbol,'value':x.todayPercent}
        }
        else if (x.todayPercent < portfolioStats.topMovers.today.percentLosers[4].value) {
            portfolioStats.topMovers.today.percentLosers[4] = {'symbol':x.symbol,'value':x.todayPercent}
        }
        console.log('todays percent losers',portfolioStats.topMovers.today.percentLosers);
        
        // percent winners today
        if (x.todayPercent > portfolioStats.topMovers.today.percentWinners[0].value) {
            console.log('x todatGain is greter',x.todayPercent);
            portfolioStats.topMovers.today.percentWinners[0] = {'symbol':x.symbol,'value':x.todayPercent}
        }
        else if (x.todayPercent > portfolioStats.topMovers.today.percentWinners[1].value) {
            console.log('checking second level comparison');
            portfolioStats.topMovers.today.percentWinners[1] = {'symbol':x.symbol,'value':x.todayPercent}
        }
        else if (x.todayPercent > portfolioStats.topMovers.today.percentWinners[2].value) {
            console.log('comparison3 is '+ x.todayPercent +' > '+portfolioStats.topMovers.today.percentWinners[2].value);
            portfolioStats.topMovers.today.percentWinners[2] = {'symbol':x.symbol,'value':x.todayPercent}
        }
        else if (x.todayPercent > portfolioStats.topMovers.today.percentWinners[3].value) {
            portfolioStats.topMovers.today.percentWinners[3] = {'symbol':x.symbol,'value':x.todayPercent}
        }
        else if (x.todayPercent > portfolioStats.topMovers.today.percentWinners[4].value) {
            portfolioStats.topMovers.today.percentWinners[4] = {'symbol':x.symbol,'value':x.todayPercent}
        }
        console.log('todays percent winners',portfolioStats.topMovers.today.percentWinners);
        
        // percent losers total
        if (x.totalGrowth < portfolioStats.topMovers.total.percentLosers[0].value) {
            console.log('x todatGain is greter',x.totalGrowth);
            portfolioStats.topMovers.total.percentLosers[0] = {'symbol':x.symbol,'value':x.totalGrowth}
        }
        else if (x.totalGrowth < portfolioStats.topMovers.total.percentLosers[1].value) {
            console.log('checking second level comparison');
            portfolioStats.topMovers.total.percentLosers[1] = {'symbol':x.symbol,'value':x.totalGrowth}
        }
        else if (x.totalGrowth < portfolioStats.topMovers.total.percentLosers[2].value) {
            console.log('comparison3 is '+ x.totalGrowth +' < '+portfolioStats.topMovers.total.percentLosers[2].value);
            portfolioStats.topMovers.total.percentLosers[2] = {'symbol':x.symbol,'value':x.totalGrowth}
        }
        else if (x.totalGrowth < portfolioStats.topMovers.total.percentLosers[3].value) {
            portfolioStats.topMovers.total.percentLosers[3] = {'symbol':x.symbol,'value':x.totalGrowth}
        }
        else if (x.totalGrowth < portfolioStats.topMovers.total.percentLosers[4].value) {
            portfolioStats.topMovers.total.percentLosers[4] = {'symbol':x.symbol,'value':x.totalGrowth}
        }
        console.log('totals percent losers',portfolioStats.topMovers.total.percentLosers);
        
        // percent winners total
        if (x.totalGrowth > portfolioStats.topMovers.total.percentWinners[0].value) {
            console.log('x todatGain is greter',x.totalGrowth);
            portfolioStats.topMovers.total.percentWinners[0] = {'symbol':x.symbol,'value':x.totalGrowth}
        }
        else if (x.totalGrowth > portfolioStats.topMovers.total.percentWinners[1].value) {
            console.log('checking second level comparison');
            portfolioStats.topMovers.total.percentWinners[1] = {'symbol':x.symbol,'value':x.totalGrowth}
        }
        else if (x.totalGrowth > portfolioStats.topMovers.total.percentWinners[2].value) {
            console.log('comparison3 is '+ x.totalGrowth +' > '+portfolioStats.topMovers.total.percentWinners[2].value);
            portfolioStats.topMovers.total.percentWinners[2] = {'symbol':x.symbol,'value':x.totalGrowth}
        }
        else if (x.totalGrowth > portfolioStats.topMovers.total.percentWinners[3].value) {
            portfolioStats.topMovers.total.percentWinners[3] = {'symbol':x.symbol,'value':x.totalGrowth}
        }
        else if (x.totalGrowth > portfolioStats.topMovers.total.percentWinners[4].value) {
            portfolioStats.topMovers.total.percentWinners[4] = {'symbol':x.symbol,'value':x.totalGrowth}
        }
        console.log('totals percent winners',portfolioStats.topMovers.total.percentWinners);

        // dollar losers
        if (x.totalGain < portfolioStats.topMovers.total.dollarLosers[0].value) {
            console.log('x todatGain is greter',x.totalGain);
            portfolioStats.topMovers.total.dollarLosers[0] = {'symbol':x.symbol,'value':x.totalGain}
        }
        else if (x.totalGain < portfolioStats.topMovers.total.dollarLosers[1].value) {
            console.log('checking second level comparison');
            portfolioStats.topMovers.total.dollarLosers[1] = {'symbol':x.symbol,'value':x.totalGain}
        }
        else if (x.totalGain < portfolioStats.topMovers.total.dollarLosers[2].value) {
            console.log('comparison3 is '+ x.totalGain +' < '+portfolioStats.topMovers.total.dollarLosers[2].value);
            portfolioStats.topMovers.total.dollarLosers[2] = {'symbol':x.symbol,'value':x.totalGain}
        }
        else if (x.totalGain < portfolioStats.topMovers.total.dollarLosers[3].value) {
            portfolioStats.topMovers.total.dollarLosers[3] = {'symbol':x.symbol,'value':x.totalGain}
        }
        else if (x.totalGain < portfolioStats.topMovers.total.dollarLosers[4].value) {
            portfolioStats.topMovers.total.dollarLosers[4] = {'symbol':x.symbol,'value':x.totalGain}
        }
        console.log('all the losers',portfolioStats.topMovers.total.dollarLosers);

        // dollar winners
        if (x.totalGain > portfolioStats.topMovers.total.dollarWinners[0].value) {
            console.log('x todatGain is greter',x.totalGain);
            portfolioStats.topMovers.total.dollarWinners[0] = {'symbol':x.symbol,'value':x.totalGain}
        }
        else if (x.totalGain > portfolioStats.topMovers.total.dollarWinners[1].value) {
            console.log('checking second level comparison');
            portfolioStats.topMovers.total.dollarWinners[1] = {'symbol':x.symbol,'value':x.totalGain}
        }
        else if (x.totalGain > portfolioStats.topMovers.total.dollarWinners[2].value) {
            console.log('comparison3 is '+ x.totalGain +' > '+portfolioStats.topMovers.total.dollarWinners[2].value);
            portfolioStats.topMovers.total.dollarWinners[2] = {'symbol':x.symbol,'value':x.totalGain}
        }
        else if (x.totalGain > portfolioStats.topMovers.total.dollarWinners[3].value) {
            portfolioStats.topMovers.total.dollarWinners[3] = {'symbol':x.symbol,'value':x.totalGain}
        }
        else if (x.totalGain > portfolioStats.topMovers.total.dollarWinners[4].value) {
            portfolioStats.topMovers.total.dollarWinners[4] = {'symbol':x.symbol,'value':x.totalGain}
        }
    })

    console.log('all the winners',portfolioStats.topMovers.total.dollarWinners);

    //portfolio calculations
    document.querySelector('#portfolioTotal').innerHTML = `$${portfolioStats.total.total.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')}`;
    document.querySelector('#portfolioChange').innerHTML = `<span class='textNetural'></span>$${parseFloat(portfolioStats.total.gains).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')} <span class='textNetural'>/</span> ${parseFloat(portfolioStats.total.growth).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')}%<span class='textNetural'></span>`;

    let ofPortfolio = `of portfolio`;
    //stock calculations
    document.querySelector('#stockTotal').innerHTML = `$${portfolioStats.stock.total.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')}`;
    document.querySelector('#stockChange').innerHTML = `<span class='textNetural'></span>$${parseFloat(portfolioStats.stock.gains).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')} <span class='textNetural'>/</span> ${parseFloat(portfolioStats.stock.growth).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')}%<span class='textNetural'></span>`;
    document.querySelector('#stockPercent').innerHTML = `${Math.round(parseFloat((portfolioStats.stock.total/portfolioStats.total.total)*100))}% ${ofPortfolio}`;

    //crypto calculations
    document.querySelector('#cryptoTotal').innerHTML = `$${portfolioStats.crypto.total.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')}`;
    document.querySelector('#cryptoChange').innerHTML = `<span class='textNetural'></span>$${parseFloat(portfolioStats.crypto.gains).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')} <span class='textNetural'>/</span> ${parseFloat(portfolioStats.crypto.growth).toFixed(1).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')}%<span class='textNetural'></span>`;
    document.querySelector('#cryptoPercent').innerHTML = `${Math.round(parseFloat((portfolioStats.crypto.total/portfolioStats.total.total)*100))}% ${ofPortfolio}`


    //exchange allocation
    for (let i in portfolioStats.exchanges) {
        if (portfolioStats.exchanges[i] > 0) {
            document.querySelector('#exchangeHolder').innerHTML += `<div class='exchangeRow grid'><span class='exchange'>${i}</span><span class='value'>$${portfolioStats.exchanges[i].toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')}</span><span class='value'>${((portfolioStats.exchanges[i] / portfolioStats.total.total)*100).toFixed(2)}%</span></div>`;
            exchangePoints.push([i,portfolioStats.exchanges[i]])
        }
    }

    //daily dollar winners
    for (let i=0;i<portfolioStats.topMovers.today.dollarWinners.length;i++) {
        document.querySelector(`#changeDollarWinner${i+1}`).innerHTML = 
        `<div id="changeDollarWinner${i+1}"><span class="symbol">${portfolioStats.topMovers.today.dollarWinners[i].symbol}:</span><span class="value"> $${portfolioStats.topMovers.today.dollarWinners[i].value.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')}</span></div>`
    }

    //daily dollar losers
    for (let i=0;i<portfolioStats.topMovers.today.dollarLosers.length;i++) {
        document.querySelector(`#changeDollarLoser${i+1}`).innerHTML = 
        `<div id="changeDollarLoser${i+1}"><span class="symbol">${portfolioStats.topMovers.today.dollarLosers[i].symbol}:</span><span class="value"> $${portfolioStats.topMovers.today.dollarLosers[i].value.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')}</span></div>`
    }
   
    //daily percent winners TODO
    for (let i=0;i<portfolioStats.topMovers.today.percentWinners.length;i++) {
        document.querySelector(`#changePercentWinner${i+1}`).innerHTML = 
        `<div id="changePercentWinner${i+1}"><span class="symbol">${portfolioStats.topMovers.today.percentWinners[i].symbol}:</span><span class="value"> ${parseInt(portfolioStats.topMovers.today.percentWinners[i].value).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')}%</span></div>`
    }

    //daily percent losers TODO
    for (let i=0;i<portfolioStats.topMovers.today.percentLosers.length;i++) {
        document.querySelector(`#changePercentLoser${i+1}`).innerHTML = 
        `<div id="changePercentLoser${i+1}"><span class="symbol">${portfolioStats.topMovers.today.percentLosers[i].symbol}:</span><span class="value"> ${parseInt(portfolioStats.topMovers.today.percentLosers[i].value).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')}%</span></div>`
    }
    
    //total percent winners TODO
    for (let i=0;i<portfolioStats.topMovers.total.percentWinners.length;i++) {
        document.querySelector(`#percentWinner${i+1}`).innerHTML = 
        `<div id="percentWinner${i+1}"><span class="symbol">${portfolioStats.topMovers.total.percentWinners[i].symbol}:</span><span class="value"> ${parseInt(portfolioStats.topMovers.total.percentWinners[i].value).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')}%</span></div>`
    }

    //total percent losers TODO
    for (let i=0;i<portfolioStats.topMovers.total.percentLosers.length;i++) {
        document.querySelector(`#percentLoser${i+1}`).innerHTML = 
        `<div id="percentLoser${i+1}"><span class="symbol">${portfolioStats.topMovers.total.percentLosers[i].symbol}:</span><span class="value"> ${parseInt(portfolioStats.topMovers.total.percentLosers[i].value).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')}%</span></div>`
    }

    //total dollar losers
    for (let i=0;i<portfolioStats.topMovers.total.dollarLosers.length;i++) {
        document.querySelector(`#dollarLoser${i+1}`).innerHTML = 
        `<div id="dollarLoser${i+1}"><span class="symbol">${portfolioStats.topMovers.total.dollarLosers[i].symbol}:</span><span class="value"> $${parseInt(portfolioStats.topMovers.total.dollarLosers[i].value).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')}</span></div>`
    }
    
    //total dollar wimnners
    for (let i=0;i<portfolioStats.topMovers.total.dollarWinners.length;i++) {
        document.querySelector(`#dollarWinner${i+1}`).innerHTML = 
        `<div id="dollarWinner${i+1}"><span class="symbol">${portfolioStats.topMovers.total.dollarWinners[i].symbol}:</span><span class="value"> $${parseInt(portfolioStats.topMovers.total.dollarWinners[i].value).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')}</span></div>`
    }
    
    
}