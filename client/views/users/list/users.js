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

var showInvitations = false;
var showInvitationsDep = new Deps.Dependency;

Template.users.helpers({
  filters: function () {
    return query;
  },
  usersCount: function () {
    return Meteor.users.find().count();
  },
  invitationsCount: function () {
    return UserInvitations.find({used: {$ne: true}}).count();
  },
  showInvitations: function () {
    showInvitationsDep.depend();
    return showInvitations;
  }
});

Template.users.events({
  "click .addUser": function () {
    Utils.showModal('inviteUser');
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
  'click #showUsers': function() {
    if (showInvitations !== false){
      showInvitations = false;
      showInvitationsDep.changed();
    }
  },
  'click #showInvitations': function() {
    if (showInvitations !== true){
      showInvitations = true;
      showInvitationsDep.changed();
    }
  }
});

// Users

Template.usersList.helpers({
    users : function () {
      var queryObj = query.getObject();
      var q = {};
      if (queryObj.searchString) {
        q.emails = {
          $elemMatch:{
            address: {
              $regex: queryObj.searchString,
              $options: 'i'
            }
          }
        };
      }
      return Meteor.users.find(q,{sort: { 'emails.address':1}});
    }
});

// Invitations

Template.userInvitationsList.helpers({
    invitations : function() {
      var queryObj = query.getObject();
      var q = {
        used: {$ne: true}
      };
      if (queryObj.searchString) {
        q.email = {
          $regex: queryObj.searchString,
          $options: 'i'
        };
      }
      return UserInvitations.find(q,{sort: {email: 1}});
    },
    getUserDisplayName : function(userId) {
      var user = Meteor.users.findOne(userId);
      return user ? user.emails[0].address : undefined;
    }
});

Template.userInvitationsList.events = {
  'click .resend-invitation': function() {
    Meteor.call('resendUserInvitation', this._id);
  },
  'click .delete': function () {
    UserInvitations.remove({_id: this._id});
  }
};

