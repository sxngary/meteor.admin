import { FlowRouter } from 'meteor/kadira:flow-router';

FlowRouter.route('/questionnaire', {
    triggersEnter: [AccountsTemplates.ensureSignedIn],
    name: 'questionnaire',
    parent: 'dashboard',
    title: 'Questionnaire',
    action() {
        BlazeLayout.render('App_body', { main: 'questionnaire' });
    }
});

FlowRouter.route("/question/:id", {
    triggersEnter: [AccountsTemplates.ensureSignedIn],
    name: "question.edit",
    title: 'Question',
    action(params, queryParams) {
        BlazeLayout.render("App_body", {main: "questionForm"});
    }
});