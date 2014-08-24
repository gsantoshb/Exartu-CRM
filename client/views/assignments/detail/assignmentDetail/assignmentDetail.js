
var generateReactiveObject = function(assignment) {
  return new dType.objInstance(assignment, Assignments);
};

var self={};
Utils.reactiveProp(self, 'editMode', false);
var location={};
Utils.reactiveProp(location, 'value', null);

Template.assignmentDetail.created=function(){
  self.editMode=false;
//  var originalAssignment = Assignments.findOne({ _id: Session.get('entityId') });
}
var assignment;

Template.assignmentDetail.helpers({
  assignment: function(){
    var originalAssignment = Assignments.findOne({ _id: Session.get('entityId') });
    Session.set('assignmentDisplayName', originalAssignment.displayName);
    if (!assignment)
      assignment = generateReactiveObject(originalAssignment);
    return assignment;
  },
  originalAssignment:function(){
    return Assignments.findOne({ _id: Session.get('entityId') });
  },
  editMode:function(){
    return self.editMode;
  },
  colorEdit:function(){
    return self.editMode ? '#008DFC' : '#ddd'
  },
  isType:function(typeName){
    return !! Assignments.findOne({ _id: Session.get('entityId'), objNameArray: typeName});
  },
  assignmentCollection: function(){
    return Assignments;
  },

  isSelected:function(optionValue, currentValue){
    return optionValue == currentValue;
  },
  location: function(){
    var originalAssignment = Assignments.findOne({ _id: Session.get('entityId') });

    location.value= originalAssignment && originalAssignment.location;
    return location;
  }
});

Template.assignmentDetail.events({
  'click .editAssignment':function(){
    self.editMode= ! self.editMode;
  },
  'click .saveDetailsButton':function(){
    if (!assignment.validate()) {
      assignment.showErrors();
      return;
    }
    var update=assignment.getUpdate();
    var originalAssignment=Assignments.findOne({ _id: Session.get('entityId') });
    var oldLocation= originalAssignment.location;
    var newLocation= location.value;

    if ((newLocation && newLocation.displayName) != (oldLocation && oldLocation.displayName)){
      update.$set = update.$set || {};
      update.$set.location = newLocation;
    }

    Assignments.update({_id: assignment._id}, update, function(err, result) {
      if (!err) {
        self.editMode=false;
        assignment.reset();
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


Template.assignmentDetail.helpers({
  getType: function(){
    return Enums.linkTypes.assignment;
  }
});


