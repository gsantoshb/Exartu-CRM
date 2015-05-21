/**
 * Created by ramiro on 21/05/15.
 */
Migrations.add({
  version: 29,
  up: function () {
    Hierarchies.find({hiersContact: {$exists: true}}).forEach(function (hier) {
      console.log("migrating: ",hier);
      var newHierArray = [];
      _.each(hier.hiersContact, function (hierId) {
        var h = Hierarchies.findOne({_id: hierId});
        var user = Meteor.users.findOne({_id: h.users[0]});
        var email = user && user.emails[0].address;
        var contactable = Contactables.findOne({"contactMethods": {$elemMatch: {value: email}}})
        if (contactable) {
          newHierArray.push({hier: hierId, contactable: contactable._id});
        }
      })
      Hierarchies.update({_id: hier._id}, {$set: {hiersContact: newHierArray}});
      console.log('Finished migration 29');
    });
  }
});