
var selectedHier = new ReactiveVar();
HierarchiesManagementController = RouteController.extend({
  layoutTemplate: 'mainLayout',
  template: 'hierarchiesManagement',
  waitOn: function () {
    return [HierarchiesHandler];
  },
  action: function () {
    selectedHier.set(Hierarchies.findOne(Meteor.user() && Meteor.user().currentHierId));
    this.render();
  }
});

var query = new Utils.ObjectDefinition({
    reactiveProps: {
        searchString: {}
    }
});

Template.hierarchiesManagement.helpers({
  filters: function () {
    return query;
  },
  isAdmin: function () {
    return Utils.adminSettings.isAdmin();
  },
  hierarchies: function () {
    var queryObj = query.getObject();
    var q = {};
    if (queryObj.searchString) {
      q.name = {$regex: queryObj.searchString, $options: 'i'};
    }
    q._id = {$in: Meteor.user().hierarchies};
    return Hierarchies.find(q, {sort: {name: 1}});
  },
  selected: function () {
    return selectedHier.get();
  },
  hierarchySchema: function () {
    return hierarchySchema;
  },

  applicantCenterUrl: function () {
    var hier = Hierarchies.findOne({_id: Meteor.user().currentHierId});
    var webName = hier.configuration.webName;
    return __meteor_runtime_config__.applicantCenterUrl + webName;
  }
});


var getChildrenQuery = function (hierId) {
  return {_id: {$regex: '^' + hierId + '-(\\w)*$'}};
};

Template.recursiveHierarchies.helpers({
  hasChilds: function () {
    return Hierarchies.find(getChildrenQuery(this._id)).count() > 0;
  },
  isSelected: function () {
    return selectedHier.get() && selectedHier.get()._id == this._id;
  },
  isCurrent: function () {
    return Meteor.user().currentHierId == this._id;
  },
  childHiers: function () {
    return Hierarchies.find(getChildrenQuery(this._id), {sort: {name: 1}});
  }
});

Template.recursiveHierarchies.events({
  'click .hierarchyItem': function (e) {
    if (selectedHier.get() == this)
      selectedHier.set(undefined);
    else
      selectedHier.set(this);
  },
  'click .makeCurrent': function (e) {
    if (this && this.inactive  || Meteor.user().currentHierId == this._id) return;

    Meteor.call('changeCurrentHierId', this._id, function (err, result) {
      if (err)
        console.error(err);
      else {
        Meteor.disconnect();
        Meteor.reconnect();
      }
    })
  }
});


// A simple schema for editing the hierarchy
var hierarchySchema = new SimpleSchema({
  name: {
    type: String,
    regEx: /.+/
  }
});
AutoForm.hooks({
  hierarchyEdit: {
    onSubmit: function (insertDoc, updateDoc, currentDoc) {
      var self = this;
      Hierarchies.update({_id: selectedHier.get()._id}, updateDoc, function (err, res) {
        self.done();
      });

      return false;
    }
  }
});
