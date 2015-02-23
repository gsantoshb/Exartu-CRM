var placementCollection = Placements;

PlacementController = RouteController.extend({
    layoutTemplate: 'mainLayout',
    waitOn: function(){
        return [Meteor.subscribe('placementDetails', this.params._id), GoogleMapsHandler]
    },
    data: function () {
        Session.set('entityId', this.params._id);
    },
    action:function(){
      if (!this.ready()) {
          this.render('loadingContactable');
          return;
      }
      this.render('placement');
      Session.set('activeTab', this.params.tab || 'details');
    },
  onAfterAction: function() {
    var title = Session.get('placementDisplayName'),
      description = 'Placement information';
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

var self={};
Utils.reactiveProp(self, 'editMode', false);
var location={};
Utils.reactiveProp(location, 'value', null);
var services;

Template.placement.created=function(){
  self.editMode = false;
  var originalPlacement=placementCollection.findOne({ _id: Session.get('entityId') });
  var definition={
    reactiveProps:{
      tags:{
        default: originalPlacement.tags,
        update: 'tags',
        type: Utils.ReactivePropertyTypes.array
      }
    }
  };
  services= Utils.ObjectDefinition(definition);
};

var placement;
var job;
var employee;
Template.placement.helpers({
  placement: function(){
    var originalPlacement=placementCollection.findOne({ _id: Session.get('entityId') });
    Session.set('placementDisplayName', originalPlacement.displayName);
    if (originalPlacement.tags==null)
    {
      originalPlacement.tags=[];
    }
    if (!placement)
      placement = new dType.objInstance(originalPlacement, Placements);
    return placement;
  },
  originalPlacement:function(){
    return placementCollection.findOne({ _id: Session.get('entityId') });
  },
  editMode:function(){
      return self.editMode;
  },
  colorEdit:function(){
      return self.editMode ? '#008DFC' : '#ddd'
  },
  employeeDisplayName: function () {
    var employee =  Contactables.findOne(this.employee);
    return employee && employee.displayName;
  },
  jobDisplayName: function () {
    var job =  Jobs.findOne(this.job);
    return job && job.displayName;
  },
  clientId: function () {
    var job =  Jobs.findOne(this.job);
    var client = job && Contactables.findOne(job.client);
    return client && client._id;
  },
  clientDisplayName: function () {
    var job =  Jobs.findOne(this.job);
    var client = job && Contactables.findOne(job.client);
    return client && client.displayName;
  }
});

Template.placement.events({
  'click .editPlacement':function(){
      self.editMode= ! self.editMode;
  },
  'click .saveButton':function(){
    if (!placement.validate()) {
      placement.showErrors();
      return;
    }
    var update=placement.getUpdate();
    var originalPlacement=placementCollection.findOne({ _id: Session.get('entityId') });
    var oldLocation= originalPlacement.location;
    var newLocation= location.value;

    if ((newLocation && newLocation.displayName) != (oldLocation && oldLocation.displayName)){
      update.$set= update.$set || {};
      update.$set.location= newLocation;
    }

    if (services.tags.value.length > 0)
      update.$set.tags = services.tags.value;

    placementCollection.update({_id: placement._id}, update, function(err, result) {
      if (!err) {
        self.editMode=false;
        placement.reset();
      }
    });
  },
  'click .cancelButton':function(){
      self.editMode=false;
  }
});

// Tabs
Template.placement_nav.helpers({
  isActive: function (id) {
    return (id == Session.get('activeTab'))? 'active' : '';
  }
})
var tabs;
Template.placement_nav.helpers({
  tabs: function() {
    tabs = [
//      {id: 'activities', displayName: 'Activities', template: 'entityActivities'},
      {id: 'details', displayName: 'Details', template: 'placement_details'},
      {id: 'notes', displayName: 'Notes', template: 'placement_notes'},
      {id: 'tasks', displayName: 'Tasks', template: 'placement_tasks'}
    ];

    return tabs;
  },
  getEntityId: function () {
    return Session.get('entityId');
  }
});

Template.placement_details.helpers({
  originalPlacement: function () {
    return placementCollection.findOne({_id: Session.get('entityId')});
  }
});

Template.placement.currentTemplate = function () {
  var selected = _.findWhere(tabs ,{id: Session.get('activeTab')});
  return selected && selected.template;
};