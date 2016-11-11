import Tabular from 'meteor/aldeed:tabular';
import { Agreements } from '../imports/api/agreements/agreements.js';


import { Template } from 'meteor/templating';
TabularTables = {};

Meteor.isClient && Template.registerHelper('TabularTables', TabularTables);

TabularTables.Agreementlist = new Tabular.Table({
    name: "Agreementlist",
    collection: Agreements,
    columns: [
        {data: "agreementName", title: "Name"},
        {data: "agreementTitle", title: "Title"},
        {data: "agreementCategory", title: "Category"},
        {data: "status", title: "Status"},
        {data: "createdAt", title: "CreatedAt",
            render: function(val, type, doc){
                return changeDateFormat(val);
            }
        }
    ]
  
});

changeDateFormat = function(date){
    if (date) {
        var date = new Date(date),
        month = date.getMonth() + 1,
        year  = date.getFullYear(),
        date = date.getDate();
        return month + '/' + date + '/' + year;
    }
}