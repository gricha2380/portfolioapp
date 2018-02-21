'use strict';

var app = {};

(function(module) {
    // generate modal
    let modal = (asset) =>{
        // programmatically build div
        let modalBox = document.createElement('div');
        modalBox.setAttribute("id", "newForm");
        modalBox.setAttribute("class", "modal");
        modalBox.innerHTML = 
            `
            <div class="inner">
            <label>Name<input value="" id="nameModal"></label>
            <label>Symbol<input value="" id="symbolModal"></label>
            <label>Type<select id="typeModal"><option value="stock">Stock</option><option value="crypto">Crypto</option></select></label>
            <label>Quantity<input value="" id="quantityModal"></label>
            <label>Price Paid<input value="" id="purchasePriceModal"></label>
            <label>Exchange<input value="" id="exchangeModal"></label>
            <input id="currentIDModal">
            </div>
            `;
        modalBox.querySelector('.inner').innerHTML += 
        `<div class="buttonHolder"><div class="secondary button cancel">Cancel</div><div class="primary button save" id="save">Save</div></div>`;
        // if asset param exists, fill field value with data
        // if new asset, on save, add 1 to id & send data to firebase as new object. 
        // action makes post request to API. Also passes key pulled from env
        document.querySelector("body").append(modalBox);
        if (asset) {
            console.log('there is an asset id', asset);
            // console.log(asset)
            // console.log('there is an asset id', asset.target.parentElement.className);
            document.querySelector('#nameModal').value = asset.name;
            document.querySelector('#symbolModal').value = asset.symbol;
            document.querySelector('#typeModal').value = asset.type;
            document.querySelector('#quantityModal').value = asset.quantity;
            document.querySelector('#purchasePriceModal').value = asset.purchasePrice;
            document.querySelector('#exchangeModal').value = asset.exchange;
            document.querySelector('#currentIDModal').value = asset.id;
        } else {
            document.querySelector('#currentIDModal').value = document.querySelectorAll('#assetList #symbol .cell').length+1;
        }
        modalListeners();
    }

    document.querySelector('#assetList').addEventListener('click', (event) => {
        if (event.target.matches('.edit')) {
            showLoader();
            // console.log('edit was clicked',event);
            let eventID = event.target.parentElement.className.split(' ').reverse();
            console.log('eventID',eventID[0]);
            loadRecord(eventID);
        }
    })

    document.querySelector('.addNew').addEventListener('click', (event) => {
        modal();
    })

    document.querySelector('.refresh').addEventListener('click', (event) => {
        console.log('refresh coming soon...')
        // refresh();
    })

    let refresh = () => {
        let xhttp = new XMLHttpRequest();
        xhttp.open('GET', `${__API_URL__}/all`, true);
        xhttp.setRequestHeader('Content-Type', 'application/json');
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                // console.log('load all records complete, now refreshing page', this.responseText)
                document.querySelector('html').innerHTML = this.responseText;
            }
        }
        xhttp.send();
        // console.log('asset created... needs a then')
    }

    let modalListeners = () => {
        let newAsset = document.querySelector('#newForm');
        if (newAsset) {
            document.querySelector('#newForm').addEventListener('click',function(event){
                event.preventDefault();

                let asset = {
                    "name": document.querySelector('#nameModal').value,
                    "symbol": document.querySelector('#symbolModal').value,
                    "type": document.querySelector('#typeModal').value,
                    "quantity": document.querySelector('#quantityModal').value,
                    "purchasePrice": document.querySelector('#purchasePriceModal').value,
                    "exchange": document.querySelector('#exchangeModal').value,
                    "currentID": document.querySelector('#currentIDModal').value,
                    "id": document.querySelectorAll('#assetList #symbol .cell').length+1
                };

                console.log('currentID',asset.currentID);
                if (event.target.matches('div.save')) {
                    // console.log('you cllicked save');
                    
                    asset.currentID ? updateRecord(asset) : insertRecord(asset);
                    // clearForm();
                }
                if (event.target.matches('div.cancel')) {
                    // console.log('modal removed')
                    newAsset.remove();
                } 
            });
        }
    }
    
    let insertRecord = (asset) => {
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

    let updateRecord = (asset) => {
        // console.log(`this is the url: ${__API_URL__}/edit/${asset.currentID}`);
        let xhttp = new XMLHttpRequest();
        xhttp.open('POST', `${__API_URL__}/edit/${asset.currentID}`, true);
        xhttp.setRequestHeader('Content-Type', 'application/json');
        xhttp.send(JSON.stringify(asset));
        //.then(console.log('inserting new asset'))
        //.then(() => console.log('asset created!'))
        // console.log('asset updated', asset);
        document.querySelector('#newForm').remove();
    }

    let loadRecord = (id) => {
        let xhttp = new XMLHttpRequest();
        xhttp.open('GET', `${__API_URL__}/find/${id}`, true);
        xhttp.setRequestHeader('Content-Type', 'application/json');
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                // console.log('load record complete, now populting fields', this.responseText)
                populateEditFields(JSON.parse(this.responseText));
                hideLoader();
            }
        }
        xhttp.send();
        console.log('asset created... needs a then')
    }

    let populateEditFields = (data) => {
        // console.log(data);
        // console.log(data.asset);
        for (let i in data.asset) {
            if (data.asset[i]) {
                // console.log(data.asset[i].id)
                modal(data.asset[i])
            }
        }
        // modal(data.asset);
    }

    let showLoader = () => {
        console.log('showing loader')
        let spinner = document.createElement('div');
        spinner.setAttribute("id", "loader");
        spinner.setAttribute("class", "show");
        document.querySelector("body").append(spinner);
    }

    let hideLoader = () => {
        document.querySelector('#loader').remove();
    }

    let clearForm = () =>{
        document.querySelector('#name').value = '';
        document.querySelector('#symbol').value = '';
        document.querySelector('#type').value = '';
        document.querySelector('#quantity').value = '';
        document.querySelector('#purchasePrice').value = '';
        document.querySelector('#exchange').value = '';
    }

    let errorCallback = (err) => {
        console.error(err);
        module.errorView.initErrorPage(err);
    }

    let feedbackMessage = (message) => {
        document.querySelector('#feedback').innerHTML = message;
        setTimeout(() => {
        //console.log('delay before hiding');
          document.querySelector('#feedback').innerHTML = '';
        }, 3000);
    }
})(app);