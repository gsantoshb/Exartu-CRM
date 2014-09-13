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

Template.users.helpers({
  users: function () {
    console.log('users',Meteor.users.find().fetch());
    return Meteor.users.find();
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
    console.log('upd',upd, e.target);
    Meteor.users.update({_id: this._id}, upd, function(err) {
      if (err) {
        alert(err);
      };
    });

  }
});


