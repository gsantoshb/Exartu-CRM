
Meteor.paginatedPublish(PastJobLeads,
  function () {
    var user = Meteor.users.findOne({_id: this.userId});
      if (!user) return [];
    //console.log(PastJobLeads.find().fetch())
    return Utils.filterCollectionByUserHier.call(this, PastJobLeads.find({},{sort:{dateCreated:-1}}));
  }, {
    pageSize: 10,
    publicationName: 'pastJobLeads'
  }
);

PastJobLeads.allow({
  insert: function () {
    return true;
  },
  update: function () {
    return true;
  }
});

//PastJobLeads.before.insert(function (userId, doc) {
//  try{
//    var user = Meteor.user() || {};
//  }catch (e){
//    //when the insert is trigger from the server
//    var user= { }
//  }
//  doc.hierId = user.currentHierId || doc.hierId;
//  doc.userId = user._id || doc.userId;
//  doc.dateCreated = Date.now();
//  if (!doc.activeStatus || doc.activeStatus==null) doc.activeStatus=LookUpManager.getActiveStatusDefaultId();
//
//});

Contactables.after.update(function(userId, doc, fields, update){
  if(_.contains(fields, "pastJobs")){
    if(update.$addToSet){
      var newPastJob = update.$addToSet.pastJobs;
      _.extend(newPastJob, {comment:"", active:true});
      _.extend(newPastJob, {_id: newPastJob.id});
      _.extend(newPastJob, {hierId: Meteor.user().currentHierId});
      _.extend(newPastJob, {employeeId:doc._id,employeeName:doc.displayName});
      newPastJob = _.omit(newPastJob, 'id');
      PastJobLeads.insert(newPastJob);
    }else if(update.$pull) {
      PastJobLeads.remove({_id: update.$pull.pastJobs.id})
    }else if(update.$set['pastJobs.$']){
      var newPastJob = update.$set['pastJobs.$'];
      _.extend(newPastJob, {comment:"", active:true});
      _.extend(newPastJob, {_id: newPastJob.id});
      _.extend(newPastJob, {hierId: Meteor.user().currentHierId});
      _.extend(newPastJob, {employeeId:doc._id,employeeName:doc.displayName});
      newPastJob = _.omit(newPastJob, 'id');
      PastJobLeads.update({_id: update.$set['pastJobs.$'].id},newPastJob);
    }
  }
})

Contactables.after.insert(function(userId,doc){
  if(doc.Employee && doc.pastJobs){
   _.each(doc.pastJobs, function(p){
     var newPastJob = p;
     _.extend(newPastJob, {comment:"", active:true});
     _.extend(newPastJob, {_id: newPastJob.id});
     _.extend(newPastJob, {hierId: Meteor.user().currentHierId});
     _.extend(newPastJob, {employeeId:doc._id,employeeName:doc.displayName});
     newPastJob = _.omit(newPastJob, 'id');
     PastJobLeads.insert(newPastJob);
   })
 }
})


PastJobLeads._ensureIndex({dateCreated: 1});
