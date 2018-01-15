'use strict';

var app = {};
// var __API_URL__ = 'https://portfolioapp2380.firebaseapp.com'; // deployed URL
var __API_URL__ = 'http://localhost:5000'; // local URL

(function(module) {
    // generate modal
    function modal(asset){
        // programatically build div
        let modalBox = document.createElement('div');
        modalBox.setAttribute("id", "newForm");
        modalBox.setAttribute("class", "modal");
        modalBox.innerHTML = 
            `
            <label>Name<input value="" id="name"></label>
            <label>Symbol<input value="" id="symbol"></label>
            <label>Type<input value="" id="type"></label>
            <label>Quantity<input value="" id="quantity"></label>
            <label>Price Paid<input value="" id="purchasePrice"></label>
            <label>Exchange<input value="" id="exchange"></label>
            <input id="currentID">
            `;
        modalBox.innerHTML += 
        `<div class="cancel">Cancel</div><div class="save" id="save">Save</div>`;
        // if asset param exists, fill field value with data
        // if new asset, on save, add 1 to id & send data to firebase as new object. 
        // action makes post request to API. Also passes key pulled from env
        document.querySelector("body").append(modalBox);
        if (asset) {
            console.log('there is an asset id', asset);
            console.log(asset)
            // console.log('there is an asset id', asset.target.parentElement.className);
            document.querySelector('#name').value = asset.name;
            document.querySelector('#symbol').value = asset.symbol;
            document.querySelector('#type').value = asset.type;
            document.querySelector('#quantity').value = asset.quantity;
            document.querySelector('#purchasePrice').value = asset.purchasePrice;
            document.querySelector('#exchange').value = asset.exchange;
            document.querySelector('#currentID').value = asset.id;
        }
        modalListeners();
    }

    document.querySelector('#assetList').addEventListener('click', (event) => {
        if (event.target.matches('.edit')) {
            console.log('hello edit',event);
            let eventID = event.target.parentElement.className;
            loadRecord(eventID);
            // modal(event);
        }
    })

    document.querySelector('.addNew').addEventListener('click', (event) => {
        modal();
    })
    
    function modalListeners() {
        let newAsset = document.querySelector('#newForm');
        if (newAsset) {
            document.querySelector('#newForm').addEventListener('click',function(event){
                event.preventDefault();

                let asset = {
                    "name": document.querySelector('#name').value,
                    "symbol": document.querySelector('#symbol').value,
                    "type": document.querySelector('#type').value,
                    "quantity": document.querySelector('#quantity').value,
                    "purchasePrice": document.querySelector('#purchasePrice').value,
                    "exchange": document.querySelector('#exchange').value,
                    "currentID": document.querySelector('#currentID').value,
                    "id": document.querySelectorAll('#assetList.tr').length
                };

                if (event.target.matches('div.save')) {
                    console.log('you cllicked save');
                    console.log(asset);
                    asset.currentID ? updateRecord(asset) : insertRecord(asset);
                    clearForm();
                }
                if (event.target.matches('div.cancel')) {
                    console.log('modal removed')
                    newAsset.remove();
                } 
            });
        }
    }
    
    function insertRecord(asset) {
        console.log(`this is the url: ${__API_URL__}/add`);
        let xhttp = new XMLHttpRequest();
        xhttp.open('POST', `${__API_URL__}/add`, true);
        xhttp.setRequestHeader('Content-Type', 'application/json');
        xhttp.send(JSON.stringify(asset));
        //.then(console.log('inserting new asset'))
        //.then(() => console.log('asset created!'))
        console.log('asset created... needs a then')
        document.querySelector('#newForm').remove();
    }

    function updateRecord(asset) {
        console.log(`this is the url: ${__API_URL__}/edit/${asset.currentID}`);
        let xhttp = new XMLHttpRequest();
        xhttp.open('POST', `${__API_URL__}/edit/${asset.currentID}`, true);
        xhttp.setRequestHeader('Content-Type', 'application/json');
        xhttp.send(JSON.stringify(asset));
        //.then(console.log('inserting new asset'))
        //.then(() => console.log('asset created!'))
        console.log('asset updated');
        document.querySelector('#newForm').remove();
    }

    function loadRecord(id) {
        let xhttp = new XMLHttpRequest();
        xhttp.open('GET', `${__API_URL__}/find/${id}`, true);
        xhttp.setRequestHeader('Content-Type', 'application/json');
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                console.log('load record complete, now populting fields')
              populateEditFields(JSON.parse(this.responseText));
            }
        }
        xhttp.send();
        console.log('asset created... needs a then')
    }

    function populateEditFields(data){
        console.log(data);
        for (let i in data.asset) {
            modal(data.asset[i]);
        }
    }

    function clearForm(){
        document.querySelector('#name').value = '';
        document.querySelector('#symbol').value = '';
        document.querySelector('#type').value = '';
        document.querySelector('#quantity').value = '';
        document.querySelector('#purchasePrice').value = '';
        document.querySelector('#exchange').value = '';
    }

    function errorCallback(err) {
        console.error(err);
        module.errorView.initErrorPage(err);
    }

    function feedbackMessage(message) {
        document.querySelector('#feedback').innerHTML = message;
        setTimeout(function() {
        //console.log('delay before hiding');
          document.querySelector('#feedback').innerHTML = '';
        }, 3000);
    }
})(app);