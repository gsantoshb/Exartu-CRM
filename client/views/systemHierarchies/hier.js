SystemHierarchyController = RouteController.extend({
  layoutHier: 'mainLayout',
  waitOn: function () {
    return [Meteor.subscribe('systemHierachies')];
  },
  data: function () {
    Session.set('hierId', this.params._id);
  },
  action: function () {
    if (!this.ready()) {
      this.render('loadingContactable');
      return;
    }
    this.render('systemHierarchy')
  },
  onAfterAction: function () {

  }
});


Template.systemHierarchy.helpers({
  hierContext: function () {
    if (Session.get('hierId')) {
      var hier = Hierarchies.findOne(Session.get('hierId'));
      return hier;
    }
  }

});

