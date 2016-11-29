import { AccountsTemplates } from 'meteor/useraccounts:core';

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
