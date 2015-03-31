
// Contactable Add Template
Template.contactableAddActivity.helpers({
  getActivityIcon: function () {
    switch (this.data.objTypeName) {
      case 'Client':
        return 'icon-buildings-1';
      case 'Contact':
        return 'icon-address-1';
      case 'Employee':
        return 'icon-connection-1';
    }
  },
  getClientName: function () {
    if (this.data && this.data.objTypeName == 'Contact' && this.entityId) {
      var contact = Contactables.findOne({_id: this.entityId});
      if (contact && contact.Contact)
        return contact.Contact.clientName;
    }
  },
  getClientId: function () {
    var contact = Contactables.findOne({_id: this.entityId});
    if (contact && contact.Contact)
      return contact.Contact.client;
  }
});

// Task Add Template
Template.taskAddActivity.helpers({
  task: function () {
    var task = Tasks.findOne(this.entityId);
    if(task) {
      return task;
    }
  },
  getHref: function () {
    return Utils.getHrefFromLink(this);
  },
  getEntity: function () {
    return Utils.getEntityFromLink(this);
  },
  userAssigned: function () {
    return this.assign[0];
  }
});

Template.placementAddActivity.helpers({
  job: function () {
    return Jobs.findOne(this.data.job);
  },
  employee: function () {
    return Contactables.findOne(this.data.employee);
  },
  client: function (clientId) {
    return Contactables.findOne(clientId);
  }
});

// Note Add Template
Template.noteAddActivity.helpers({
  note: function () {

    var note = Notes.findOne(this.entityId);
    if(note) {
      return note;
    }
  },
  getHref: function () {
    return Utils.getHrefFromLink(this);
  },
  getEntity: function () {
    return Utils.getEntityFromLink(this);
  }
});

// File Add Template
Template.fileAddActivity.helpers({
  file: function () {
    return ContactablesFiles.findOne(this.entityId);
  },
  contactable: function () {
    var id = this.links ? this.links[0] : undefined;
    return Contactables.findOne({_id: id});
  }
});

//
//Template.contactableUpdateActivity.helpers({
//  isListChange: function () {
//    return this.data.added || this.data.removed || this.data.changed;
//  }
//});
