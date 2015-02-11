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
  //if template creation from account registration then no userid yet
  if (userId) {
    var user = Meteor.users.findOne({_id: userId});
    doc.hierId = user.currentHierId;
    doc.userId = user._id;
    doc.dateCreated = Date.now();
  }
});

Meteor.publish('emailTemplateMergeFields', function () {
  return EmailTemplateMergeFields.find();
});

Emails = new Mongo.Collection('emails');
Meteor.publish('allEmailTemplates', function () {
    var sub = this;
    Meteor.Collection._publishCursor(Utils.filterCollectionByUserHier.call(this, EmailTemplates.find({} )), sub, 'allEmailTemplates');
    sub.ready();
});