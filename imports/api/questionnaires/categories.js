import { Mongo } from 'meteor/mongo';

class CategoriesCollection extends Mongo.Collection {
}

export const Categories = new CategoriesCollection('categories');

let Schema = {};
Schema.Categories = new SimpleSchema({
    cat_name: {
        type: String
    },
    summary: {
        type: String,
        optional: true
    },
    parent: {
        type: String,
        defaultValue: '0'
    },
    child: {
        type: String,
        defaultValue: '0'
    },
    helper: {
        type: String,
        optional: true
    },
    cat_color: {
        type: String,
        optional: true
    },
    question_color: {
        type: String,
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
    }
});
Categories.attachSchema(Schema.Categories);