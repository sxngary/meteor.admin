import './app-body.html';

import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Template } from 'meteor/templating';
//import { ActiveRoute } from 'meteor/zimme:active-route';
import { FlowRouter } from 'meteor/kadira:flow-router';
//import { FlowRouterTitle } from 'meteor/ostrio:flow-router-title';
//import { TAPi18n } from 'meteor/tap:i18n';

import '/client/components/loading.js';
import '/client/components/nav-header.js';

Template.App_body.onRendered(() => {
    jQuery(function($){
        $('.collapsible').collapsible();
        $(".button-collapse").sideNav();
        $('select').material_select();
        $('ul.tabs').tabs();
    })
});

let menuDeps = new Tracker.Dependency();
Template.app_navHeader.helpers({
    //------add active class in sidemenu-----------//
    activeClass:function(routerName){
        //console.log(routerName,'routerName');
        menuDeps.depend();
        if(FlowRouter.current().route.name!=undefined){
            if (FlowRouter.current().route.name == routerName) {
                return 'active';
            }else{
                return '';
            }
        }
    }
});

Template.App_body.events({
    'click .logout'() {
        Meteor.logout(function() {
            FlowRouter.redirect('/signin');
        });
    },
    
    //--------call activeclass from sidemenu--------//
    'click .side-nav .bold'() {
        menuDeps.changed();
    },
    
    //--------call activeclass from breadcurmb------//
    'click .dash-links'() {
        menuDeps.changed();
    }
});
