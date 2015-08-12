schemaEditPlacement = new SimpleSchema({
  'statusNote': {
    type: String,
    optional: true
  },
  'activeStatus':{
    type:String,
    optional:true
  },
  'candidateStatus':{
    type:String,
    optional:true
  },
  'startDate':{
    type:Date,
    optional:true
  },
  'endDate':{
    type:Date,
    optional:true
  },
  'rateQuote':{
    type:String,
    optional:true
  }
});

var self={};
var editMode = new ReactiveVar(false);
//Utils.reactiveProp(self, 'editMode', false);
var location={};
Utils.reactiveProp(location, 'value', null);

Template.placementDetail.created=function(){
  editMode.set(false);
};

var placement;

Template.placementDetail.helpers({
  placement: function(){
    //var originalPlacement = Placements.findOne({ _id: Session.get('entityId') });
    //Session.set('placementDisplayName', originalPlacement.displayName);
    //placement = generateReactiveObject(originalPlacement);
    return this;
  },
  buttonsActiveStatus: function(){
    var activeArray = LookUps.find({lookUpCode:Enums.lookUpCodes.active_status}).fetch();
    var arrayButtons = _.map(activeArray, function(a){
      return {displayName: a.displayName, value: a._id}
    })
    return arrayButtons;
  },
  getActiveStatus: function(){
    var lookUp = LookUps.findOne({_id:  this.activeStatus});
    return lookUp && lookUp.displayName;
  },
  getCandidateStatus: function(){
    var processStatus = LookUps.findOne({_id:  this.candidateStatus});
    return processStatus.displayName;
  },
  buttonsCandidateStatus: function(){
    var lkCandidate = LookUps.find({lookUpCode:Enums.lookUpCodes.candidate_status}).fetch();
    var arrayButtons = _.map(lkCandidate, function(a){
      return {displayName: a.displayName, value: a._id}
    })
    return arrayButtons;
  },
  originalPlacement:function(){
    return Placements.findOne({ _id: Session.get('entityId') });
  },
  //users :function(){
  //  return Utils.users();
  //},
  //userName: function()
  //{
  //  var placement=Placements.findOne({_id: this._id });
  //  return Meteor.users.findOne({_id: placement.userId}).username;
  //},
  editMode:function(){
    return editMode.get();
  }
  //colorEdit:function(){
  //  return editMode.get() ? '#008DFC' : '#ddd'
  //}
  //isType:function(typeName){
  //  return !! Placements.findOne({ _id: Session.get('entityId'), objNameArray: typeName});
  //},
  //placementCollection: function(){
  //  return Placements;
  //},

  //isSelected:function(optionValue, currentValue){
  //  return optionValue == currentValue;
  //},
  //location: function(){
  //  var originalPlacement = Placements.findOne({ _id: Session.get('entityId') });
  //
  //  location.value= originalPlacement && originalPlacement.location;
  //  return location;
  //},
  //datePickerOptions: function () {
  //  return {
  //    format: "D, MM dd, yyyy",
  //    minViewMode: "days",
  //    startView: "months"
  //  }
  //},
  //fetchOptions: function () {
  //  return this.options.map(function (status) {
  //    return {id: status._id, text: status.displayName};
  //  });
  //},
  //onSelectedStatus: function () {
  //  return function (newStatus) {
  //    var ctx = Template.parentData(2);
  //    ctx.property._value = newStatus;
  //  }
  //}
});

Template.placementDetail.events({
  'click .editPlacement':function(){
    editMode.set(!editMode.get());
  },
  'click .cancelButton':function(){
    editMode.set(false);
  }
});


Template.placementDetail.helpers({
  getType: function(){
    return Enums.linkTypes.placement;
  }
});

AutoForm.hooks({
  updatePlacement: {
    onSubmit: function (insertDoc, updateDoc, currentDoc) {
      debugger;
      Meteor.call('updatePlacement',currentDoc._id, updateDoc, function(err, res){
        editMode.set(false);
      })
      return false;
    }
  }
})