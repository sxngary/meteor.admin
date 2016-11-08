import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
import { AccountsTemplates } from 'meteor/useraccounts:core';

import '/client/layouts/app-body.js';
import '/client/pages/app-not-found.js';
import '/client/pages/dashboard.js';
import '/client/components/questionnaire/main.js';

FlowRouter.route('/', {
  name: 'dashboard',
  action() {
    BlazeLayout.render('App_body', { main: 'dashboard_body' });
  },
});

FlowRouter.route('/questionnaire', {
  name: 'questionnaire',
  action() {
    BlazeLayout.render('App_body', { main: 'questionnaire' });
  },
});

FlowRouter.route('/agreements', {
  name: 'agreements',
  action() {
    BlazeLayout.render('App_body', { main: 'agreements' });
  },
});

FlowRouter.notFound = {
  action() {
    BlazeLayout.render('App_body', { main: 'App_notFound' });
  },
};

AccountsTemplates.configureRoute('signIn', {
  name: 'signin',
  path: '/signin',
});

AccountsTemplates.configureRoute('signUp', {
  name: 'join',
  path: '/join',
});

AccountsTemplates.configureRoute('forgotPwd');

AccountsTemplates.configureRoute('resetPwd', {
  name: 'resetPwd',
  path: '/reset-password',
});
