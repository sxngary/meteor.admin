import { Mongo } from 'meteor/mongo';

class QuestionnairesCollection extends Mongo.Collection {
}

export const Questionnaires = new QuestionnairesCollection('questionnaires');

let Schema = {};
Schema.Questionnaires = new SimpleSchema({
    title: {
        type: String
    },
    questions: {
        type: [Object],
        optional: true
    },
    "questions.$.main_index": {
        type: String,
        optional: true
    },
    "questions.$.rank": {
        type: Number,
        decimal: true,
        optional: true
    },
    "questions.$.category_id": {
        type: String,
        optional: true
    },
    "questions.$.question": {
        type: [Object],
        optional: true
    },
    "questions.$.question.$._id": {
        type: String,
        optional: true
    },
    "questions.$.question.$.level": {
        type: String,
        optional: true
    },
    "questions.$.question.$.rank": {
        type: Number,
        optional: true
    },
    "questions.$.question.$.parentQsId": {
        type: String,
        optional: true
    },
    "questions.$.subCategories": {
        type: [Object],
        optional: true
    },
    "questions.$.subCategories.$.subCategory_id": {
        type: String,
        optional: true
    },
    "questions.$.subCategories.$.questions": {
        type: [Object],
        optional: true
    },
    "questions.$.subCategories.$.questions.$._id": {
        type: String,
        optional: true
    },
    "questions.$.subCategories.$.questions.$.level": {
        type: String,
        optional: true
    },
    "questions.$.subCategories.$.questions.$.parentQsId": {
        type: String,
        optional: true
    },
    strap: {
        type: String,
        optional: true
    },
    questionnaireKey: {
        type: String,
        optional: true
    },
    summary: {
        type: String,
        optional: true
    },
    helper: {
        type: String,
        optional: true
    },
    status: {
        type: Boolean,
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
    createdBy: {
        type: String,
        optional: true
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
    "print": {
        type: Object,
        optional: true,
        blackbox: true
    }
});
Questionnaires.attachSchema(Schema.Questionnaires);