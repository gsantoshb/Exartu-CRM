Template.originData.helpers({

  users: function () {
    return Utils.users();
  },
  userName: function () {
    return Meteor.users.findOne({_id: this.userId}).username;
  },
  hierarchies: function () {
    return Hierarchies.find();
  },
  hierName: function () {
    var hier= Hierarchies.findOne({_id: this.hierId });
    return hier.name;
  }
});