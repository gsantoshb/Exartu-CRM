UsersController = RouteController.extend({
  template: 'users',
  layoutTemplate: 'usersLayout',
  onAfterAction: function () {
    var title = 'Users',
      description = '';
    SEO.set({
      title: title,
      meta: {
        'description': description
      },
      og: {
        'title': title,
        'description': description
      }
    });
  }
});
var query = new Utils.ObjectDefinition({
  reactiveProps: {
    searchString: {}
  }
});
Template.users.helpers({
  users: function () {
    var queryObj = query.getObject();
    var q = {};
    if (queryObj.searchString) {
      q.username = {
        $regex: queryObj.searchString,
        $options: 'i'
      };
    }
    return Meteor.users.find(q);
  },
  filters: function(){
      return query
  }
});
Template.users.events({
  "click .addUser": function () {
    Utils.showModal('addUser');
  },
  'change .inactive': function(e)
  {
    var upd={};
    upd.$set= { inactive: e.target.checked };
    Meteor.users.update({_id: this._id}, upd, function(err) {
      if (err) {
        alert(err);
      };
    });
  },
  'click #resend-email': function() {
    Meteor.call('resendUserVerificationEmail', this._id);
  }
});


