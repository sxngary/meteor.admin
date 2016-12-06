import { Agreements } from '/imports/api/agreements/agreements.js';
//Agreements controller events
Template.agreements.events({
    'click .addTemplate': function(event, template){
        event.preventDefault();
        $('#frmAgreement')[0].reset();
        $('#openAgreement').modal("open");
    },
    
    'click .editAgreement': function(event){
        var id = $(event.currentTarget).attr('id');
        var agreementsData = Agreements.findOne({_id:id});
        if (agreementsData) {
            Session.set('agreementData',agreementsData);
            $('#agreement_body').froalaEditor('html.set', agreementsData.agreementBody);
            $('#agreement_body').froalaEditor('events.disableBlur');
            $('#openAgreement').modal('open');
        }
    },
    
    'click #closeTempModal': function(){
        Session.set('agreementData','');
        $('#openAgreement').modal('close');
        $('#viewAgreement').modal('close');
    },
    
    'submit #frmAgreement': function(event,tmp){
        event.preventDefault();
        var agreementName = $('#agreement_name').val();
        var agreementKey = agreementName.toLowerCase().split(" ").join("_");
        
        data  = { 
            agreementName: $('#agreement_name').val(),
            agreementKey: agreementKey,
            agreementTitle: $('#agreement_title').val(), 
            agreementCategory: $('#agreement_category').val(), 
            agreementBody: $('#agreement_body').val(),
            signaturePad: tmp.find('#signature_pad').checked,
            status:true,  
            isDeleted:0
        };
        
        //console.log(data,'data');
        var id = (Session.get('agreementData')) ? Session.get('agreementData')._id : '';
        
        Meteor.call('insertAgreementTemplate', data, id, function(err, res){
            if(err){
                sAlert.error(err.reason, {effect: 'bouncyflip', position: 'top-right', timeout: 5000, onRouteClose: true, stack: false, offset: '80px'});
                //$('#openAgreement').modal('close');
            }else{
                //console.log(res);
                if (res.status) {
                    sAlert.success(res.msg, {effect: 'bouncyflip', position: 'top-right', timeout: 1000, onRouteClose: true, stack: false, offset: '80px'});
                    $('#openAgreement').modal('close');
                }else{
                    sAlert.error(res.msg, {effect: 'bouncyflip', position: 'top-right', timeout: 5000, onRouteClose: true, stack: false, offset: '80px'});
                }
                
            }
        });
    },
    
    'click .deleteAgreement': function(event){
        var id = $(event.currentTarget).attr('id');
        if (confirm("Are you sure you want to delete Agreement?")) {
            Meteor.call('deleteAgreementTemplate',id,function(err,res){
                if(err){
                    console.log(err);
                }else{
                    sAlert.closeAll();
                    sAlert.success('Agreement successfully deleted!', {effect: 'bouncyflip', position: 'top-right', timeout: 1000, onRouteClose: true, stack: false, offset: '80px'});
                }
            });
        }
    },
    
    'click .statusAgreement': function(event){
        var id = $(event.currentTarget).attr('id');
        var status = $(event.currentTarget).attr('data-status');
        Meteor.call('statusAgreementTemplate',id,status,function(err,res){
            if(err){
                console.log(err);
            }else{
                sAlert.closeAll();
                sAlert.success(res+' Status change successfully!', {effect: 'bouncyflip', position: 'top-right', timeout: 1000, onRouteClose: true, stack: false, offset: '80px'});
            }
        });
    },
    
    'click .viewAgreement':function(event,tmp){
        var id = $(event.currentTarget).attr('id');
        var viewAgreementData = Agreements.findOne({_id:id});
        if (viewAgreementData) {
            Session.set('viewAgreementData',viewAgreementData);
            $('#viewAgreement').modal('open');
        }
        
    },
});