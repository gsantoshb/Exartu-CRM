// Extending the user data that is sent to the client
Meteor.publish(null, function () {
  return Utils.filterCollectionByUserHier.call(this, Meteor.users.find({}, {
    fields: {
      'username': 1,
      'emails': 1,
      'services.google.picture': 1,
      'services.email': 1,
      'profilePictureId': 1,
      "hierId": 1,
      "createdAt": 1,
      "roles": 1,
      "permissions": 1,
      "lastCustomerUsed": 1,
      "inactive":1,
      "hierarchies": 1,
      "currentHierId": 1
    }
  }), {
    hierIdKeyName: 'hierarchies'
  });
});

// Publish user invitations
Meteor.publish('userInvitations', function() {
  return Utils.filterCollectionByUserHier.call(this, UserInvitations.find({}, {fields: {email: 1, sentBy: 1, createdAt: 1, used: 1}}));
});

Meteor.users.allow({
  update: function (userId, file, fields, modifier) {
    var user = Meteor.users.findOne({
      _id: userId
    });

    if (userId == file._id)
      return true;

    if (file.hierId != user.hierId)
      return false;
    if (!_.contains(user.roles, RoleManager.getSystemAdministratorRole()._id))
      return false;
    if (_.any(['dateCreated', 'hierId', 'services'], function (field) {
      return _.contains(fields, field);
    }))
      return false;
    return true;
  }
});

//Meteor.publish("users", function () {
//  return Meteor.users.find({
//    hierId: Utils.getUserHierId(this.userId)
//  });
//});

// Users files

UsersFS = new Document.Collection({
  collection: Meteor.users
});
UsersFS.publish();