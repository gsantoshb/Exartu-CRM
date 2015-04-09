NoteEditMode = {
    val: false,
    dep: new Tracker.Dependency,
    show: function() {
        this.val = true;
        this.dep.changed();
    },
    hide: function() {
        this.val = false;
        this.dep.changed();
    }
};
Object.defineProperty(NoteEditMode, "value", {
    get: function() {
        this.dep.depend();
        return this.val;
    },
    set: function(newVal) {
        this.val = newVal;
        this.dep.changed();
    }
});

Template.dashboardNotes.helpers({
    nodes: function() {
        return Notes.find({links: {$elemMatch: { type: Enums.linkTypes.dashboard.value }}}, { limit: 5, sort: { dateCreated: -1 } });
    },
    checkNoNodes: function() {
        var nodes = Notes.find({links: {$elemMatch: { type: Enums.linkTypes.dashboard.value }}});
        return (nodes.count() >= 5);
    },
    noteEditMode: function() {
        return NoteEditMode.value;
    }
});

Template.dashboardNotes.events({
    'click .removeNote': function(e) {
        e.preventDefault();

        var id = this._id;

        Utils.showModal('basicModal', {
            title: 'Delete note',
            message: 'Are you sure you want to delete this note?',
            buttons: [{label: 'Cancel', classes: 'btn-default', value: false}, {
                label: 'Delete',
                classes: 'btn-danger',
                value: true
            }],
            callback: function (result) {
                if (result) {
                    Meteor.call('removeNote', id);
                }
            }
        });

        return false;
    },
    'click .editNote': function(e) {
        e.preventDefault();

        Utils.showModal('dashboardAddNote', this);

        return false;
    }
});