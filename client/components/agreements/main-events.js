import { Agreements } from '/imports/api/agreements/agreements.js';
//Agreements controller events
Template.agreements.events({
    'click .addTemplate': function(event, template){
        event.preventDefault();
        
        $('#openAgreement').modal("open");
    },
    
    'click .editAgreement': function(event){
        var id = $(event.currentTarget).attr('id');
        var agreementsData = Agreements.findOne({_id:id});
        if (agreementsData) {
            Session.set('agreementData',agreementsData);
            $('#agreement_body').froalaEditor('html.set', agreementsData.agreementBody);
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
        data  = { 
            agreementName: $('#agreement_name').val(), 
            agreementTitle: $('#agreement_title').val(), 
            agreementCategory: $('#agreement_category').val(), 
            agreementBody: $('#agreement_body').val(),
            signaturePad:tmp.find('#signature_pad').checked,
            status:true,  
            isDeleted:0
        };
        
        //console.log(data,'data');
        var id = (Session.get('agreementData')) ? Session.get('agreementData')._id : '';
        
        Meteor.call('insertAgreementTemplate', data, id, function(err, res){
            if(err){
                sAlert.error(err.reason, {effect: 'bouncyflip', position: 'top-right', timeout: 5000, onRouteClose: true, stack: false, offset: '80px'});
                $('#openAgreement').modal('close');
            }else{
                if (id) {
                    sAlert.success('Record edit successfully!', {effect: 'bouncyflip', position: 'top-right', timeout: 1000, onRouteClose: true, stack: false, offset: '80px'});
                }else{
                    sAlert.success('Record add successfully!', {effect: 'bouncyflip', position: 'top-right', timeout: 1000, onRouteClose: true, stack: false, offset: '80px'});
                }
                $('#openAgreement').modal('close');
            }
        });
    },
    
    'click .deleteAgreement': function(event){
        var id = $(event.currentTarget).attr('id');
        Meteor.call('deleteAgreementTemplate',id,function(err,res){
            if(err){
                console.log(err);
            }else{
                sAlert.closeAll();
                sAlert.success('Record delete successfully!', {effect: 'bouncyflip', position: 'top-right', timeout: 1000, onRouteClose: true, stack: false, offset: '80px'});
            }
        });
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