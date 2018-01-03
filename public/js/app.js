'use strict';

var app = {};
var __API_URL__ = 'https://houseapidemo.firebaseapp.com/'; // deployed URL
// var __API_URL__ = 'http://localhost:5000'; // local URL

(function(module) {
    let newHouse = document.querySelector('#newForm');
    if (newHouse) {
        newHouse.addEventListener('submit',function(event){
            event.preventDefault();
            console.log('submit button was clicked');
            let house = {
                name: $('#name').val(),
                address: $('#address').val(),
                color: $('#color').val(),
                rooms: $('#rooms').val(),
                garage: $('#garage').val()
            };
            console.log(house);
            insertRecord(house);
            clearForm();
        });
    }
    function insertRecord(house) {
        $.post(`${__API_URL__}/new`, house)
            .then(console.log('inserting new house'))
            .then(() => console.log('House created!'))
    }
    function clearForm(){
        feedbackMessage('Your house has been submitted!');
        $('#name').val('');
        $('#address').val('');
        $('#color').val('');
        $('#rooms').val('');
        $('#garage').val('');
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


// $('#new-book-form').on('submit', bookView.addBook);