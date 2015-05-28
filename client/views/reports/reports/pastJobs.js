/**
 * Created by ramiro on 26/05/15.
 */
ReportsPastJobs = RouteController.extend({
  layoutTemplate: 'mainLayout',
  template: 'reportsPastJobs'
});

Template.reportsPastJobs.created = function(){
  if(!SubscriptionHandlers.ContactablesReportsHandler){
    SubscriptionHandlers.ContactablesReportsHandler = Meteor.paginatedSubscribe('allEmployeesReport', {})
  }
}


Template.reportsPastJobs.helpers({
  employees: function(){
    return AllEmployeesReport.find().fetch();
  }
})
