AddWorkFlowController = RouteController.extend({
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

var reactiveJobId = new ReactiveVar("");

schemaAddWorkField = new SimpleSchema({
  'job': {
    type: String,
    optional: false
  }
})
var placementByJob = new ReactiveVar([]);
Template.addWorkFlow.created = function(){
  this.autorun(function(){
    debugger;
    Meteor.call('placementsByJob', reactiveJobId.get(), function(err, res){
      debugger;
      if(res)
        placementByJob.set(res);
    });
  })
}

Template.addWorkFlow.helpers({
  'getJobs': function(){
    return {getCollection: function (string) {
      var self = this;

      //todo: calculate method
      Meteor.call('findJob', string, function (err, result) {
        if (err)
          return console.log(err);

        self.ready(_.map(result, function (r) {
            var text = r.publicJobTitle;
            return {id: r._id, text: text};
          })
        );
      });
    }}
  },
  'jobChanged': function(){
    return {selectionChanged: function (value) {
      this.value = value;
    }
    }
  },
  'getId': function(){
    reactiveJobId.set(AutoForm.getFieldValue('job'));
  },
  'placementsByJob': function(){
    debugger;
    return placementByJob.get();
  },
  'getCandidateStatus': function(){
    var lkCandidate = LookUps.findOne({_id:this.candidateStatus});
    return lkCandidate.displayName;
  }
})