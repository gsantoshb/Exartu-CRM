AssignmentController = RouteController.extend({
    layoutTemplate: 'mainLayout',
    waitOn: function(){
        return [AssignmentHandler, ObjTypesHandler, GoogleMapsHandler]
    },
    data: function () {
        Session.set('entityId', this.params._id);
    },
    action:function(){
        if (!this.ready()) {
            this.render('loadingContactable')
            return;
        }
        this.render('assignment')
    },
  onAfterAction: function() {
    var title = 'Assignments / ' + Session.get('assignmentDisplayName'),
      description = 'Assignment information';
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

var generateReactiveObject = function(assignment) {
  return new dType.objInstance(assignment, Assignments);
};

var self={};
Utils.reactiveProp(self, 'editMode', false);
var location={};
Utils.reactiveProp(location, 'value', null);
var services;

Template.assignment.created=function(){
  self.editMode=false;
  var originalAssignment=Assignments.findOne({ _id: Session.get('entityId') });


  var definition={
    reactiveProps:{
      tags:{
        default: originalAssignment.tags,
        update: 'tags',
        type: Utils.ReactivePropertyTypes.array
      }
    }
  };
  services= Utils.ObjectDefinition(definition);
}
var assignment;
Template.assignment.helpers({
  assignment: function(){

    var originalAssignment=Assignments.findOne({ _id: Session.get('entityId') });
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
//  isType:function(typeName){
//    return !! Assignments.findOne({ _id: Session.get('entityId'), objNameArray: typeName});
//  },
//  assignmentCollection: function(){
//    return Assignments;
//  },
//  getCustomer:function(){
//    var j=Assignments.findOne({ _id: Session.get('entityId')});
//    return j && j.customer;
//  },
//  noteCount: function() {
//      return Notes.find({links: { $elemMatch: { id: Session.get('entityId') } }}).count();
//  },
//  isSelected:function(optionValue, currentValue){
//      return optionValue == currentValue;
//    },
//  location: function(){
//    var originalAssignment=Assignments.findOne({ _id: Session.get('entityId') });
//
//    location.value= originalAssignment && originalAssignment.location;
//    return location;
//  },
//  tags: function(){
//    return services.tags;
//  }
});

Template.assignment.events({
  'click .editAssignment':function(){
      self.editMode= ! self.editMode;
  },
  'click .saveButton':function(){
    if (!assignment.validate()) {
      assignment.showErrors();
      return;
    }
    var update=assignment.getUpdate();
    var originalAssignment=Assignments.findOne({ _id: Session.get('entityId') });
    var oldLocation= originalAssignment.location;
    var newLocation= location.value;

    if ((newLocation && newLocation.displayName) != (oldLocation && oldLocation.displayName)){
      update.$set= update.$set || {};
      update.$set.location= newLocation;
    }

    if (services.tags.value.length > 0)
      update.$set.tags = services.tags.value;

    Assignments.update({_id: assignment._id}, update, function(err, result) {
      if (!err) {
        self.editMode=false;
        assignment.reset();
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

Template.assignment.helpers({
//  getType: function(){
//    return Enums.linkTypes.assignment;
//  }
})

