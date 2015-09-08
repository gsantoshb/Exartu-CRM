AddWorkFlowControllerJobOffer = RouteController.extend({
  data: function(){
   },
  waitOn: function () {
  },
  action: function () {
    this.render('addWorkFlow');
  },
  onAfterAction: function() {
  }
});

var jobId;
var job = new ReactiveVar();
var placementByJob = new ReactiveVar([]);

Template.addWorkFlow.created = function(){
  jobId = Router.current().params.entityId;
  Meteor.call('getJobById', jobId, function(err,res){
    if(res){
      job.set(res);
    }
  })
  Meteor.call('placementsByJob', jobId, function(err, res){
      if(res) {
        var extendedRes = [];
        _.each(res, function(r){
          Meteor.call('getContactMethods', r.employee, function(err, resultado){
            if(resultado){
              var lkPhone = LookUps.find({lookUpActions:Enums.lookUpAction.ContactMethod_Phone}).fetch();
              _.forEach(resultado, function(c){
                if(_.contains(_.pluck(lkPhone, '_id'), c.type)){
                  r.phone = c.value;
                }
              })
            }
            extendedRes.push(r);
            placementByJob.set(extendedRes);
          })
        })
      }
    });
}

Template.addWorkFlow.destroyed = function(){

}

Template.addWorkFlow.helpers({
  'placementsByJob': function(){
    return placementByJob.get();
  },
  'getCandidateStatus': function(){
    var lkCandidate = LookUps.findOne({_id:this.candidateStatus});
    return lkCandidate.displayName;
  },
  'hasNoPlacement': function(){
    return placementByJob.get().length === 0;
  },
  'jobDisplayName': function(){
    if(job.get()){
      return job.get().displayName;
    }
  },
  'job': function(){
    if(job.get()){
      return job.get();
    }
  }
})

Template.addWorkFlow.events({
  'click #saveWorkflow': function(){
    var workFlow = {jobId: jobId};
      workFlow.flow = [];

      _.forEach(placementByJob.get(), function(p){
        if(p.phone) {
          workFlow.flow.push({placementId: p._id,employeeDisplayName: p.employeeDisplayName, employeeId: p.employee, phone: p.phone, called: false});
        }
      })
      workFlow.jobDisplayName = placementByJob.get()[0].jobDisplayName;
      workFlow.type = Enums.workFlowTypes.jobOffer;
      Meteor.call('insertWorkFlow', workFlow, function(err, res){
        if(res) {
          Router.go('/workFlow/' + res);
        }
        if(err){
          Utils.showModal('basicModal', {
            title: 'Error creating workflow',
            message: err.error })
        }
      })
      return false
    }

})


