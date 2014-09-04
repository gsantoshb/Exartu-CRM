
var generateReactiveObject = function(placement) {
  return new dType.objInstance(placement, Placements);
};

var self={};
Utils.reactiveProp(self, 'editMode', false);
var location={};
Utils.reactiveProp(location, 'value', null);

Template.placementDetail.created=function(){
  self.editMode=false;
//  var originalPlacement = Placements.findOne({ _id: Session.get('entityId') });
}
var placement;

Template.placementDetail.helpers({
  placement: function(){
    var originalPlacement = Placements.findOne({ _id: Session.get('entityId') });
    Session.set('placementDisplayName', originalPlacement.displayName);
    if (!placement)
      placement = generateReactiveObject(originalPlacement);
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
  },
  isType:function(typeName){
    return !! Placements.findOne({ _id: Session.get('entityId'), objNameArray: typeName});
  },
  placementCollection: function(){
    return Placements;
  },

  isSelected:function(optionValue, currentValue){
    return optionValue == currentValue;
  },
  location: function(){
    var originalPlacement = Placements.findOne({ _id: Session.get('entityId') });

    location.value= originalPlacement && originalPlacement.location;
    return location;
  }
});

Template.placementDetail.events({
  'click .editPlacement':function(){
    self.editMode= ! self.editMode;
  },
  'click .saveDetailsButton':function(){
    if (!placement.validate()) {
      placement.showErrors();
      return;
    }
    var update=placement.getUpdate();
    var originalPlacement=Placements.findOne({ _id: Session.get('entityId') });
    var oldLocation= originalPlacement.location;
    var newLocation= location.value;

    if ((newLocation && newLocation.displayName) != (oldLocation && oldLocation.displayName)){
      update.$set = update.$set || {};
      update.$set.location = newLocation;
    }

    Placements.update({_id: placement._id}, update, function(err, result) {
      if (!err) {
        self.editMode=false;
        placement.reset();
      }
      else
      {
        alert(err);
      }
    });
  },
  'click .cancelButton':function(){
    self.editMode=false;
  }
});


Template.placementDetail.helpers({
  getType: function(){
    return Enums.linkTypes.placement;
  }
});


