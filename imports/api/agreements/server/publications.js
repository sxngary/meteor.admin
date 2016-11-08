import { Meteor } from 'meteor/meteor';
import { Agreements } from '/imports/api/agreements/agreements.js';


Meteor.publish('allAgreements', function() {
    return Agreements.find();
});

//Meteor.publish('allCategory', function(arr) {
//    return Categories.find( /*{_id:{$in:arr}}*/ );
//});
//
//Meteor.publish('categoryQuestion', function(qid) {
//    return Questions.find({ category: qid, dependency: [], deleted: '0' });
//});
//
//Meteor.publish('dependencyQue', function(id) {
//    return Questions.find({ "dependency.dependencyQuestion": id, deleted: '0' });
//});
//
//Meteor.publish('getAnswer', function(id) {
//    return Answers.find({ _id: id });
//});
//
//Meteor.publish('questionnaireItem', function(id) {
//    return Questionnaires.find({ _id: id });
//});