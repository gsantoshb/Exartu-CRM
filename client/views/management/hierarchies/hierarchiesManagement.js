HierarchiesManagementController = RouteController.extend({
  layoutTemplate: 'mainLayout',
  waitOn: function () {
    return [HierarchiesHandler];
  },
  data: function () {

  },
  action: function () {
    if (!this.ready()) {
      this.render('loadingContactable')
      return;
    }
    this.render('hierarchiesManagement')
  },
  onAfterAction: function () {

  }
});
var selectedHier = null;
var selectedHierDep = new Deps.Dependency;

// A simple schema for editing the hierarchy
var hierarchySchema = new SimpleSchema({
  name: {
    type: String,
    regEx: /.+/
  }
});
AutoForm.hooks({
  hierarchyEdit : {
    onSubmit: function(insertDoc, updateDoc, currentDoc){
      var self= this;
      Hierarchies.update({_id: selectedHier._id}, updateDoc, function(err, res){
        self.done();
      });

      return false;
    }
  }
});

Template.hierarchiesManagement.created = function(){
  selectedHier = Hierarchies.findOne(Meteor.user() && Meteor.user().currentHierId);
  selectedHierDep.changed();
};

Template.hierarchiesManagement.helpers({
  hierarchies: function(){
    var user = Meteor.user();
    return user && Hierarchies.find({_id: { $in: user.hierarchies}});
  },
  selected: function(){
    selectedHierDep.depend();
    return selectedHier;
  },
  hierarchySchema: function(){
    return hierarchySchema;
  },
  isCurrent: function(){
    return Meteor.user().currentHierId == this._id;
  }
});
Template.hierarchiesManagement.events({
  'click .hierarchyItem': function(e){
    if (selectedHier == this)
      selectedHier = null;
    else
      selectedHier = this;

    selectedHierDep.changed();
    e.stopPropagation();
  },
  'click #addHier': function(){
    if (! selectedHier) return;
    Composer.showModal('hierarchyAdd', selectedHier._id);
  },
  'click .changeCurrent': function(){
    if (! selectedHier) return;

    Meteor.call('changeCurrentHierId', selectedHier._id, function(err, result){
      if (err)
        console.error(err);
      else{
        Meteor.disconnect();
        Meteor.reconnect();
      }
    })
  }

});

var getChildrenQuery = function(hierId){
  return {
    _id: {
      $regex: '^' + hierId + '-(\\w)*$'
    }
  };
};

Template.recursiveHierarchies.helpers({
  childHiers: function(){
    return Hierarchies.find(getChildrenQuery(this._id));
  },
  isCurrent: function(){
    return Meteor.user().currentHierId == this._id;
  },
  isSelectedClass: function(){
    selectedHierDep.depend();
    return ( this._id == (selectedHier && selectedHier._id ) )? 'active' : '';
  },
  hasChilds: function () {
    return Hierarchies.find(getChildrenQuery(this._id)).count() > 0;
  }
})
