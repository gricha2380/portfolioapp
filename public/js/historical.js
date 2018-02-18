'use strict';

var app = {};

(function(module) {
    document.querySelector('.addNew').addEventListener('click', (event) => {
        console.log('snapshot clicked')
        updateHistorical();
    })
    
    let updateHistorical = () => {
        let xhttp = new XMLHttpRequest();
        xhttp.open('PUT', `${__API_URL__}/save`, true);
        xhttp.setRequestHeader('Content-Type', 'application/json');
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                console.log('snapshot saved', this.responseText)
                location.reload();   
            }
        }
        xhttp.send();
    }

})(app);