ContactableController = RouteController.extend({
  layoutTemplate: 'mainLayout',
  waitOn: function () {
    return [ObjTypesHandler, ContactableHandler, ContactMethodsHandler, GoogleMapsHandler]
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

    GAnalytics.event("contactables", "details");
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
Template.displayObjType = function() {
  if (info.objType.value)
    return '';
  return Utils.getContactableType(this);
};

var contactable;

Template.contactable.helpers({
  displayObjType: function() {
    return Utils.getContactableType(this);
  },
  contactable: function () {
    contactable = Contactables.findOne({
      _id: Session.get('entityId')
    });
    Session.set('contactableDisplayName', contactable.displayName);
    return contactable;
  },
  dateCreatedFormatted: function () {
    return moment(this.dateCreated).format('lll');
  },
  documentCount: function() {
    return ContactablesFS.find({'metadata.entityId': Session.get('entityId')}).count() + ResumesFS.find({'metadata.employeeId': Session.get('entityId')}).count();
  },
  noteCount: function() {
      return Notes.find({links: { $elemMatch: { id: Session.get('entityId') } }}).count();
  },
  jobCount: function() {
      return Jobs.find({'customer': Session.get('entityId')}).count();
    },
  ContactablesCollection: function(){
    return Contactables;
  }
});

Template.contactable.events({
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
  'click .send-message': function (e) {
    Composer.showModal('sendMessage', $data);
  },
  'click .addLocation': function () {
    $('#edit-Location').trigger('click');
  },
  'click .sendMessage':function(){
    Composer.showModal('sendMessage', Session.get('entityId'));
  },
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
//
//Template.contact_header.events({
//  "click .editCustomer": function () {
//    Composer.showModal('contactCustomerAddEdit', Session.get('entityId'));
//  }
//});

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
var selectedTab;
var selectedTabDep = new Deps.Dependency;

Template.all_tabs.created = function() {
  tabs = [
    {id: 'details', displayName: 'Details'},
    {id: 'notes', displayName: 'Notes', info: 'noteCount'},
    {id: 'documents', displayName: 'Documents', info: 'documentCount'},
    {id: 'tasks', displayName: 'Tasks'},
    {id: 'location', displayName: 'Location'},
  ];

  if (contactable.Customer) {
    tabs.push({id: 'jobs', displayName: 'Jobs', info: 'jobCount'});
    tabs.push({id: 'placements', displayName: 'Placements'});
    tabs.push({id: 'contacts', displayName: 'Contacts'});
  }

  if (contactable.Employee) {
    tabs.push({id: 'placements', displayName: 'Placements'});
    tabs.push({id: 'hrconcourse', displayName: 'HRconcourse'});
  }

  tabs.push({id: 'actions', displayName: 'Actions'});
  tabs.push({id: 'activities', displayName: 'Activities'});

  selectedTab = _.findWhere(tabs, {id: Session.get('activeTab')});
};

var template = 'contactable';
Template.all_tabs.execHelper = function(helperName) {
  return Template[template][helperName]();
};

var container, containerWidth, tabsWidth;
var hasTabSroll = false;
var resizeDep = new Deps.Dependency;

var checkScroll = function() {
  containerWidth = container.width();
  tabsWidth = container.children().width();
  hasTabSroll = container.get(0).scrollWidth > container.width();
  resizeDep.changed();
};

Template.all_tabs.rendered = function() {
  container = $('.details-tabs-container');
  checkScroll();

  container.resize(function(){
    checkScroll();
  });
};

Template.all_tabs.isActive = function(name){
  selectedTabDep.depend();
  return (name == selectedTab.id) ? 'active' : '';
};

Template.all_tabs.tabs = function() {
  return tabs;
};

Template.all_tabs.showMoveButtons = function() {
  resizeDep.depend();
  return hasTabSroll? '': 'hide';
};

var currentOffset = 0;
var moveOffset = 200;
Template.all_tabs.events = {
  'click #next-tab': function() {
    if (containerWidth + currentOffset <= tabsWidth) {
      currentOffset += moveOffset;
      $('.details-tabs').stop().animate({
        left: "-=" + moveOffset + 'px'
      }, 100);
    }
  },
  'click #back-tab': function() {
    if (currentOffset - moveOffset >= 0) {
      currentOffset -= moveOffset;
      $('.details-tabs').stop().animate({
        left: "+=" + moveOffset + 'px'
      }, 100);
    }
  },
  'click .details-tab': function() {
    selectedTab = _.findWhere(tabs, {id: this.id});
    selectedTabDep.changed();
  }
};

var getLinkType= function(){
  return Enums.linkTypes.contactable;
}

