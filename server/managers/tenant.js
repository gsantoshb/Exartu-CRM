TenantManager = {
  getTenants: function (query) {
    //  var user = Meteor.users.findOne({ _id: this.userId });
    //  if (_.indexOf(user.roles, Enums.roleFunction.System_Administrator) == -1)  return null;
    //  else
    //  console.log('hiers',Hierarchies.find().fetch());
    console.log('query',query);
    return Hierarchies.find(query).fetch();
  }
};
