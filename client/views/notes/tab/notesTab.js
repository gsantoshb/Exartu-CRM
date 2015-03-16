var self = {};
var searchQuery = {};
var sortDep=new Deps.Dependency;
var NotesHandler;
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
    optional: true
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
    label: 'Entity',
    autoValue: function () {
      return Session.get('entityId');
    }
  },
  displayToEmployee: {
    type: Boolean,
    optional: true
  }
});


//AutoForm.hooks({
//    AddNoteRecord: {
//        before: {
//            addContactableNote: function (doc) {
//                var initialLink = [{
//                    id: Session.get('entityId'),
//                    type: Utils.getEntityTypeFromRouter()
//                }];
//
//                var c = Contactables.findOne({_id: Session.get('entityId')});
//                if (c && c.Contact && c.Contact.client) {
//                    initialLink.push({id: c.Contact.client, type: Enums.linkTypes.contactable.value})
//                }
//                ;
//                doc.links = doc.links || initialLink;
//                doc.contactableId = Session.get('entityId');
//                if (doc.sendAsSMS && Session.get('entityId') == Session.get('hotListId')) {
//                    var hotlist = HotLists.findOne(Session.get('hotListId'));
//                    if (!hotlist || !hotlist.members) return false;
//                    var message = 'Send to the ' + hotlist.members.length + ' members of hot list \'' + hotlist.displayName + '\'.  Continue?';
//                    return (confirm(message)) ? doc : false;
//
//                }
//                ;
//                return doc;
//            }
//        },
//        onSuccess:
//            function (error, result, template) {
//                sortDep.changed();
//            }
//    }
//});
self.defaultUserNumber = null;
self.defaultMobileNumber = null;
var hotlist = null;
var responsesOnly = false;
var responsesOnlyDep = new Deps.Dependency;
Template.notesTabAdd.events({});
Template.notesTab.created = function () {
    if (this.view && this.view.parentView && this.view.parentView.name == "Template.hotList_responses") {
        responsesOnly = true;
    }
    else {
        responsesOnly = false;
    }
}
Template.notesTabAdd.helpers({
    isHotListNote: function () {
        hotlist = HotLists.findOne(this._id);
        return (hotlist) ? true : false; // hide numbers if hotlist
    },
    isContactableNote: function () {
        var contactable = Contactables.findOne(this._id);
        return (contactable) ? true : false; // hide numbers if hotlist
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


Template.notesTabList.created = function () {
    var self = this;


    Meteor.autorun(function () {
            responsesOnlyDep.depend();
            searchQuery={};

            if (responsesOnly && hotlist) //means only get responses to a hotlist send
            {
                searchQuery['links.id'] = {
                    $in: hotlist.members
                };
            }
            else {
                searchQuery.links = {
                    $elemMatch: {
                        id: Session.get('entityId')
                    }
                };
            }
            if (!NotesHandler) {
              NotesHandler = Meteor.paginatedSubscribe('notes', {filter: searchQuery});
            } else {
              NotesHandler.setFilter(searchQuery);
            }

        }
    )
    ;
}
;
Template.notesTabList.helpers({
    items: function () {
        sortDep.depend();
        return Notes.find(searchQuery,{sort: {dateCreated:-1}});
    },
    isLoading: function () {
        return !NotesHandler.ready();
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
        var self = this;
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
                  Meteor.call('removeNote', self._id);
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


var isEditing = new ReactiveVar(false), links, typeDep, linkedDep;


Template.linksAutoForm.created = function () {
    var self = this;

    var initialLink = {
        id: Session.get('entityId'),
        type: Utils.getEntityTypeFromRouter()
    };
  debugger;

    links = self.data.value || [initialLink];
    typeDep = new Tracker.Dependency();
    linkedDep = new Tracker.Dependency();

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

AutoForm.addInputType('linkInput',{
  template: 'linksAutoForm',
  valueOut: function () {
    console.log('links', links);
    return links
  }
});

Template.linksAutoForm.helpers({
    links: function () {
        linkedDep.depend();
        return links;
    },
    types: function () {
        return _.map(_.filter(_.keys(Enums.linkTypes), function (key) {
            return !_.contains(['deal', 'candidate'], key);
        }), function (key) {
            return Enums.linkTypes[key];
        });
    },
    entities: function () {
        typeDep.depend();
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
        typeDep.changed();
    },
    'click #noteLinkEntity': function () {
        var type = UI.getView()._templateInstance.$('#noteTypeSelect').val();
        type = parseInt(type);
        var entity = UI.getView()._templateInstance.$('#noteEntitySelect').val();
        if (!_.isNumber(type) || !entity) return;

        var link = {
            type: type,
            id: entity
        };

        if (_.findWhere(links, {id: link.id})) return;

        links.push(link);
        linkedDep.changed();
    },
    'click .remove-link': function () {

        Template.parentData(0).links = _(links).without(this);
        linkedDep.changed();
    },
    'click #editLinks': function () {
        isEditing.set(true);
    },
    'click #editLinksDone': function () {
        isEditing.set(false);
    }
});