import { $ } from 'meteor/jquery';
import dataTablesBootstrap from 'datatables.net-bs';
import 'datatables.net-bs/css/dataTables.bootstrap.css';
import Tabular from 'meteor/aldeed:tabular';
import { Agreements } from '/imports/api/agreements/agreements.js';
import './main.html';

Template.agreements.onCreated(function(){
    Session.set("loadingGroup", false);
    Session.set('agreementData','');
    Meteor.subscribe('allAgreements');
});

Template.agreements.onRendered(function(){
    $('.modal').modal({
        //dismissible: false, // Modal can be dismissed by clicking outside of the modal
        //opacity: .5, // Opacity of modal background
        //in_duration: 300, // Transition in duration
        //out_duration: 200, // Transition out duration
        //starting_top: '0%', // Starting top style attribute
        //ending_top: '10%', // Ending top style attribute
        //ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
        //  //alert("Ready");
        //  console.log(modal, trigger);
        //},
        //complete: function() { alert('Closed'); } // Callback for Modal close    
    });    
});

Template.agreements.helpers({
    loadingGroup: function(){
    	return Session.get("loadingGroup");
    },
    agreementsList: function(){
        var agreementsData = Agreements.find({isDeleted:0}).fetch();
        return agreementsData;
    },
    
});
