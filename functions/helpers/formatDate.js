let formatDate = (style) => {
    if (style == 'slash' || !style) {
        let d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();
        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;
        return [month, day, year].join('/');
    }
    else if (style == 'word') {
        let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
        let d = new Date();
        let dateNow = d.getDate();
        let monthNow = d.getMonth();
        let yearNow = d.getFullYear();
        return months[monthNow] +' '+ dateNow + ', ' + yearNow +' ';
    }
    else if (style == 'full') {
        let d = new Date()
        let weekday = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
        let months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
        return weekday[d.getDay()] +' '+ months[d.getMonth()] +' '+ d.getDate() +', '+ d.getFullYear();
    }
}

module.exports.formatDate = formatDate;