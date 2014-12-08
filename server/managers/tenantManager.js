TenantManager = {
  getTenants: function (query) {
    var hiersWithUser = [];
    var user = Meteor.users.findOne({ _id: this.userId });
//    var sysAdmin=systemAdmins.findOne({_id: user._id});
//    if ( !sysAdmin) return null;
    var hiers = Hierarchies.find(query).fetch();
    var hiersWithUser = [];
    _.each(hiers, function (h) {
      h.firstUser = Meteor.users.findOne({hierarchies: {$in: [h.name]}});
      hiersWithUser.push(h);
    });
    return hiersWithUser;
  }
};
