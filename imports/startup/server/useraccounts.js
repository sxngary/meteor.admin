import { AccountsTemplates } from 'meteor/useraccounts:core';
import { Roles } from 'meteor/alanning:roles';


//--------remove login attempt limit-----------------//
Accounts.removeDefaultRateLimit();

//-------set roles--------//
const setUserRolesOnSignUp = (userId, info) => {
  Roles.addUsersToRoles(userId, ['admin']);
};

AccountsTemplates.configure({
  postSignUpHook: setUserRolesOnSignUp,
});

//-------check user--------//
Accounts.validateLoginAttempt(function (options) {
    if (options.user && options.allowed) {
        var isAdmin = Roles.userIsInRole(options.user, ['admin'])
        if (!isAdmin) {
            throw new Meteor.Error(403, "Login permission denied!");
        }
    }
    return true;
});


// Meteor.startup(() => {
//   ServiceConfiguration.configurations.update(
//     { "service": "facebook" },
//     {
//       $set: {
//         "appId": "XXXXXXXXXXXXXXX",
//         "secret": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
//       }
//     },
//     { upsert: true }
//   );
// });
