MatchupController = RouteController.extend({
    layoutTemplate: 'mainLayout',
    waitOn: function(){
        return [MatchupHandler, ObjTypesHandler, GoogleMapsHandler]
    },
    data: function () {
        Session.set('entityId', this.params._id);
    },
    action:function(){
        if (!this.ready()) {
            this.render('loadingContactable')
            return;
        }
        this.render('matchup')
    },
  onAfterAction: function() {
    var title = 'Matchups / ' + Session.get('matchupDisplayName'),
      description = 'Matchup information';
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

var generateReactiveObject = function(matchup) {
  return new dType.objInstance(matchup, Matchups);
};

var self={};
Utils.reactiveProp(self, 'editMode', false);
var location={};
Utils.reactiveProp(location, 'value', null);
var services;

Template.matchup.created=function(){
  self.editMode=false;
  var originalMatchup=Matchups.findOne({ _id: Session.get('entityId') });
  var definition={
    reactiveProps:{
      tags:{
        default: originalMatchup.tags,
        update: 'tags',
        type: Utils.ReactivePropertyTypes.array
      }
    }
  };
  services= Utils.ObjectDefinition(definition);
}
var matchup;
var job;
var employee;
Template.matchup.helpers({
  matchup: function(){

    var originalMatchup=Matchups.findOne({ _id: Session.get('entityId') });
    Session.set('matchupDisplayName', originalMatchup.displayName);
    if (originalMatchup.tags==null)
    {
      originalMatchup.tags=[];
    }
    if (!matchup)
      matchup = new dType.objInstance(originalMatchup, Matchups);
    return matchup;
  },
  originalMatchup:function(){
    return Matchups.findOne({ _id: Session.get('entityId') });
  },
  editMode:function(){
      return self.editMode;
  },
  colorEdit:function(){
      return self.editMode ? '#008DFC' : '#ddd'
  }
//  job: function(){
//    var asg=Matchups.findOne({ _id: Session.get('entityId') });
//    var originalJob=Jobs.findOne({_id: asg.Job});
//    Session.set('jobDisplayName', originalMatchup.displayName);
//    if (!job)
//      job = new dType.objInstance(originalJob, Jobs);
//    return matchup;
//  },
//  originalJob:function(){
//
//    var asg=Matchups.findOne({ _id: Session.get('entityId') });
//    return Jobs.findOne({_id: asg.job});
//  }
//  employee: function(){
//    var asg=Matchups.findOne({ _id: Session.get('entityId') });
//    var originalemployee=Contactables.findOne({_id: asg.employee});
//    Session.set('employeeDisplayName', originalMatchup.displayName);
//    if (!employee)
//      employee = new dType.objInstance(originalemployee, Contactables);
//    return matchup;
//  },
//  originalEmployee:function(){
//    var asg=Matchups.findOne({ _id: Session.get('entityId') });
//    return Contactables.findOne({_id: asg.employee});
//  }
//  isType:function(typeName){
//    return !! Matchups.findOne({ _id: Session.get('entityId'), objNameArray: typeName});
//  },
//  matchupCollection: function(){
//    return Matchups;
//  },
//  getCustomer:function(){
//    var j=Matchups.findOne({ _id: Session.get('entityId')});
//    return j && j.customer;
//  },
//  noteCount: function() {
//      return Notes.find({links: { $elemMatch: { id: Session.get('entityId') } }}).count();
//  },
//  isSelected:function(optionValue, currentValue){
//      return optionValue == currentValue;
//    },
//  location: function(){
//    var originalMatchup=Matchups.findOne({ _id: Session.get('entityId') });
//
//    location.value= originalMatchup && originalMatchup.location;
//    return location;
//  },
//  tags: function(){
//    return services.tags;
//  }
});

Template.matchup.events({
  'click .editMatchup':function(){
      self.editMode= ! self.editMode;
  },
  'click .saveButton':function(){
    if (!matchup.validate()) {
      matchup.showErrors();
      return;
    }
    var update=matchup.getUpdate();
    var originalMatchup=Matchups.findOne({ _id: Session.get('entityId') });
    var oldLocation= originalMatchup.location;
    var newLocation= location.value;

    if ((newLocation && newLocation.displayName) != (oldLocation && oldLocation.displayName)){
      update.$set= update.$set || {};
      update.$set.location= newLocation;
    }

    if (services.tags.value.length > 0)
      update.$set.tags = services.tags.value;

    Matchups.update({_id: matchup._id}, update, function(err, result) {
      if (!err) {
        self.editMode=false;
        matchup.reset();
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

Template.matchup.helpers({
//  getType: function(){
//    return Enums.linkTypes.matchup;
//  }
})

