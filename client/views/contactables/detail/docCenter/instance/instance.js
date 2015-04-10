InstanceController = RouteController.extend({
  layoutTemplate: 'mainLayout',

  action: function () {
    if (!this.ready()) {
      this.render('loadingContactable');
      return;
    }
    Session.set('documentInstanceId', this.params.id);
    this.render('docInstance');
  }
});

var isCalling = new ReactiveVar(false),
  isDenying = new ReactiveVar(false);

Template.docInstance.created = function () {
  isCalling.set(false);
  isDenying.set(false);
};

Template.docInstance.helpers({
  id: function () {
    return Session.get('documentInstanceId');
  },
  token: function () {
    return localStorage.getItem('Meteor.loginToken');
  },
  isCalling: function () {
    return isCalling.get();
  },
  isDenying: function () {
    return isDenying.get();
  }
});

Template.docInstance.events({
  'click #approve': function (e, ctx) {
    isCalling.set(true);
    DocCenter.approveDocument(Session.get('documentInstanceId'), function () {
      isCalling.set(false);
      window.history.back();
    })
  },
  'click #deny': function (e, ctx) {
    Utils.showModal('denyDoc');
  }
});


Template.denyDoc.helpers({
  isDenying: function () {
    return isDenying.get();
  }
});
Template.denyDoc.events({
  'click #deny': function (e, ctx) {
    isDenying.set(true);

    var reason = ctx.$('#reason').val();
    DocCenter.denyDocument(Session.get('documentInstanceId'), reason, function () {
      isDenying.set(false);
      Utils.dismissModal();
      window.history.back();
    })
  }
});