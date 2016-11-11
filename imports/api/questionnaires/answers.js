import { Mongo } from 'meteor/mongo';

class AnswersCollection extends Mongo.Collection {
}

export const Answers = new AnswersCollection('answers');

var Schema = {};
Schema.Answers = new SimpleSchema({
    answer_text: {
        type: String,
        optional: true
    },
    answer_value: {
        type: String,
        optional: true
    },
    question: {
        type: String,
        optional: true
    },
    rank: {
        type: Number,
        optional: true
    },
    deleted: {
        type: String,
        defaultValue: '0'
    },
    created: {
        type: Date,
        defaultValue: new Date()
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
    }
});
Answers.attachSchema(Schema.Answers);