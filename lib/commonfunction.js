changeDateFormat = function(date){
    if (date) {
        var date = new Date(date),
        month = date.getMonth() + 1,
        year  = date.getFullYear(),
        date = date.getDate();
        return month + '/' + date + '/' + year;
    }
}