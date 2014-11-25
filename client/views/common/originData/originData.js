Template.originData.helpers({
  users: function () {
    return Utils.users();
  },
  hierarchies: function () {
    return Hierarchies.find();
  },
  hierName: function () {
    var hier= Hierarchies.findOne({_id: this.hierId });
    return hier.name;
  }
});