
// Contactable Add Template
Template.contactableAddActivity.helpers({
    isClient: function () {
        return (this.data.objTypeName == 'Client' || this.data.objTypeName == 'Customer');
    },
    isContact: function () {
        return (this.data.objTypeName == 'Contact');
    },
    isEmployee: function () {
        return (this.data.objTypeName == 'Employee');
    },
    getObjectTypeName: function() {
        return this.data.objTypeName;
    },
    getActivityIcon: function () {
        switch (this.data.objTypeName) {
            case 'Client':
            case 'Customer':
                return 'icon-buildings-1';
            case 'Contact':
                return 'icon-contact-book-4';
            case 'Employee':
                return 'icon-profile-business-man';
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

Template.taskAddActivity.events = {
  'click .task-link': function(e){
    var task = Tasks.findOne({_id: e.target.id});
    if(task){
      Utils.showModal('addEditTask', {taskId: task._id});
    }
  }
}
Template.noteAddActivity.events= {
  'click .note-link': function(e){
    var note = Notes.findOne({_id: e.target.id});
    if(note){
      Utils.showModal('addEditNote', note);
    }
  }
}
//
//Template.contactableUpdateActivity.helpers({
//  isListChange: function () {
//    return this.data.added || this.data.removed || this.data.changed;
//  }
//});
