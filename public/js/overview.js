'use strict';

var app = {};
var __API_URL__ = 'https://portfolioapp2380.firebaseapp.com'; // deployed URL
// var __API_URL__ = 'http://localhost:5000'; // local URL

(function(module) {
    console.log('is there login?')
  if (window.localStorage.getItem('account')) {
    loadData(window.localStorage.getItem('account'))
  }

  function loadData(info) {
      console.log(info);
      // send account info to server via fetch/POST
      // on server route, look up credentials sameway login works
      // if credientails are valid, run all scripts below
      // if credientials invalid, redirect page

      let myInit = { method: 'POST',
                    body: JSON.stringify(info), 
                    credentials: 'include',
                    headers: new Headers({
                        'Content-Type': 'application/json'
                      }),
                    mode: 'cors',
                    cache: 'default' };

        fetch(`${__API_URL__}/login`, myInit)
        .then(response => {
            if (response.status === 401) {
                console.log('incorrect password')
                window.location.replace('/login');
            } else if (response.status === 242) {
                console.log(`Fully authorized. Loading ${info.username} from localstorage`)
                // do stuff here
            }
            console.log(response.json());

        })
        // .then(response => {console.log(response.status,'status is this');response.json()})
        .catch(error => console.error('Error:', error))
        .then(response => console.log('Success:', response));
  }
})(app);