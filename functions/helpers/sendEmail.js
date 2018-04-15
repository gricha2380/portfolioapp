const functions = require('firebase-functions'); //for firebase storage
const nodemailer = require('nodemailer'); // email & text message
const formatDate = require('../helpers/formatDate').formatDate;

let sendEmail = (recipient, data, totalValue, userDeliver) => {
    
    let userEmail = process.env.portfolioUserEmail || functions.config().email.address;
    let userPassword = process.env.portfolioUserPassword || functions.config().email.password;
    console.log(`survey recipent is ${recipient}`)
    console.log(`local env email address ${process.env.portfolioUserEmail}`)
    // console.log('probably data portfolio', data.portfolio);
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
    // console.log('whole data portfolio in email',data.portfolio.length+" long", data.portfolio)
    for (let x = 0; x < data.portfolio.length; x++) {
        if (data.portfolio[x]) {
            let price = parseFloat(data.portfolio[x].price);
            let pricePaid = parseFloat(data.portfolio[x].purchasePrice); 
            let quantity = parseFloat(data.portfolio[x].quantity);
            let marketValue = price * quantity;
            let cost = pricePaid * quantity;
            let value = quantity * price;
            let growth = (marketValue / cost) * 100;
            let gain = (price * quantity) - (pricePaid * quantity);
            let gain24 = parseFloat(data.portfolio[x].priceChange);
        
            table.content += `<tr><td ${p}><b>${data.portfolio[x].symbol.toUpperCase()}</b></td><td ${p}>$${price.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')}</td><td ${p}>$${pricePaid.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')}</td><td ${p}>${quantity}</td><td ${p}>$${cost.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')}</td><td ${p}>$${value.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')}</td><td ${p}>${growth.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')}%</td><td ${p}>$${gain.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')}</td>`
            gain24 > 0 ? table.content += `<td ${p}><span style="color:green">$${gain24.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')}</span></td></tr>` : table.content += `<td ${p}><span style="color:red">$${gain24.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')}</span></td></tr>`;
        }
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

module.exports.sendEmail = sendEmail;