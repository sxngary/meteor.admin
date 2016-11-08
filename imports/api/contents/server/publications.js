import { Meteor } from 'meteor/meteor';
import { Contents } from '/imports/api/contents/contents';

Meteor.publish('getContents', function() {
    return Contents.find();
});