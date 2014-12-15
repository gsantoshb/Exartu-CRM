TenantView = new View('tenants', {
  collection: Hierarchies,
  cursors: function(tenant)
  {
  }
});


Meteor.paginatedPublish(TenantView, function()
  {
    var user = Meteor.users.findOne({
      _id: this.userId
    });
    if (!user)
      return false;
    if (!RoleManager.bUserIsSystemAdministrator(user))
      return null;
    return TenantView.find();
  },
  {
  pageSize: 50,
  publicationName: 'tenants',
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

