schemaAddJob = new SimpleSchema({
  'jobTitle':{
    type:String,
    optional:false
  },
  'rateQuote':{
    type:String,
    optional:true
  },
  'statusNote':{
    type:String,
    optional:true
  },
  'jobDescription':{
    type:String,
    optional:true
  },
  'client':{
    type:String,
    optional:false
  }
});

JobAddController = RouteController.extend({
    waitOn: function () {
        return Meteor.subscribe('lookUps');
    },
    data: function () {
        Session.set('objType', this.params.objType);
    },
    action: function () {
        if (!this.ready()) {
            this.render('loadingContactable');
            return;
        }

        this.render('addJobPage');
    },
    onAfterAction: function () {
        var title = 'Add Job',
            description = '';
        SEO.set({
            title: title,
            meta: {
                'description': description
            },
            og: {
                'title': title,
                'description': description
            }
        });
    }
});

var addDisabled = new ReactiveVar(false);


Template.addJobPage.helpers({
    addDisabled: function () {
        return addDisabled.get();
    },
    objTypeName: function () {
        return Session.get('objType');
    },
    jobTitles: function(){
      var jobTitlesArray = LookUps.find({lookUpCode:Enums.lookUpCodes.job_titles}).fetch()
      var toReturn = _.map(jobTitlesArray, function(a){
        return {label: a.displayName, value: a._id}
      })
      return toReturn;
    },
    'getClients': function(){
      return {getCollection: function (string) {
        var self = this;

        //todo: calculate method
        Meteor.call('findClient', string, function (err, result) {
          if (err)
            return console.log(err);

          self.ready(_.map(result, function (r) {
              var text = r.organization.organizationName;
              if (r.Client) text = text + '/' + r.Client.department;
              text = text + '/' + r._id;
              return {id: r._id, text: text};
            })
          );
        });
      }}
    },
    'clientChanged': function(){
      return {selectionChanged: function (value) {
        this.value = value;
      }
      }
    }

});

Template.addJobPage.events({
    //'click .btn-success': function () {
    //    if (!dType.isValid(model)) {
    //        dType.displayAllMessages(model);
    //        return;
    //    }
    //
    //    var obj = dType.buildAddModel(model);
    //    addDisabled.set(true);
    //    Meteor.call('addJob', obj, function (err, result) {
    //        if (err) {
    //            console.dir(err)
    //            addDisabled.set(false);
    //            error = err.error;
    //            errorDeps.changed();
    //        }
    //        else {
    //            Meteor.call('setLastClientUsed', obj.client, function (err) {
    //                if (err)
    //                    console.dir(err);
    //
    //
    //            });
    //            addDisabled.set(false);
    //            Router.go('/job/' + result);
    //        }
    //    });
    //},
    'click .goBack': function () {
        history.back();
    }
});

Template.addJobPage.destroyed = function () {
    model = undefined;
};

AutoForm.hooks({
  addJob: {
    onSubmit: function (insertDoc, updateDoc, currentDoc) {
      debugger;

      var job = {}
      job.objNameArray = ["Temporary", "job"];
      job.Temporary = {}
      job.jobTitle = insertDoc.jobTitle;
      var lkJobTitle = LookUps.findOne({_id: insertDoc.jobTitle});
      job.publicJobTitle = lkJobTitle.displayName;
      job.rateQuote = insertDoc.rateQuote;
      job.statusNote = insertDoc.statusNote;
      job.jobDescription = insertDoc.jobDescription;
      job.workHours = "";
      job.numberRequired = 1;
      job.duration = null;
      var lkJobStatus = LookUps.findOne({lookUpCode:Enums.lookUpCodes.job_status, isDefault:true});
      job.status = lkJobStatus._id;
      var lkActive = LookUps.findOne({lookUpCode:Enums.lookUpCodes.active_status,lookUpActions:Enums.lookUpAction.Implies_Active});
      job.activeStatus = lkActive._id;
      job.client = insertDoc.client;
      job.jobTitleDisplayName = lkJobTitle.displayName;
      job.tags = [];
      job.hierId = Meteor.user().currentHierId;
      job.userId = Meteor.user()._id;
      job.dateCreated = new Date();
      Meteor.call('getContactableById', insertDoc.client, function(err, res){
        if(res){
          job.clientDisplayName = res.displayName;
          Meteor.call('addJob', job, function (err, result) {
            if (err) {
                console.dir(err)
                addDisabled.set(false);
                error = err.error;
                errorDeps.changed();
            }
             else {
                Meteor.call('setLastClientUsed', job.client, function (err) {
                  if (err)
                     console.dir(err);
                });
                addDisabled.set(false);
                Router.go('/job/' + result);
             }
          })
        }
      })
      return false;
    }
  }
})