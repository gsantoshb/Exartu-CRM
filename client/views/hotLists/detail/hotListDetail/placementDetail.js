var generateReactiveObject = function(hotList) {
  return new dType.objInstance(hotList, HotLists);
};

var self={};
Utils.reactiveProp(self, 'editMode', false);
var location={};
Utils.reactiveProp(location, 'value', null);

Template.hotListDetail.created=function(){
  self.editMode=false;
};

var hotList;

Template.hotListDetail.helpers({
  hotList: function(){
    var originalHotList = HotLists.findOne({ _id: Session.get('entityId') });
    Session.set('hotListDisplayName', originalHotList.displayName);
    hotList = generateReactiveObject(originalHotList);
    return hotList;
  },
  originalHotList:function(){
    return HotLists.findOne({ _id: Session.get('entityId') });
  },
  users :function(){
    return Utils.users();
  },
  userName: function()
  {
    var hotList=HotLists.findOne({_id: this._id });
    return Meteor.users.findOne({_id: hotList.userId}).username;
  },
  editMode:function(){
    return self.editMode;
  },
  colorEdit:function(){
    return self.editMode ? '#008DFC' : '#ddd'
  },
  isType:function(typeName){
    return !! HotLists.findOne({ _id: Session.get('entityId'), objNameArray: typeName});
  },
  hotListCollection: function(){
    return HotLists;
  },

  isSelected:function(optionValue, currentValue){
    return optionValue == currentValue;
  },
  location: function(){
    var originalHotList = HotLists.findOne({ _id: Session.get('entityId') });

    location.value= originalHotList && originalHotList.location;
    return location;
  },
  datePickerOptions: function () {
    return {
      format: "D, MM dd, yyyy",
      minViewMode: "days",
      startView: "months"
    }
  },
  fetchOptions: function () {
    return this.options.map(function (status) {
      return {id: status._id, text: status.displayName};
    });
  },
  onSelectedStatus: function () {
    return function (newStatus) {
      var ctx = Template.parentData(2);
      ctx.property._value = newStatus;
    }
  }
});

Template.hotListDetail.events({
  'click .editHotList':function(){
    self.editMode= ! self.editMode;
  },
  'click .saveDetailsButton':function(){
    if (!hotList.validate()) {
      hotList.showErrors();
      return;
    }
    var update=hotList.getUpdate();

    HotLists.update({_id: hotList._id}, update, function(err, result) {
      if (!err) {
        self.editMode=false;
        hotList.reset();
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


Template.hotListDetail.helpers({
  getType: function(){
    return Enums.linkTypes.hotList;
  }
});