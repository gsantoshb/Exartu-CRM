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
    Session.set('displayName', originalHotList.displayName);
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

  fetchOptions: function () {
    return this.options.map(function (status) {
      return {id: status._id, text: status.displayName};
    });
  },
  fetchObjTypeOptions: function () {
    var objs = dType.ObjTypes.find({name: {$in: Enums.hotListCategories}}).fetch();

    return objs.map(function (item) {
      return {id: item._id, text: item.name};
    });
  },
  getObjTypeName: function()
  {
    return dType.ObjTypes.findOne({_id: this.value}).name;
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