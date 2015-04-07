Meteor.methods({
  getContactCSV: function () {
    var contactables = [];
    Utils.filterCollectionByUserHier.call({userId: Meteor.userId()},Contactables.find({
      person: { $exists: true }
    },{
      fields:{
        'person.firstName': 1,
        'person.lastName': 1,
        'userId': 1,
        'contactMethods': 1
      }
    })).forEach(function (c) {
      var user = Meteor.users.findOne(c.userId);

      if (!user) return;
      var email = _.find(c.contactMethods, function (cm) {
        return cm.value.indexOf('@') >= 0;
      });

      contactables.push({
        firstName: c.person.firstName,
        lastName: c.person.lastName,
        email: email && email.value,
        userEmail: user.emails[0].address
      });
    });
    return Baby.unparse(contactables);
  }
});