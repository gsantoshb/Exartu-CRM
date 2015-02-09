var self = {};
AutoForm.debug();
NoteSchema = new SimpleSchema({
    msg: {
        type: String,
        label: 'Message'
    },
    links: {
        type: [Object],
        label: 'Entities linked'
    },
    'links.$.id': {
        type: String
    },
    'links.$.type': {
        type: Number,
        allowedValues: _.map(Enums.linkTypes, function (type) {
            return type.value;
        })
    },
    sendAsSMS: {
        type: Boolean,
        label: 'Send SMS/Text',
        optional: true
    },
    hotListFirstName: {
        type: Boolean,
        label: 'Preface with first name?',
        optional: false
    },
    userNumber: {
        type: String,
        optional: true,
        label: 'SMS/Text origin number(s)'
    },
    contactableNumber: {
        type: String,
        optional: true,
        label: 'SMS/Text destination number'
    },
    contactableId: {
        type: String,
        label: 'Entity'
    }
});


AutoForm.hooks({
    AddNoteRecord: {
        before: {
            addContactableNote: function (doc) {
                if (doc.sendAsSMS && Session.get('entityId')==Session.get('hotListId'))
                {
                    var hotlist=HotLists.findOne(Session.get('hotListId'));
                    if (!hotlist || !hotlist.members) return false;
                    Utils.showModal('basicModal', {
                        title: 'Confirm send' ,
                        message: 'Send to the ' + hotlist.members.length + ' members of hot list \'' + hotlist.displayName + '\'.  Continue?',
                        buttons: [{label: 'Cancel', classes: 'btn-default', value: false}, {label: 'Send', classes: 'btn-success', value: true}],
                        callback: function (result) {
                            if (!result) {
                                return false;
                            }
                        }
                    });

                };
                var initialLink = {
                    id: Session.get('entityId'),
                    type: Utils.getEntityTypeFromRouter()
                };
                doc.links = doc.links || [initialLink];
                doc.contactableId = Session.get('entityId');
                return doc;
            }
        }
    }
});
self.defaultUserNumber = null;
self.defaultMobileNumber = null;
var hotlist=null;
Template.notesTabAdd.helpers({
    isHotListNote: function () {
        hotlist = HotLists.findOne(this._id);
        return (hotlist)? true: false; // hide numbers if hotlist
    },
    isContactableNote: function () {
        var contactable = Contactables.findOne(this._id);
        return (contactable)? true:false; // hide numbers if hotlist
    },
    mobileNumbers: function () {
        var contactable = Contactables.findOne(this._id);
        if (!contactable) return;
        return Utils.getContactableMobilePhones(contactable).map(function (number) {
            var result = {
                label: number,
                value: number
            };
            if (!self.defaultMobileNumber) self.defaultMobileNumber = result.value;
            return result;
        });
    }
    ,
    userNumbers: function () {
        var user = Meteor.user();
        return Hierarchies.find({_id: user.currentHierId, phoneNumber: {$exists: true}}).map(function (userHier) {
            var result = {
                label: userHier.phoneNumber.value, //displayName + ' - ' + userHier.name,
                value: userHier.phoneNumber.value
            };
            if (!self.defaultUserNumber) self.defaultUserNumber = result.value;
            return result;
        });
    }
    ,
    defaultMobileNumber: function () {
        return self.defaultMobileNumber;
    }
    ,
    defaultUserNumber: function () {
        return self.defaultUserNumber;
    }
})
;

// List
var NotesHandler;

Template.notesTabList.created = function () {
    var self = this;


    Meteor.autorun(function () {
        var searchQuery = {
            links: {
                $elemMatch: {
                    id: Session.get('entityId')
                }
            }
        };
        if (!SubscriptionHandlers.NotesHandler) {
            SubscriptionHandlers.NotesHandler = Meteor.paginatedSubscribe('notes', {filter: searchQuery});
        } else {
            SubscriptionHandlers.NotesHandler.setFilter(searchQuery);
        }
        NotesHandler = SubscriptionHandlers.NotesHandler;
    });
};
Template.notesTabList.helpers({
    items: function () {
        return Notes.find({links: {$elemMatch: {id: Session.get('entityId')}}}, {sort: {dateCreated: -1}});
    },
    isLoading: function () {
        return !SubscriptionHandlers.NotesHandler.ready();
    }
});

// Record

Template.notesTabItem.helpers({
    getCtx: function () {
        var self = this;
        return {
            noteRecord: self,
            isEditing: new ReactiveVar(false)
        };
    },
    isEditing: function () {
        return this.isEditing.get();
    },
    getEntity: Utils.getEntityFromLink,
    getUrl: Utils.getHrefFromLink
});

Template.notesTabItem.events({
    'click .deleteNoteRecord': function () {
        var id = this.noteRecord._id;

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
                    Notes.remove({_id: id});
                }
            }
        });
    },
    'click .editNoteRecord': function () {
        // Open edit mode
        this.isEditing.set(!this.isEditing.get());
    }
});

// Edit record

Template.notesTabEditItem.helpers({
    created: function () {
        var self = this;

        self.data.formId = Random.hexString(10);
    }
});

Template.notesTabEditItem.events({
    'click .cancelNoteRecordChanges': function () {
        // Close edit mode
        var ctx = Template.parentData(1);
        ctx.isEditing.set(!ctx.isEditing.get());
    }
});

// Links


var isEditing = new ReactiveVar(false);

Template.linksAutoForm.created = function () {
    var self = this;
    var ctx = Template.parentData(1);

    var initialLink = {
        id: ctx._id,
        type: Utils.getEntityTypeFromRouter()
    };

    self.data.links = self.data.value || [initialLink];
    self.data.typeDep = new Tracker.Dependency();
    self.data.linkedDep = new Tracker.Dependency();

    Meteor.subscribe('allContactables');
    Meteor.subscribe('allJobs');
    Meteor.subscribe('allPlacements');

    if (self.data.value)
        return; // Don't reset form on edit mode

    //// TODO: Find another way to reset links when form is submitted
    //var formTemplate = UI.getView().parentView.parentView.parentView.parentView.parentView.parentView;
    //if (!hotlist) {
    //    formTemplate.template.events({
    //        'reset form': function () {
    //            self.data.links = [initialLink];
    //            self.data.linkedDep.changed();
    //        }
    //    });
    //};
    isEditing.set(false);
}

Template.linksAutoForm.helpers({
    links: function () {
        this.linkedDep.depend();
        return this.links;
    },
    types: function () {
        return _.map(_.filter(_.keys(Enums.linkTypes), function (key) {
            return !_.contains(['deal', 'candidate'], key);
        }), function (key) {
            return Enums.linkTypes[key];
        });
    },
    entities: function () {
        this.typeDep.depend();
        var DOM = UI.getView()._domrange;
        if (!DOM)
            return;

        var selectedType = DOM.$('#noteTypeSelect').val();
        selectedType = parseInt(selectedType);
        switch (selectedType) {
            case Enums.linkTypes.contactable.value:
                return AllContactables.find();
            case Enums.linkTypes.job.value:
                return AllJobs.find();
            case Enums.linkTypes.placement.value:
                return AllPlacements.find();
            default :
                return [];
        }
    },
    getEntity: Utils.getEntityFromLinkForAdd,
    isEditing: function () {
        return isEditing.get();
    }
});

var link = function (ctx, link) {

};

Template.linksAutoForm.events({
    'change #noteTypeSelect': function () {
        var ctx = Template.parentData(0);
        ctx.typeDep.changed();
    },
    'click #noteLinkEntity': function () {
        var ctx = Template.parentData(0);
        var type = UI.getView()._templateInstance.$('#noteTypeSelect').val();
        type = parseInt(type);
        var entity = UI.getView()._templateInstance.$('#noteEntitySelect').val();
        if (!_.isNumber(type) || !entity) return;

        var link = {
            type: type,
            id: entity
        };

        if (_.findWhere(ctx.links, {id: link.id})) return;

        ctx.links.push(link);
        ctx.linkedDep.changed();
    },
    'click .remove-link': function () {
        var ctx = Template.parentData(0);
        var links = ctx.links;
        Template.parentData(0).links = _(links).without(this);
        ctx.linkedDep.changed();
    },
    'click #editLinks': function () {
        isEditing.set(true);
    }
});