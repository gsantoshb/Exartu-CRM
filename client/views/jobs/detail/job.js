var jobCollections= Jobs;

JobController = RouteController.extend({
  layoutTemplate: 'mainLayout',
  waitOn: function () {
    return [Meteor.subscribe('singleJob', this.params._id), GoogleMapsHandler, Meteor.subscribe('jobCounters', this.params._id)]
  },
  data: function () {
    Session.set('entityId', this.params._id);
  },
  action: function () {
    if (!this.ready()) {
      this.render('loadingContactable');
      return;
    }
    Session.set('activeTab', this.params.tab || 'details');
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
  return new dType.objInstance(job, jobCollections);
};

var self = {};
Utils.reactiveProp(self, 'editMode', false);
var location = {};
Utils.reactiveProp(location, 'value', null);
var services;

Template.job.created = function () {
  self.editMode = false;
  var originalJob = jobCollections.findOne({ _id: Session.get('entityId') });

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
};

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
    var originalJob = jobCollections.findOne({ _id: Session.get('entityId') });
    Session.set('jobDisplayName', originalJob.displayName);
    if (!job)
      job = generateReactiveObject(originalJob);
    return job;
  },
  originalJob: function () {
    return jobCollections.findOne({ _id: Session.get('entityId') });
  },
  editMode: function () {
    return self.editMode;
  },
  colorEdit: function () {
    return self.editMode ? '#008DFC' : '#ddd'
  },
  isType: function (typeName) {
    return !!jobCollections.findOne({ _id: Session.get('entityId'), objNameArray: typeName});
  },
  jobCollection: function () {
    return jobCollections;
  },
  getCustomer: function () {
    var j = jobCollections.findOne({ _id: Session.get('entityId')});
    return j && j.customer;
  },
  noteCount: function () {
    return Notes.find({links: { $elemMatch: { id: Session.get('entityId') } }}).count();
  },
  isSelected: function (optionValue, currentValue) {
    return optionValue == currentValue;
  },
  location: function () {
    var originalJob = jobCollections.findOne({ _id: Session.get('entityId') });

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
  },
  customerName: function () {
    var customer = Contactables.findOne(this.customer);
    return customer && customer.displayName;
  }
});

Template.job_details.helpers({
  originalJob: function () {
    return jobCollections.findOne({ _id: Session.get('entityId') });
  },
  setNewAddress: function () {
    var self = this;
    return function (newAddress) {
      Meteor.call('setJobAddress', self._id, newAddress);
    }
  },
  getCustomer: function () {
    return Template.parentData(1).originalJob().customer;
  },
  customerCollection: function () {
    return Contactables;
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
    var originalJob = jobCollections.findOne({ _id: Session.get('entityId') });
    var oldLocation = originalJob.location;
    var newLocation = location.value;

    if ((newLocation && newLocation.displayName) != (oldLocation && oldLocation.displayName)) {
      update.$set = update.$set || {};
      update.$set.location = newLocation;
    }

    if (services.tags.value.length > 0)
      update.$set.tags = services.tags.value;

    jobCollections.update({_id: job._id}, update, function (err, result) {
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
    Utils.showModal('basicModal', {
      title: 'Job copy',
      message: 'Are you sure you want to copy this job?',
      buttons: [{label: 'Cancel', classes: 'btn-default', value: false}, {label: 'Copy', classes: 'btn-success', value: true}],
      callback: function (result) {
        if (result) {
          Meteor.call('copyJob', Session.get('entityId'), function (err, result) {
            if (!err) {
              Router.go('/job/' + result);
            } else {
              console.log(err);
            }
          });
        }
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
Template.job_nav.helpers({
  isActive: function (id) {
    return (id == Session.get('activeTab'))? 'active' : '';
  }
})
var tabs;


Template.job_nav.helpers({
  tabs: function () {
    tabs = [
      {id: 'details', displayName: 'Details', template: 'job_details'},
      {id: 'notes', displayName: 'Notes', template: 'job_notes', info: function () {
        return JobCounter.findOne('notes').count;
      }},
      {id: 'description', displayName: 'Description', template: 'job_description'},
      {id: 'tasks', displayName: 'Tasks', template: 'job_tasks', info: function () {
        return JobCounter.findOne('tasks').count;
      }},
      {id: 'placements', displayName: 'Placements', template: 'job_placements', info: function () {
        return JobCounter.findOne('placements').count;
      }}
    ];
    return tabs;
  },
  getEntityId: function () {
    return Session.get('entityId');
  }
});

Template.job.currentTemplate = function () {
  var selected = _.findWhere(tabs ,{id: Session.get('activeTab')});
  return selected && selected.template;
};