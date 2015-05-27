/**
 * Created by ramiro on 26/05/15.
 */
ReportsController = RouteController.extend({
  layoutTemplate: 'mainLayout',
  template: 'reports'
});

Template.reports.created = function(){
  if(!SubscriptionHandlers.ContactablesReportsHandler){
    SubscriptionHandlers.ContactablesReportsHandler = Meteor.paginatedSubscribe('allEmployeesReport', {})
  }
}

Template.reports.helpers({
  employees: function(){
    return _.map(AllEmployeesReport.find().fetch(), function(employee){
      if(employee){
         var toReturn = {}
         toReturn._id = employee._id;
         toReturn.displayName = employee.displayName;
         if(employee.pastJobs){
           toReturn.headPastJobs = employee.pastJobs[0];
           if(employee.pastJobs.length>1){
             toReturn.tailPastJob = _.rest(employee.pastJobs,1);
           }
           else{
             toReturn.tailPastJob = [];
           }
         }
         else{
           toReturn.headPastJobs = null;
           toReturn.tailPastJob = [];
         }
           toReturn.lengthPastJob = toReturn.tailPastJob.length + 1;

           return toReturn;
      }
      else{
        console.log("shit happens")
      }
    });
  }
})