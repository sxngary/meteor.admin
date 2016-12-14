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
//	$('#agreement_body').froalaEditor({
//        height: 300
//    });

	CKEDITOR.replace( 'agreement_body' );
	CKEDITOR.config.toolbarLocation = 'top';
	//CKEDITOR.config.toolbar = 'Basic';
	//CKEDITOR.config.toolbarCanCollapse = true;
    });
        
    $('#frmAgreement').parsley({
        trigger: 'keyup'
    });
});

Template.addAgreement.onDestroyed(function(){
    $('.modal-overlay').css('display','none');
});


Template.viewAgreement.helpers({
    viewAgreementData : function(){
        if(Session.get('viewAgreementData')){
	    return Session.get('viewAgreementData');
	}
    }   
});