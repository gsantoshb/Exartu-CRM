Meteor.publish('emailTemplates',  function (searchQuery) {
  if(searchQuery) {
    return Utils.filterCollectionByUserHier.call(this, EmailTemplates.find(searchQuery));
  }
  else{
    return Utils.filterCollectionByUserHier.call(this, EmailTemplates.find());
  }
});

Meteor.publish('categoryEmailTemplates', function(categories) {
  var sub = this;
  var cursor =  Utils.filterCollectionByUserHier.call(this, EmailTemplates.find({category: {$in: categories}}));
  Mongo.Collection._publishCursor(cursor, sub, 'categoryEmailTemplates');
  // _publishCursor doesn't call this for us in case we do this more than once.
  sub.ready();
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
