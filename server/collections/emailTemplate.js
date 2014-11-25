Meteor.publish('emailTemplates', function () {
  return EmailTemplates.find();
});

EmailTemplates.allow({
  insert: function (userId, doc) {
    return true;
  },
  update: function(userId, doc, fieldNames, modifier){
   return true;
  }
});

EmailTemplateMergeFields = new Mongo.Collection('emailTemplateMergeFields');

Meteor.publish('emailTemplateMergeFields', function () {
  return EmailTemplateMergeFields.find();
});

Emails = new Mongo.Collection('emails');