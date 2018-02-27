'use strict';

var app = {};
// var __API_URL__ = 'https://portfolioapp2380.firebaseapp.com'; // deployed URL
// var __API_URL__ = process.env.portfolioAppURL || 'https://portfolioapp2380.firebaseapp.com' // allow localhost:5000 URL
var __API_URL__ = 'http://localhost:5000'; // local URL

let chartPoints = [];
let exchangePoints = [];
let assets = [];
let none = {'neg':Number.NEGATIVE_INFINITY,'pos':Number.POSITIVE_INFINITY};

// check for login
if (window.localStorage.account) {
    loadData(window.localStorage.account)
} else {window.location.replace('/login');}

let currentUser = window.localStorage.getItem('account');

function loadData(info) {
//   console.log('here is loaded info',info);
  // send account info to server via fetch/POST
  // on server route, look up credentials sameway login works
  // if credientails are valid, run all scripts below
  // if credientials invalid, redirect page

  let myInit = { method: 'POST',
                body: info, 
                credentials: 'include',
                headers: new Headers({'Content-Type': 'application/json'}),
                mode: 'cors',
                cache: 'default'};

    fetch(`${__API_URL__}/login`, myInit)
    .then(response => {
        console.log('this was response...')
        if (response.status === 200) {
            console.log(`Fully authorized. Loading info from localstorage`,JSON.parse(info).username)
            console.log('ready to innit user')
            initUserMenu();
            initUser();
        }
        else {
            console.log('incorrect password')
            window.location.replace('/login');
        }
        console.log(response.json());
    })
    // .then(response => {console.log(response.status,'status is this');response.json()})
    .catch(error => console.error('Error:', error))
    .then(response => console.log('Success:', response));
} // end loadData


function initUserMenu(){
    let header = document.querySelector('#userMenu');
    let userMenu = `<div id='userName' class='menu'>${JSON.parse(currentUser).username}</div><div id='actionList' class='dropdownList menu'><div id='sendEmail' class='menu'>Send Email</div><div id='sendText' class='menu'>Send Text Message</div><div id='logOut' class='menu'>Log Out</div></div>`
    header.innerHTML +=userMenu;

    document.querySelector('#userName').addEventListener('click', function(event){
        event.preventDefault(); // stop button standard action
        console.log('You clicked user menu',this.id);
        expandMenu(this.id); //pass id to menu function
    });

    document.querySelector('#logOut').addEventListener('click',function(event){
        window.localStorage.removeItem('account');
        window.location.replace('/login'); 
    });

    document.querySelector('#sendEmail').addEventListener('click',function(event){
        document.querySelector('.dropdownList.show').classList.remove('show');
        if (document.querySelector('.container')) {document.querySelector('.container').classList.remove('dim')}

        let myInit = { method: 'POST',
                    body: '', 
                    credentials: 'include',
                    headers: new Headers({'Content-Type': 'application/json'}),
                    mode: 'cors',
                    cache: 'default'};

        fetch(`${__API_URL__}/email/send`, myInit)
        .then(response => {
            console.log('email response...')
            if (response.status === 401) {
                console.log('failure')
            } else if (response.status === 200) {
                console.log(`Email sent sucessfully`)
            }
            console.log(response.json());

        })
        // .then(response => {console.log(response.status,'status is this');response.json()})
        .catch(error => console.error('Error:', error))
        .then(response => console.log('Success:', response));
    });

    document.querySelector('#sendText').addEventListener('click',function(event){
        console.log(this.id,'id here');
        document.querySelector('.dropdownList.show').classList.remove('show');
        if (document.querySelector('.container')) {document.querySelector('.container').classList.remove('dim')}

        let myInit = { method: 'POST',
                    body: '', 
                    credentials: 'include',
                    headers: new Headers({'Content-Type': 'application/json'}),
                    mode: 'cors',
                    cache: 'default'};

        fetch(`${__API_URL__}/text/send`, myInit)
        .then(response => {
            console.log('text response...')
            if (response.status === 401) {
                console.log('failure')
            } else if (response.status === 242) {
                console.log(`text sent sucessfully`)
            }
            console.log(response.json());

        })
        // .then(response => {console.log(response.status,'status is this');response.json()})
        .catch(error => console.error('Error:', error))
        .then(response => console.log('Success:', response));
    });

     // when button is clicked, toggle visibility of menu items.
     let expandMenu = (target) => {
    
        // change CSS visibility for specified menu ID
        document.querySelector('#'+target+'+.dropdownList').classList.toggle('show');

        // astetic background blue
        if (document.querySelector('.container')) {document.querySelector('.container').classList.toggle('dim')}

        // hide menu if anything other than button is clicked
        document.querySelector('body').addEventListener('click', function(event){
            // if topic menu exists on page...
            if (document.querySelector('#'+target+'+ .dropdownList')) {
                // if target isn't a button turn off show CSS class
                if (!event.target.matches('.menu')) {
                    document.querySelector('#'+target+'+ .dropdownList').classList.remove('show');
                    if (document.querySelector('.container')) {document.querySelector('.container').classList.remove('dim')}
                }
            }
        });
    } // end expandMenu
}

(function(module) {

    let refresh = document.querySelector('.refresh');
    if (refresh) {
        refresh.addEventListener('click', e => {
            // I need to write a real refresh function someday...
            location.reload();
        })
    }

})(app);