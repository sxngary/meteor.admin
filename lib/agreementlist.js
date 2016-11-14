import Tabular from 'meteor/aldeed:tabular';
import { Agreements } from '../imports/api/agreements/agreements.js';


import { Template } from 'meteor/templating';
TabularAgreementTables = {};

Meteor.isClient && Template.registerHelper('TabularAgreementTables', TabularAgreementTables);

TabularAgreementTables.Agreementlist = new Tabular.Table({
    name: "Agreementlist",
    collection: Agreements,
    selector: function (id) {
        return { 'isDeleted': { $ne: 1 }};
    },
    columns: [
        {data: "agreementName", title: "Name"},
        {data: "agreementTitle", title: "Title"},
        {data: "agreementCategory", title: "Category"},
        {data: "status", title: "Status"},
        {data: "createdAt", title: "CreatedAt",
            render: function(val, type, doc){
                return changeDateFormat(val);
            }
        },
        {searchable:false,orderable:false,title: "Action",
            render: function(val, type, row){
                var statusIcon = '';
                if(row.status){
                    statusIcon = '<i class="small material-icons">done</i>';
                }else{
                    statusIcon = '<i class="small material-icons">not_interested</i>';
                }
                return '<a href="javascript:void(0);" id="'+row._id+'" class="editAgreement tooltip"><i class="small material-icons">mode_edit</i><span class="tooltiptext">Edit</span></a><a href="javascript:void(0);" id="'+row._id+'" data-status='+row.status+' class="statusAgreement tooltip">'+statusIcon+'<span class="tooltiptext">Status</span></a><a href="javascript:void(0);" id="'+row._id+'" class="deleteAgreement tooltip"><i class="small material-icons">delete</i><span class="tooltiptext">Delete</span></a><a href="javascript:void(0);" id="'+row._id+'" class="viewAgreement tooltip"><i class="small material-icons">pageview</i><span class="tooltiptext">view Agreement</span></a>';
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