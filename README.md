# Portfolio App 2 v0.5
Financial portfolio tracking system, built for personal use and for practice with full stack Javascript development.
  
## Features  
* View overall portfolio statistics  
* Compatible with stocks and crypto-currencies
* Receive scheduled email or text message notifications  
* Review portfolio value over time  
* Rank and view daily performance of each asset in your portfolio  
  
## Tech Stack  
**Frontend:**  
* Handlebars  
* ECMAScript 6
 
**Backend:**   
* Node.js & Express.js  
* AsyncAwait for promises  
* Firebase NoSQL Database  
* Google Cloud Platform  
  
## How to Run 🏃‍ locally
Ensure system is running node v6.11.5 (Firebase's request, not mine...)
If necessary, use nvm to cange node versions
`nvm install 6.11.5`
`nvm use 6.11.5`
If you run into issues, see this thread: https://github.com/firebase/functions-samples/issues/267

Tip - Install firebase tools globally:
`sudo npm install -g firebase-tools`

Regular install
`npm install`  
`cd functions && npm install`
Local testing: `firebase serve --only functions,hosting`  
Deploy: `firebase deploy`  