Activities = new Meteor.Collection("activities", {transform: function(doc){
  switch(doc.type){
    case   (Enums.activitiesType.contactableAdd):
      var cont = Contactables.findOne(doc.entityId);
      doc.data.displayName = (cont && cont.displayName) || doc.data.displayName;
      break;
    case   (Enums.activitiesType.messageAdd):
      break;
    case   (Enums.activitiesType.taskAdd):
      var task = Tasks.findOne(doc.entityId);
      if (task){
        doc.data.assign = task.assign;
        doc.data.begin =  task.begin;
        doc.data.completed = task.completed;
        doc.data.end =  task.end;
        doc.data.msg = task.msg;
      }
      break;
    case   (Enums.activitiesType.jobAdd):
      var job = Jobs.findOne(doc.entityId);
      if (job){
        doc.data.publicJobTitle = job.displayName;
        doc.data.customerId = job.customerId;
      }
      break;
    case   (Enums.activitiesType.matchupEdit):
      break;
    case   (Enums.activitiesType.matchupAdd):
      break;
    case   (Enums.activitiesType.dealAdd):
      break;
  }
  return doc;
}});
Meteor.subscribe('activities');