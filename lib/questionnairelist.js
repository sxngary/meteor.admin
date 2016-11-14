import Tabular from 'meteor/aldeed:tabular';
import { Questionnaires } from '../imports/api/questionnaires/questionnaires.js';


import { Template } from 'meteor/templating';
TabularQuestionnaire = {};

Meteor.isClient && Template.registerHelper('TabularQuestionnaire', TabularQuestionnaire);

TabularQuestionnaire.table = new Tabular.Table({
    name: "Questionnairelist",
    collection: Questionnaires,
    columns: [
        {data: "title", title: "Title"},
        {data: "created", title: "CreatedAt",
            render: function(val, type, doc){
                return changeDateFormat(val);
            }
        },
        {data: "modified", title: "ModifiedAt",
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