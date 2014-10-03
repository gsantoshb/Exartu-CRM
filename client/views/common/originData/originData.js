Template.originData.helpers({

  users: function () {
    return Utils.users();
  },
  userName: function () {
    var user = Meteor.users.findOne({_id: this.userId});
    return user ? user.username : 'System';
  },
  hierarchies: function () {
    return Hierarchies.find();
  },
  hierName: function () {
    var hier= Hierarchies.findOne({_id: this.hierId });
    return hier.name;
  }
});