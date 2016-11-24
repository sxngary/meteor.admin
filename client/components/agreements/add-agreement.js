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
	$('#agreement_body').froalaEditor({
        height: 300
    });	
    });
        
    $('#frmAgreement').parsley({
        trigger: 'keyup'
    });
});


Template.viewAgreement.helpers({
    viewAgreementData : function(){
        if(Session.get('viewAgreementData')){
	    return Session.get('viewAgreementData');
	}
    }   
});