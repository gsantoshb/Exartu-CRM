Activities = new Meteor.Collection("activities", {transform: function(doc){
  switch(doc.type){
    case   (Enums.activitiesType.contactableAdd):
      var cont = Contactables.findOne(doc.entityId);
      doc.data.displayName = (cont && cont.displayName) || doc.data.displayName;
      
      // Get contactable email
      var contactMethods = ContactMethods.find().fetch();
      _.some(cont.contactMethods, function(cm){
        var type = _.findWhere(contactMethods, {_id: cm.type});
        if (!type)
          return false;
        if (type.type == Enums.contactMethodTypes.email) {
          doc.data.contactableEmail = cm.value;
          return true;
        }

        return false;
      });

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
    case   (Enums.activitiesType.placementEdit):
      break;
    case   (Enums.activitiesType.placementAdd):
      break;
    case   (Enums.activitiesType.dealAdd):
      break;
  }
  return doc;
}});
Meteor.subscribe('activities');