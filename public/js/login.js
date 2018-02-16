'use strict';

var app = {};
// var __API_URL__ = 'https://portfolioapp2380.firebaseapp.com'; // deployed URL
var __API_URL__ = 'http://localhost:5000'; // local URL

(function(module) {
    document.querySelector('#login').addEventListener('click',function(event){
        event.preventDefault();

        let info = {
            "username": document.querySelector('#username').value,
            "password": document.querySelector('#password').value
        };

        if (event.target.matches('#signin')) {
            console.log('you cllicked signin');
            // console.log(asset);
            processLogin(info);
            // clearForm();
        } 
    });

    async function sendLogin(info) {
        // console.log(`this is the url: ${__API_URL__}/add`);
        let xhttp = new XMLHttpRequest();
        xhttp.open('POST', `${__API_URL__}/add`, true);
        xhttp.setRequestHeader('Content-Type', 'application/json');
        xhttp.send(JSON.stringify(info))
        .await((response) => console.log(response))
        // console.log('asset created... needs a then')
        // document.querySelector('#newForm').remove();
        // refresh();
    }

    let processLogin = (info) => {
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
            if (response.status === 400) {
                console.log('incorrect username')
            } else if (response.status === 200) {
                console.log(`Fully authorized. Saving ${info.username} into localstorage`)
                window.localStorage.setItem('account', JSON.stringify(info));
                window.location.replace('/overview');
            }
            console.log(response.json());

        })
        // .then(response => {console.log(response.status,'status is this');response.json()})
        .catch(error => console.error('Error:', error))
        .then(response => console.log('Success:', response));
        // .then(response => {
        //     console.log('Success:', response)
        //     // if (response.status)
        // });
    }
    

    let clearForm = () => {
        document.querySelector('#username').value = '';
        document.querySelector('#password').value = '';
    }
})(app);