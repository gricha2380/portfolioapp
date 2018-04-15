const functions = require('firebase-functions'); //for firebase storage
const nodemailer = require('nodemailer'); // email & text message
const formatDate = require('../helpers/formatDate').formatDate;

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

module.exports.sendText = sendText;