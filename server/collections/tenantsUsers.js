
TenantUserView = new View('tenantUsers', {
  collection: Meteor.users,
  cursors: function(tenantUser)
  {
  }
});


Meteor.paginatedPublish(TenantUserView, function()
  {
    var user = Meteor.users.findOne({
      _id: this.userId
    });
    if (!user)
      return false;
    if (!RoleManager.bUserIsSystemAdministrator(user))
      return null;
    return TenantUserView.find();
  },
  {
  pageSize: 100,
  publicationName: 'tenantUsers',
  updateSelector: function (selector, params) {
    if (!params || !params.searchString) return selector;
    var searchStringSelector = {$or: []};
    if (! selector.$or) {
      selector.$or = searchStringSelector.$or;
    } else {
      selector.$and = selector.$and || [];
      selector.$and.push({$or: selector.$or});
      selector.$and.push({$or: searchStringSelector.$or});
      delete selector.$or;
    }

    return selector;

    function generateQueryFromFields(root, fields, string) {
      var q = {$or: []};
      _.forEach(fields, function (f) {
        var fq = {};
        fq[(root? root + '.' : '') + f] = {
          $regex: '.*' + string + '.*',
          $options: 'i'
        };
        q.$or.push(fq);
      });
      return q;
    }
  }
});

