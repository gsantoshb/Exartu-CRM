Template.dealActivity.helpers({
  isAny: function(){
    return Activities.find({
      entityId: Session.get('entityId'),
      type: {$in: []}
    }).count()>0;
  },
  activities: function(){
      return Activities.find({
        entityId: Session.get('entityId'),
        type: {$in: []}
      },{sort: {
        'data.dateCreated': -1
      }})
  }
});


var  userName= function(userId){
  var user= Meteor.users.findOne({_id: userId});
  return user && user.username;
};

