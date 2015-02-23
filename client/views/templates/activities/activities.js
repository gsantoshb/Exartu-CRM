Template.newContactableActivity.helpers({
    getActivityColor: function () {
        return helper.getActivityColor(this);
    },

    getActivityIcon: function () {
        return helper.getActivityIcon(this);
    }
});

Template.newNoteActivity.helpers({
    note: function () {
        return Notes.findOne(this.entityId);
    },
    getHref: function () {
        return Utils.getHrefFromLink(this);
    },
    getEntity: function () {
        return Utils.getEntityFromLink(this);
    }
});

Template.contactableUpdateActivity.helpers({
    isListChange: function () {
        return this.data.added || this.data.removed || this.data.changed;
    }
});

Template.newTaskActivity.helpers({
    task: function () {
        return Tasks.findOne(this.entityId);
    },
    getHref: function () {
        return Utils.getHrefFromLink(this);
    },
    getEntity: function () {
        return Utils.getEntityFromLink(this);
    }
});

Template.newPlacementActivity.helpers({
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

Template.newFileActivity.helpers({
    file: function () {
        return ContactablesFiles.findOne(this.entityId);
    },
    contactable: function () {

        var id;
        if (this.links && this.links[0]) id = this.links[0];
        if (this.links && !this.links[0]) id = this.links[1]; // hack because links were incorrect at one point
        return Contactables.findOne(id);
    }
});

Template.newJobActivity.helpers({
    client: function () {
        return Contactables.findOne(this.data.clientId);

    }
});

