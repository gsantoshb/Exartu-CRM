
var generateReactiveObject = function(placement) {
  return new dType.objInstance(placement, Placements);
};

var self={};
Utils.reactiveProp(self, 'editMode', false);
var location={};
Utils.reactiveProp(location, 'value', null);

Template.placementDetail.created=function(){
  self.editMode=false;
}
var placement;

Template.placementDetail.helpers({
  placement: function(){
    var originalPlacement = Placements.findOne({ _id: Session.get('entityId') });
    Session.set('placementDisplayName', originalPlacement.displayName);
    placement = generateReactiveObject(originalPlacement);
    return placement;
  },
  originalPlacement:function(){
    return Placements.findOne({ _id: Session.get('entityId') });
  },
  users :function(){
    return Utils.users();
  },
  userName: function()
  {
    var placement=Placements.findOne({_id: this._id });
    return Meteor.users.findOne({_id: placement.userId}).username;
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


