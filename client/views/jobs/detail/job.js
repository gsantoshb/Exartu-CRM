JobController = RouteController.extend({
  layoutTemplate: 'mainLayout',
  waitOn: function () {
    return [JobHandler, GoogleMapsHandler]
  },
  data: function () {
    Session.set('entityId', this.params._id);
  },
  action: function () {
    if (!this.ready()) {
      this.render('loadingContactable')
      return;
    }
    Session.set('activeTab', this.params.hash);
    this.render('job')
  },
  onAfterAction: function () {
    var title = 'Jobs / ' + Session.get('jobDisplayName'),
      description = 'Job information';
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

var generateReactiveObject = function (job) {
  return new dType.objInstance(job, Jobs);
};

var self = {};
Utils.reactiveProp(self, 'editMode', false);
var location = {};
Utils.reactiveProp(location, 'value', null);
var services;

Template.job.created = function () {
  self.editMode = false;
  var originalJob = Jobs.findOne({ _id: Session.get('entityId') });


  var definition = {
    reactiveProps: {
      tags: {
        default: originalJob.tags,
        update: 'tags',
        type: Utils.ReactivePropertyTypes.array
      }
    }
  };
  services = Utils.ObjectDefinition(definition);
}

var getPlacementStatuses = function(type, action){
  var status = Enums.lookUpTypes[type];
  status = status && status.status;
  if (status){
    var lookUpCodes = status.lookUpCode,
      implyActives = LookUps.find({lookUpCode: lookUpCodes, lookUpActions: action}).fetch();
    return _.map(implyActives,function(doc){ return doc._id});
  }
  return null;
};

var job;
Template.job.helpers({
  job: function () {
    var originalJob = Jobs.findOne({ _id: Session.get('entityId') });
    Session.set('jobDisplayName', originalJob.displayName);
    if (!job)
      job = generateReactiveObject(originalJob);
    return job;
  },
  originalJob: function () {
    return Jobs.findOne({ _id: Session.get('entityId') });
  },
  editMode: function () {
    return self.editMode;
  },
  colorEdit: function () {
    return self.editMode ? '#008DFC' : '#ddd'
  },
  isType: function (typeName) {
    return !!Jobs.findOne({ _id: Session.get('entityId'), objNameArray: typeName});
  },
  jobCollection: function () {
    return Jobs;
  },
  getCustomer: function () {

    var j = Jobs.findOne({ _id: Session.get('entityId')});
    return j && j.customer;
  },
  noteCount: function () {
    return Notes.find({links: { $elemMatch: { id: Session.get('entityId') } }}).count();
  },
  isSelected: function (optionValue, currentValue) {
    return optionValue == currentValue;
  },
  location: function () {
    var originalJob = Jobs.findOne({ _id: Session.get('entityId') });

    location.value = originalJob && originalJob.location;
    return location;
  },
  tags: function () {
    return services.tags;
  },
  assignment: function() {
    var activeStatuses = getPlacementStatuses('placement', Enums.lookUpAction.Implies_Active);
    var placedStatuses = getPlacementStatuses('candidate', Enums.lookUpAction.Candidate_Placed);
    var placementsAssignment = Placements.findOne({job: this._id, placementStatus: {$in: activeStatuses}, candidateStatus: {$in: placedStatuses}});

    if (!placementsAssignment)
      return undefined;

    return Contactables.findOne(placementsAssignment.employee);
  }
});

Template.job.events({
  'click .editJob': function () {
    self.editMode = !self.editMode;
  },
  'click .saveButton': function () {
    if (!job.validate()) {
      job.showErrors();
      return;
    }
    var update = job.getUpdate();
    var originalJob = Jobs.findOne({ _id: Session.get('entityId') });
    var oldLocation = originalJob.location;
    var newLocation = location.value;

    if ((newLocation && newLocation.displayName) != (oldLocation && oldLocation.displayName)) {
      update.$set = update.$set || {};
      update.$set.location = newLocation;
    }

    if (services.tags.value.length > 0)
      update.$set.tags = services.tags.value;

    Jobs.update({_id: job._id}, update, function (err, result) {
      if (!err) {
        self.editMode = false;
        job.reset();
      }
    });
  },
  'click .cancelButton': function () {
    self.editMode = false;
  },
  'click .add-tag': function () {
    addTag();
  },
  'keypress #new-tag': function (e) {
    if (e.keyCode == 13) {
      e.preventDefault();
      addTag();
    }
  },
  'click .remove-tag': function () {
    services.tags.remove(this.value);
  },
  'click #copy-job': function () {
    var result = confirm("Are you sure you want to copy this job?");
    if (result)
      Meteor.call('copyJob', Session.get('entityId'), function (err, result) {
        if (!err) {
          alert('Job copied, navigating to job id: ' + result);
          Router.go('/job/' + result);
        } else {
          console.log(err);
        }
      });
  }
});

var addTag = function () {
  var inputTag = $('#new-tag')[0];

  if (!inputTag.value)
    return;

  if (_.indexOf(services.tags.value, inputTag.value) != -1)
    return;
  services.tags.insert(inputTag.value);
  inputTag.value = '';
  inputTag.focus();
};

//Template.job.helpers({
//  getType: function () {
//    return Enums.linkTypes.job;
//  }
//});

//Template.job_tabs.isActive = function(name){
//  var activeTab = Session.get('activeTab') || 'details';
//  return (name == activeTab) ? 'active' : '';
//};

// Tabs

var tabs;
Template.job_tabs.tabs = function() {
  var tabs = [
    {id: 'details', displayName: 'Details', template: 'job_details'},
    {id: 'notes', displayName: 'Notes', info: 'noteCount', template: 'job_notes'},
    {id: 'description', displayName: 'Description', template: 'job_description'},
    {id: 'tasks', displayName: 'Tasks', template: 'job_tasks'},
    {id: 'rates', displayName: 'Rates', template: 'job_rates'},
    {id: 'placements', displayName: 'Placements', template: 'job_placements'},
    {id: 'activity', displayName: 'Activity', template: 'job_activity'},
    {id: 'actions', displayName: 'Actions', template: 'job_actions'},
  ];

  return tabs;
};

Template.job_tabs.selectedTab = function() {
  return _.findWhere(tabs, {id: Session.get('activeTab')});
};
