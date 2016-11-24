import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
import { AccountsTemplates } from 'meteor/useraccounts:core';

import '/client/layouts/app-body.js';
import '/client/pages/app-not-found.js';
import '/client/pages/dashboard.js';
import "/lib/agreementlist.js";
import "/lib/commonfunction.js";

FlowRouter.route('/', {
    triggersEnter: [AccountsTemplates.ensureSignedIn],
    name: 'dashboard',
    title: 'Dashboard',
    action() {
        BlazeLayout.render('App_body', { main: 'dashboard_body' });
    },
});

FlowRouter.route('/agreements', {
    triggersEnter: [AccountsTemplates.ensureSignedIn],
    name: 'agreements',
    parent: 'dashboard',
    title: 'Agreements',
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
