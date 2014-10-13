PlacementController = RouteController.extend({
    layoutTemplate: 'mainLayout',
    waitOn: function(){
        return [PlacementHandler, GoogleMapsHandler]
    },
    data: function () {
        Session.set('entityId', this.params._id);
    },
    action:function(){
        if (!this.ready()) {
            this.render('loadingContactable')
            return;
        }
        this.render('placement')
    },
  onAfterAction: function() {
    var title = 'Placements / ' + Session.get('placementDisplayName'),
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
  self.editMode=false;
  var originalPlacement=Placements.findOne({ _id: Session.get('entityId') });
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
    var originalPlacement=Placements.findOne({ _id: Session.get('entityId') });
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
    return Placements.findOne({ _id: Session.get('entityId') });
  },
  editMode:function(){
      return self.editMode;
  },
  colorEdit:function(){
      return self.editMode ? '#008DFC' : '#ddd'
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
    var originalPlacement=Placements.findOne({ _id: Session.get('entityId') });
    var oldLocation= originalPlacement.location;
    var newLocation= location.value;

    if ((newLocation && newLocation.displayName) != (oldLocation && oldLocation.displayName)){
      update.$set= update.$set || {};
      update.$set.location= newLocation;
    }

    if (services.tags.value.length > 0)
      update.$set.tags = services.tags.value;

    Placements.update({_id: placement._id}, update, function(err, result) {
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

var tabs;
Template.placement_tabs.tabs = function() {
  var tabs = [
    {id: 'details', displayName: 'Details', template: 'placement_details'},
    {id: 'notes', displayName: 'Notes', template: 'placement_notes'},
    {id: 'tasks', displayName: 'Tasks', template: 'placement_tasks'},
  ];

  return tabs;
};

Template.placement_tabs.selectedTab = function() {
  return _.findWhere(tabs, {id: Session.get('activeTab')});
};
