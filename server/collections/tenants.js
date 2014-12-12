TenantView = new View('tenants', {
  collection: Hierarchies,
  cursors: function(tenant) {}
});


//Meteor.publish('tenants', function() {
//  var user = Meteor.users.findOne(this.userId);
//  if (!user)
//    return false;
////  var sysAdmin=systemAdmins.findOne({_id: user._id});
////  if ( !sysAdmin) return null;
//  return Hierarchies.find();
//});


Meteor.paginatedPublish(TenantView, function(){
  var user = Meteor.users.findOne({
    _id: this.userId
  });
  console.log('tenants pag1');
  if (!user)
    return false;
  return  TenantView.find();
  },
  {
  pageSize: 15,
  publicationName: 'tenants',
  updateSelector: function (selector, params) {
    console.log('tenants pag2', selector, params);
    if (!params || !params.searchString) return selector;

    var searchStringSelector = {$or: []};


    // Merge with client selector
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

