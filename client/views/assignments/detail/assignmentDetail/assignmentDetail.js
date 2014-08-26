
var generateReactiveObject = function(matchup) {
  return new dType.objInstance(matchup, Matchups);
};

var self={};
Utils.reactiveProp(self, 'editMode', false);
var location={};
Utils.reactiveProp(location, 'value', null);

Template.matchupDetail.created=function(){
  self.editMode=false;
//  var originalMatchup = Matchups.findOne({ _id: Session.get('entityId') });
}
var matchup;

Template.matchupDetail.helpers({
  matchup: function(){
    var originalMatchup = Matchups.findOne({ _id: Session.get('entityId') });
    Session.set('matchupDisplayName', originalMatchup.displayName);
    if (!matchup)
      matchup = generateReactiveObject(originalMatchup);
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
  },
  isType:function(typeName){
    return !! Matchups.findOne({ _id: Session.get('entityId'), objNameArray: typeName});
  },
  matchupCollection: function(){
    return Matchups;
  },

  isSelected:function(optionValue, currentValue){
    return optionValue == currentValue;
  },
  location: function(){
    var originalMatchup = Matchups.findOne({ _id: Session.get('entityId') });

    location.value= originalMatchup && originalMatchup.location;
    return location;
  }
});

Template.matchupDetail.events({
  'click .editMatchup':function(){
    self.editMode= ! self.editMode;
  },
  'click .saveDetailsButton':function(){
    if (!matchup.validate()) {
      matchup.showErrors();
      return;
    }
    var update=matchup.getUpdate();
    var originalMatchup=Matchups.findOne({ _id: Session.get('entityId') });
    var oldLocation= originalMatchup.location;
    var newLocation= location.value;

    if ((newLocation && newLocation.displayName) != (oldLocation && oldLocation.displayName)){
      update.$set = update.$set || {};
      update.$set.location = newLocation;
    }

    Matchups.update({_id: matchup._id}, update, function(err, result) {
      if (!err) {
        self.editMode=false;
        matchup.reset();
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


Template.matchupDetail.helpers({
  getType: function(){
    return Enums.linkTypes.matchup;
  }
});


