ContactableController = RouteController.extend({
  layoutTemplate: 'mainLayout',
  waitOn: function () {
    return [ContactableHandler, ContactMethodsHandler, GoogleMapsHandler]
  },
  data: function () {
    Session.set('entityId', this.params._id);
  },
  action: function () {
    if (!this.ready()) {
      this.render('loadingContactable')
      return;
    }
    this.render('contactable')

    Session.set('activeTab',this.params.hash);
  },
  onAfterAction: function() {
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
  objTypeDisplayName: function() {
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
  collection: function(){
    return Contactables;
  },
  // Counters
  documentCount: function() {
    return ContactablesFS.find({'metadata.entityId': Session.get('entityId')}).count() + ResumesFS.find({'metadata.employeeId': Session.get('entityId')}).count();
  },
  noteCount: function() {
      return Notes.find({links: { $elemMatch: { id: Session.get('entityId') } }}).count();
  },
  jobCount: function() {
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
  'click #makeEmployee': function(){
    //todo: make this in dType, checking required fields, defaultValues, etc
    
    Contactables.update({ _id: Session.get('entityId') }, {
      $set: {
        Employee : {}
      },
      $push: {objNameArray: 'Employee'}
    });
  },
  'click #makeContact': function(){
    Contactables.update({ _id: Session.get('entityId') }, {
      $set: {
        Contact : {}
      },
      $push: {objNameArray: 'Contact'}
    });
  }
});

// Header

Template.contactable_header.helpers({
  mainContactMethods: function() {
    var result = {};
    var contactMethods = ContactMethods.find().fetch();
    _.some(this.contactMethods, function(cm){
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
  }
});

// Tabs

var tabs;
Template.contactable_tabs.tabs = function() {
  var tabs = [
    {id: 'details', displayName: 'Details', template: 'contactable_details'},
    {id: 'notes', displayName: 'Notes', info: 'noteCount', template: 'contactable_notes'},
    {id: 'documents', displayName: 'Documents', info: 'documentCount', template: 'contactable_documents'},
    {id: 'tasks', displayName: 'Tasks', template: 'contactable_tasks'},
    {id: 'location', displayName: 'Location', template: 'contactable_location'},
  ];

  if (contactable.Customer) {
    tabs.push({id: 'jobs', displayName: 'Jobs', info: 'jobCount', template: 'contactable_jobs'});
    tabs.push({id: 'placements', displayName: 'Placements', template: 'contactable_placements'});
    tabs.push({id: 'contacts', displayName: 'Contacts', template: 'contactable_contacts'});
  }

  if (contactable.Employee) {
    tabs.push({id: 'placements', displayName: 'Placements', template: 'contactable_placements'});
    tabs.push({id: 'hrconcourse', displayName: 'HRconcourse', template: 'contactable_HRConcourse'});
  }

  tabs.push({id: 'actions', displayName: 'Actions', template: 'contactable_actions'});
  tabs.push({id: 'activities', displayName: 'Activities', template: 'contactable_activities'});

  return tabs;
};

Template.contactable_tabs.selectedTab = function() {
  return _.findWhere(tabs, {id: Session.get('activeTab')});
};