import { AccountsTemplates } from 'meteor/useraccounts:core';
 
let pwd = AccountsTemplates.removeField('password');
AccountsTemplates.removeField('email');
AccountsTemplates.addFields([{
    _id: 'email',
    type: 'email',
    required: true,
    displayName: "email",
    re: /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i,
    errStr: 'Invalid email',
  },
pwd
]);

AccountsTemplates.configure({
  defaultLayout: 'home_temp',
  defaultLayoutRegions: {},
  defaultContentRegion: 'main',
    
  // Behavior
  confirmPassword: true,
  enablePasswordChange: true,
  forbidClientAccountCreation: false,
  overrideLoginErrors: true,
  sendVerificationEmail: false,
  lowercaseUsername: false,
  focusFirstInput: true,
  
  // Appearance
  showAddRemoveServices: true,
  showForgotPasswordLink: true,
  showLabels: true,
  showPlaceholders: true,
  showResendVerificationEmailLink: false,
  
  // Client-side Validation
  continuousValidation: true,
  negativeFeedback: true,
  negativeValidation: true,
  positiveValidation: true,
  positiveFeedback: true,
  showValidating: true,
  
  // Privacy Policy and Terms of Use
  //privacyUrl: 'Privacy',
  //termsUrl: 'TermsOfUse',
  
  // Redirects
  //homeRoutePath: '/home',
  redirectTimeout: 2000,
  
  // Hooks
  //onLogoutHook: myLogoutFunc,
  //onSubmitHook: mySubmitFunc,
  //preSignUpHook: myPreSubmitFunc,
  //postSignUpHook: myPostSubmitFunc,
  
  // Texts
  texts: {
    button: {
      signUp: 'Create my Profile'
    },
    inputIcons: {
      isValidating: "",
      hasError: "",
      hasSuccess:""
    },
    socialSignUp: 'Create my Profile',
    socialIcons: {
      'meteor-developer': 'fa fa-rocket'
    },
    title: {
      forgotPwd: 'Recover Your Password'
    }
  },

});

//if (Meteor.isClient) {
//    T9n.map('en', {
//        error: {
//            accounts: {
//                'Login forbidden': "The email and password you entered don't match"
//            }
//        }
//    });
//}
