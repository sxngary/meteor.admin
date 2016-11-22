import { Mongo } from 'meteor/mongo';

class AgreementsCollection extends Mongo.Collection {}

export const Agreements = new AgreementsCollection('agreements');

Agreements.schema = new SimpleSchema({
    agreementName: {
        type: String,
        max: 200,
        min: 1,
    },
    agreementTitle: {
        type: String,
        max: 500,
        min: 1,
    },
    agreementCategory: {
        type: String,
        max: 200,
        min: 1,
    },
    agreementBody: {
        type: String
    },
    agreementKey: {
        type: String
    },
    signaturePad: {
        type: Boolean
    },
    status: {
        type: Boolean
    },
    isDeleted:{
        type: Number
    },
    createdAt: {
        type: Date,
        label: 'CreatedAt',
        autoValue: function(){
            return new Date();
        }
    },
    modifiedAt: {
        type: Date,
        label: 'CreatedAt',
        autoValue: function(){
            return new Date();
        }
    }
});

Agreements.attachSchema(Agreements.schema);