import { Agreements } from '/imports/api/agreements/agreements.js';
//Agreements controller events
Template.agreements.events({
    'click .addTemplate': function(event, template){
        event.preventDefault();
        //$('#openAgreement').openModal({dismissible:false});
        $('#openAgreement').modal("open");
    },
    
    'click .editAgreement': function(event){
        var id = $(event.currentTarget).attr('id');
        var agreementsData = Agreements.findOne({_id:id});
        if (agreementsData) {
            Session.set('agreementData',agreementsData);
            $('#openAgreement').modal('open',{
                dismissible:true,
                ready: function(modal, trigger){
                    alert("Ready");
                    console.log(modal, trigger);
                    $('#agreement_body').text(agreementsData.agreementBody);
                }
            });
        }
    },
    
    'click #closeTempModal': function(){
        $('#openAgreement').modal('close');
    },
    
    'submit #frmAgreement': function(event){
        event.preventDefault();
        data  = { 
            agreementName: $('#agreement_name').val(), 
            agreementTitle: $('#agreement_title').val(), 
            agreementCategory: $('#agreement_category').val(), 
            agreementBody: $('#agreement_body').val(),
            status:true,  
            isDeleted:0
        };
        var id = (Session.get('agreementData')) ? Session.get('agreementData')._id : '';
        Meteor.call('insertAgreementTemplate', data, id, function(err, res){
            if(err){
                console.log(err);
                $('#openAgreement').modal('close');
            }else{
                //sAlert.error(err.reason, {effect: 'bouncyflip', position: 'top-right', timeout: 2000, onRouteClose: true, stack: false, offset: '80px'});
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
                console.log(res,'delete successfully');
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
                console.log(res,'change status successfully');
            }
        });
    },
        
});