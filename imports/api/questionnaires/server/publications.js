import { Meteor } from 'meteor/meteor';
import { Questionnaires } from '/imports/api/questionnaires/questionnaires';
import { Categories } from '/imports/api/questionnaires/categories';
import { Questions } from '/imports/api/questionnaires/questions';

Meteor.publish('getAllQuestionnaire', function() {
    return Questionnaires.find({ $or: [{deleted: '0'}, {deleted: {$exists: false} }] });
});

Meteor.publish('questionCategory', function() {
    return Questions.find();
});

Meteor.publish('allCategory', function(arr) {
    return Categories.find( /*{_id:{$in:arr}}*/ );
});

Meteor.publish('categoryQuestion', function(qid) {
    return Questions.find({ category: qid, dependency: [], deleted: '0' });
});

Meteor.publish('dependencyQue', function(id) {
    return Questions.find({ "dependency.dependencyQuestion": id, deleted: '0' });
});

Meteor.publish('getAnswer', function(id) {
    return Answers.find({ _id: id });
});

Meteor.publish('questionnaireItem', function(id) {
    return Questionnaires.find({ _id: id });
});