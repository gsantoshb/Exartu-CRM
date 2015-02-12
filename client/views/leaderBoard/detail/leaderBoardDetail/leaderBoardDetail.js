var generateReactiveObject = function(leaderBoard) {
  return new dType.objInstance(leaderBoard, LeaderBoards);
};

var self={};
Utils.reactiveProp(self, 'editMode', false);
var location={};
Utils.reactiveProp(location, 'value', null);

Template.leaderBoardDetail.created=function(){
  self.editMode=false;
};

var leaderBoard;

Template.leaderBoardDetail.helpers({
  leaderBoard: function(){
    var originalLeaderBoard = LeaderBoards.findOne({ _id: Session.get('entityId') });
    Session.set('displayName', originalLeaderBoard.displayName);
    leaderBoard = generateReactiveObject(originalLeaderBoard);
    return leaderBoard;
  },
  originalLeaderBoard:function(){
    return LeaderBoards.findOne({ _id: Session.get('entityId') });
  },
  users :function(){
    return Utils.users();
  },
  userName: function()
  {
    var leaderBoard=LeaderBoards.findOne({_id: this._id });
    return Meteor.users.findOne({_id: leaderBoard.userId}).username;
  },
  editMode:function(){
    return self.editMode;
  },
  colorEdit:function(){
    return self.editMode ? '#008DFC' : '#ddd'
  },
  isType:function(typeName){
    return !! LeaderBoards.findOne({ _id: Session.get('entityId'), objNameArray: typeName});
  },
  leaderBoardCollection: function(){
    return LeaderBoards;
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
    var objs = dType.ObjTypes.find({name: {$in: Enums.leaderBoardCategories}}).fetch();

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

Template.leaderBoardDetail.events({
  'click .editLeaderBoard':function(){
    self.editMode= ! self.editMode;
  },
  'click .saveDetailsButton':function(){
    if (!leaderBoard.validate()) {
      leaderBoard.showErrors();
      return;
    }
    var update=leaderBoard.getUpdate();

    LeaderBoards.update({_id: leaderBoard._id}, update, function(err, result) {
      if (!err) {
        self.editMode=false;
        leaderBoard.reset();
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


Template.leaderBoardDetail.helpers({
  getType: function(){
    return Enums.linkTypes.leaderBoard;
  }
});