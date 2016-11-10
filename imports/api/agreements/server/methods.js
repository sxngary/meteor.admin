import { Meteor } from 'meteor/meteor';
import { Agreements } from '/imports/api/agreements/agreements.js';

Meteor.methods({
    
    //----Add and edit Agreements-----//
    insertAgreementTemplate:function(data,id){
        if (id) {
            return Agreements.update({_id:id}, { $set: data });
        }else{
            var id = Agreements.insert(data);
            if (id) {
                return id;
            }
        }
    },
    
    //--------delete Agreements-------//
    deleteAgreementTemplate:function(id){
        if (id) {
            return Agreements.update({_id:id}, { $set: {isDeleted:1} });
        }
    },
    
    //------change status---------//
    statusAgreementTemplate:function(id,status){
        if (id) {
            if (status) {
                var result = Agreements.update({_id:id}, { $set: {status:false} });
                if (result) {
                    return "Inactive";
                }
            }else{
                var result = Agreements.update({_id:id}, { $set: {status:true} });
                if (result) {
                    return "Active";
                }
            }
        }
    }
    
});
