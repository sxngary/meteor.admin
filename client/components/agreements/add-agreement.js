//Add add Agreement helpers
Template.addAgreement.helpers({
    agreementData:function(){
        if(Session.get('agreementData')){
	    return Session.get('agreementData');
	}
    },
});

//On rendered event of add template.
Template.addAgreement.onRendered(function(){
    $(function() {
        $('#agreement_body').froalaEditor();
    });
        
    $('#frmAgreement').parsley({
        trigger: 'keyup'
    });
});