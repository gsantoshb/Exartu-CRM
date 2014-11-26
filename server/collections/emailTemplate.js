Meteor.publish('emailTemplates', function () {
  return Utils.filterCollectionByUserHier.call(this, EmailTemplates.find());
});

EmailTemplates.allow({
  insert: function (userId, doc) {
    return true;
  },
  update: function(userId, doc, fieldNames, modifier){
   return true;
  }
});
EmailTemplates.before.insert(function (userId, doc) {
    var user = Meteor.user();
    doc.hierId = user.currentHierId;
    doc.userId = user._id;
    doc.dateCreated = Date.now();
});

EmailTemplateMergeFields = new Mongo.Collection('emailTemplateMergeFields');


Meteor.publish('emailTemplateMergeFields', function () {
  return EmailTemplateMergeFields.find();
});

Emails = new Mongo.Collection('emails');