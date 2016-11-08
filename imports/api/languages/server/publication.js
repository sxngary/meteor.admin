import { Meteor } from 'meteor/meteor';
import { Languages } from '/imports/api/languages/languages';

Meteor.publish('languages', function(){
  return Languages.find();
});

