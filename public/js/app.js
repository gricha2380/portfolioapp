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
            `;
        modalBox.innerHTML += 
        `<div class="cancel">Cancel</div><div class="save" id="save">Save</div>`;
        // if asset param exists, fill field value with data
        // if new asset, on save, add 1 to id & send data to firebase as new object. 
        // action makes post request to API. Also passes key pulled from env
        if (asset) {
            console.log('there is an asset id', asset.id);
            document.querySelector('#name').value = asset.name;
            document.querySelector('#symbol').value = asset.symbol;
            document.querySelector('#type').value = asset.type;
            document.querySelector('#quantity').value = asset.quantity;
            document.querySelector('#purchasePrice').value = asset.pricePaid;
            document.querySelector('#exchange').value = asset.exchange;
        }
        document.querySelector("body").append(modalBox);
        modalListeners();
    }

    document.querySelector('#assetList').addEventListener('click', (event) => {
        if (event.target.matches('.edit')) {
            console.log('hello edit',event);
            modal();
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
                    "id": document.querySelectorAll('#assetList.tr').length
                };

                if (event.target.matches('div.save')) {
                    console.log('you cllicked save');
                    console.log(asset);
                    insertRecord(asset);
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
        console.log(`this is the object ${JSON.stringify(asset)}`);
        let xhttp = new XMLHttpRequest();
        xhttp.open('POST', `${__API_URL__}/add`, true);
        xhttp.setRequestHeader('Content-Type', 'application/json');
        xhttp.send(JSON.stringify(asset));
        //.then(console.log('inserting new asset'))
        //.then(() => console.log('asset created!'))
        console.log('asset created... needs a then')

        // $.post(`${__API_URL__}/new`, asset)
        //     .then(console.log('inserting new asset'))
        //     .then(() => console.log('asset created!'))
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