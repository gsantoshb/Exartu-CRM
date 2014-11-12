ContactableController = RouteController.extend({
  layoutTemplate: 'mainLayout',
  waitOn: function () {
    return [Meteor.subscribe('singleContactable', this.params._id), GoogleMapsHandler]
  },
  data: function () {
    Session.set('entityId', this.params._id);
  },
  action: function () {
    if (!this.ready()) {
      this.render('loadingContactable');
      return;
    }
    this.render('contactable');

    Session.set('activeTab', this.params.hash || 'details');
  },
  onAfterAction: function () {
    var title = 'All Contacts / ' + Session.get('contactableDisplayName'),
      description = 'Contact information';
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

Template.contactable.rendered = function () {
  $('body').scrollTop(0);
};

var contactable;
Template.contactable.helpers({
  objTypeDisplayName: function () {
    return Utils.getContactableType(this);
  },
  contactable: function () {
    contactable = Contactables.findOne({
      _id: Session.get('entityId')
    });
    Session.set('contactableDisplayName', contactable.displayName);
    return contactable;
  },
  // Information to dynamic templates
  collection: function () {
    return Contactables;
  },
  // Counters
  documentCount: function () {
    return ContactablesFS.find({'metadata.entityId': Session.get('entityId')}).count() + Resumes.find({employeeId: Session.get('entityId')}).count()
  },
  noteCount: function () {
    return Notes.find({links: {$elemMatch: {id: Session.get('entityId')}}}).count();
  },
  jobCount: function () {
    return Jobs.find({'customer': Session.get('entityId')}).count();
  }
});

Template.contactable.events({
  // Picture edit
  'click #edit-pic': function () {
    $('#edit-picture').trigger('click');
  },
  'change #edit-picture': function (e) {
    var fsFile = new FS.File(e.target.files[0]),
      contactableId = Session.get('entityId');

    if (fsFile != undefined) {

      fsFile.metadata = {
        entityId: contactableId,
        owner: Meteor.userId(),
        name: fsFile.name()
      };

      var file = ContactablesFS.insert(fsFile, function () {
      });

      Meteor.call('updateContactablePicture', contactableId, file._id);
    }
  },
  // Actions
  'click #makeEmployee': function () {
    //todo: make this in dType, checking required fields, defaultValues, etc

    Contactables.update({_id: Session.get('entityId')}, {
      $set: {
        Employee: {}
      },
      $push: {objNameArray: 'Employee'}
    });
  },
  'click #makeContact': function () {
    Contactables.update({_id: Session.get('entityId')}, {
      $set: {
        Contact: {}
      },
      $push: {objNameArray: 'Contact'}
    });
  },
  'click #generate-resume': function() {
    var employeeId = this._id;
    var downloadLink = $('#download-generated-resume');
    Utils.showModal('basicModal', {
      title: 'Generate Employee Resume/CV',
      message: 'Do you want to Hide or Show the employee’s contact information in the resume/cv?',
      buttons: [{label: 'Hide', classes: 'btn-info', value: false}, {label: 'Show', classes: 'btn-success', value: true}],
      callback: function (result) {
        downloadLink.attr('href', FileUploader.getUrl('generateResume', employeeId, { showContactInfo: result}));
        downloadLink[0].click();
      }
    });
  }
});

// Header
Template.contactable_header.helpers({
  mainContactMethods: function () {
    var result = {};
    var contactMethods = ContactMethods.find().fetch();
    _.some(this.contactMethods, function (cm) {
      var type = _.findWhere(contactMethods, {_id: cm.type});
      if (!type)
        return false;
      if (type.type == Enums.contactMethodTypes.email)
        result.email = cm;
      if (type.type == Enums.contactMethodTypes.phone)
        result.phone = cm;

      if (!result.email || !result.phone)
        return false;

      return true;
    });

    return result;
  },
  pictureUrl: function () {
    if (this.pictureFileId) {
      return ContactablesFS.getThumbnailUrlForBlaze(this.pictureFileId);
    }
    return "/assets/user-photo-placeholder.jpg";
  },
  locationDisplayName: function () {
    return Utils.getLocationDisplayName(this.location);
  }
});

// Details

Template.contactable_details.setNewAddress = function () {
  var self = this;
  return function (newAddress) {
    Meteor.call('setContactableAddress', self._id, newAddress);
  }
};

// Detail
Template.contactable_details.helpers({
  collection: function () {
    return Contactables;
  }
});

// Tabs

Template.contactable_nav.helpers({
  isActive: function (id) {
    return (id == Session.get('activeTab'))? 'active' : '';
  }
})
var tabs;


Template.contactable_nav.helpers({
  tabs: function () {
    tabs = [
      {id: 'details', displayName: 'Details', template: 'contactable_details'},
      {id: 'notes', displayName: 'Notes', template: 'contactable_notes', icon : 'icon-note-paper-1'},
      {id: 'documents', displayName: 'Documents', template: 'contactable_documents', icon : 'icon-document-1'},
      {id: 'tasks', displayName: 'Tasks', template: 'contactable_tasks', icon : 'icon-note-paper-1'},
    ];

    if (contactable.Customer) {
      tabs.push({id: 'jobs', displayName: 'Jobs', template: 'contactable_jobs'});
      tabs.push({id: 'placements', displayName: 'Placements', template: 'contactable_placements'});
      tabs.push({id: 'contacts', displayName: 'Contacts', template: 'contactable_contacts'});
    }

    if (contactable.Employee) {
      tabs.push({id: 'placements', displayName: 'Placements', template: 'contactable_placements'});
      //tabs.push({id: 'hrconcourse', displayName: 'HRconcourse', template: 'contactable_HRConcourse'});
      tabs.push({id: 'education', displayName: 'Education', template: 'employeeEduction'});
      tabs.push({id: 'pastJobs', displayName: 'Past Jobs', template: 'employeePastJobs'});
    }
    return tabs;
  },
  mobileTabs: function () {
    return tabs.slice(0, 3);
  },
  otherTabs: function () {
    return tabs.slice(3, tabs.length);
  }
});
Template.contactable.currentTemplate = function () {
var selected = _.findWhere(tabs ,{id: Session.get('activeTab')});
  return selected && selected.template;
};
