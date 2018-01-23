'use strict';

var app = {};
var __API_URL__ = 'https://portfolioapp2380.firebaseapp.com'; // deployed URL
// var __API_URL__ = 'http://localhost:5000'; // local URL

(function(module) {
    document.querySelector('#login').addEventListener('click',function(event){
        event.preventDefault();

        let info = {
            "username": document.querySelector('#username').value,
            "password": document.querySelector('#password').value
        };

        if (event.target.matches('signin')) {
            // console.log('you cllicked save');
            // console.log(asset);
            sendLogin(info);
            // clearForm();
        } 
    });

    function sendLogin(info) {
        // console.log(`this is the url: ${__API_URL__}/add`);
        let xhttp = new XMLHttpRequest();
        xhttp.open('POST', `${__API_URL__}/add`, true);
        xhttp.setRequestHeader('Content-Type', 'application/json');
        xhttp.send(JSON.stringify(asset));
        //.then(console.log('inserting new asset'))
        //.then(() => console.log('asset created!'))
        // console.log('asset created... needs a then')
        document.querySelector('#newForm').remove();
        // refresh();
    }

    function clearForm(){
        document.querySelector('#username').value = '';
        document.querySelector('#password').value = '';
    }
})(app);