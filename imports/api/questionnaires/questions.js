import { Mongo } from 'meteor/mongo';

class QuestionsCollection extends Mongo.Collection {
}

export const Questions = new QuestionsCollection('questions');

var Schema = {};
Schema.Questions = new SimpleSchema({
    question: {
        type: String
    },
    dependency: {
        type: [Object],
        optional: true
    },
    "dependency.$.dependencyQuestion": {
        type: String,
        optional: true
    },
    "dependency.$.dependencyAnswer": {
        type: [Object],
        optional: true
    },
    "dependency.$.dependencyAnswer.$.answers": {
        type: String,
        optional: true
    },
    category: {
        type: String,
        optional: true
    },
    helper: {
        type: String,
        optional: true
    },
    question_type: {// Like text box, select,radio etc
        type: String
    },
    gender: {
        type: String,
        defaultValue: '0'
    },
    key_string: {
        type: String,
        optional: true
    },
    answers: {
        type: [Object],
        optional: true
    },
    "answers.$._id": {
        type: String
    },
    deleted: {
        type: String,
        defaultValue: '0'
    },
    created: {
        type: Date,
        defaultValue: new Date()
    },
    createdBy: {
        type: String
    },
    modified: {
        type: Date,
        autoValue: function () {
            if (this.isUpdate) {
                return new Date();
            }
        },
        denyInsert: true,
        optional: true
    },
    modifiedBy: {
        type: String,
        optional: true
    },
    resetOptionsIndex: {
        type: Number,
        optional: true
    }
});
Questions.attachSchema(Schema.Questions);