import { Meteor } from 'meteor/meteor';
import { Agreements } from '/imports/api/agreements/agreements.js';

Meteor.methods({
    
    //----Add and edit Agreements-----//
    insertAgreementTemplate:function(data,id){
        //console.log(data,id,'data,id');
        var result = {};
        if (id) {
            var resultUpdate = Agreements.update({_id:id}, { $set: data });
            if (resultUpdate) {
                result['status'] = true;
                result['msg'] = "Record edit successfully!";
            }else{
                result['status'] = false;
                result['msg'] = "Something wrong.";
            }
        }else{
            if (data.agreementKey) {
                var resultExists = Agreements.find({agreementKey:data.agreementKey}).fetch();
                if (resultExists.length>0) {
                    result['status'] = false;
                    result['msg'] = "Agreement name already exist.";    
                }else{
                    var id = Agreements.insert(data);
                    if (id) {
                        result['status'] = true;
                        result['msg'] = "Agreement add successfully!";
                    }else{
                        result['status'] = false;
                        result['msg'] = "Agreement not add successfully!";
                    }    
                }
            }
        }
        return result;
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
            if (status=="true") {
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
