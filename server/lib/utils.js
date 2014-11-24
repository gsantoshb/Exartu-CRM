systemLookUps = [];

Utils = {};

_.extend( Utils, {
  getUserHiers: function () {
    var userHierarchies = [];
    _.forEach( Meteor.user().hierarchies, function (hierarchy) {
      var $or = Utils.filterByHiers(hierarchy, '_id');
      userHierarchies = userHierarchies.concat($or);
    });

    return Hierarchies.find({$or: userHierarchies}).fetch();
  },
  getUserHierId: function(userId) {
    if (!userId)
      return undefined;

    var user = Meteor.users.findOne({
      _id: userId
    });

    if (!user)
      return undefined;

    return user.currentHierId;
  },
  filterByHiers: function (hier, key) {
    var accumulated = '';
    var ors = [];
    var key = key || 'hierId';

    _.each(hier.split('-'), function (part) {
      accumulated = accumulated + (accumulated ? '-' : '') + part;
      var aux={};
      aux[key] = {
        $regex: '^' + accumulated + '$'
      };
      ors.push(aux)
    });
    var aux={};
    aux[key] = {
      $regex: '^' + hier + '.*'
    };

    ors.push(aux);

    return ors;
  },
  filterCollectionByUserHier: function(c, options) {
    options = options || {};

    var currentHier = Utils.getUserHierId(this.userId);
    if (!currentHier) {
      return false;
    }

    var hierarchiesQuery = {
      $or: Utils.filterByHiers(currentHier, options.hierIdKeyName)
    };

    var selector = c._cursorDescription.selector;
    if (selector.$or) {
      selector.$and = [];
      selector.$and.push({ $or: selector.$or });
      selector.$and.push(hierarchiesQuery);
      delete selector.$or;
    } else {
      _.extend(selector, hierarchiesQuery);
    }

    return c;
  },
  getLocationDisplayName: function (location) {
    return !location ? '' : (
    (location.address  || '' ) + ' '  +
    (location.address1 || '' ) + ', ' +
    (location.city     || '' ) + ', ' +
    (location.state    || '' ) + ', ' +
    (location.country  || '' ));
  }
});