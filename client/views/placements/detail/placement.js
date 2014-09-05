PlacementController = RouteController.extend({
    layoutTemplate: 'mainLayout',
    waitOn: function(){
        return [PlacementHandler, ObjTypesHandler, GoogleMapsHandler]
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

var generateReactiveObject = function(placement) {
  return new dType.objInstance(placement, Placements);
};

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
}
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
//  job: function(){
//    var asg=Placements.findOne({ _id: Session.get('entityId') });
//    var originalJob=Jobs.findOne({_id: asg.Job});
//    Session.set('jobDisplayName', originalPlacement.displayName);
//    if (!job)
//      job = new dType.objInstance(originalJob, Jobs);
//    return placement;
//  },
//  originalJob:function(){
//
//    var asg=Placements.findOne({ _id: Session.get('entityId') });
//    return Jobs.findOne({_id: asg.job});
//  }
//  employee: function(){
//    var asg=Placements.findOne({ _id: Session.get('entityId') });
//    var originalemployee=Contactables.findOne({_id: asg.employee});
//    Session.set('employeeDisplayName', originalPlacement.displayName);
//    if (!employee)
//      employee = new dType.objInstance(originalemployee, Contactables);
//    return placement;
//  },
//  originalEmployee:function(){
//    var asg=Placements.findOne({ _id: Session.get('entityId') });
//    return Contactables.findOne({_id: asg.employee});
//  }
//  isType:function(typeName){
//    return !! Placements.findOne({ _id: Session.get('entityId'), objNameArray: typeName});
//  },
//  placementCollection: function(){
//    return Placements;
//  },
//  getCustomer:function(){
//    var j=Placements.findOne({ _id: Session.get('entityId')});
//    return j && j.customer;
//  },
//  noteCount: function() {
//      return Notes.find({links: { $elemMatch: { id: Session.get('entityId') } }}).count();
//  },
//  isSelected:function(optionValue, currentValue){
//      return optionValue == currentValue;
//    },
//  location: function(){
//    var originalPlacement=Placements.findOne({ _id: Session.get('entityId') });
//
//    location.value= originalPlacement && originalPlacement.location;
//    return location;
//  },
//  tags: function(){
//    return services.tags;
//  }
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
  },
  'click .add-tag': function() {
    addTag();
  },
  'keypress #new-tag': function(e) {
    if (e.keyCode == 13) {
      e.preventDefault();
      addTag();
    }
  },
  'click .remove-tag': function() {
    services.tags.remove(this.value);
  }
});

var addTag = function() {
  var inputTag = $('#new-tag')[0];

  if (!inputTag.value)
    return;

  if (_.indexOf(services.tags.value, inputTag.value) != -1)
    return;
  services.tags.insert(inputTag.value);
  inputTag.value = '';
  inputTag.focus();
};

Template.placement.helpers({
//  getType: function(){
//    return Enums.linkTypes.placement;
//  }
})

