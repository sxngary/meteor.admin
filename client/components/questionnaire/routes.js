import { FlowRouter } from 'meteor/kadira:flow-router';

FlowRouter.route('/questionnaire', {
  name: 'questionnaire',
  action() {
    BlazeLayout.render('App_body', { main: 'questionnaire' });
  }
});

FlowRouter.route("/question/:id", {
    name: "question.edit",
    action(params, queryParams) {
        BlazeLayout.render("App_body", {main: "questionForm"});
    }
});