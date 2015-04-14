var self = {};
var searchQuery = {};
var addDisabled = new ReactiveVar(false);

var displayToString = function(){
  var c = Contactables.findOne({_id:Session.get('entityId')});
  if(c) {

    if (c.Employee) {
      return 'Display to employee';
    }
    else if (c.Contact) {
      return 'Display to contact';
    }
    else if (c.Client) {
      return 'Display to client';
    }
  }
};

var sortDep=new Deps.Dependency;
var checkSMSDep = new Deps.Dependency;
var NotesHandler;

// Links
var links,
    linkedDep = new Tracker.Dependency();

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
        optional: true,
        label: displayToString

    }
});


AutoForm.hooks({
    AddNoteRecord: {
        onSubmit: function (insertDoc, updateDoc, currentDoc) {

            addDisabled.set(true);
            if(!hotlist) {
                var self = this;
                //for some reason autoValue doesn't work

                insertDoc.contactableId = Session.get('entityId');

                Meteor.call('addContactableNote', insertDoc, function () {
                    self.done();
                    addDisabled.set(false);
                })
            }
            else if(hotlist){
                var self = this;
                insertDoc.hierId = Meteor.user().currentHierId;
                insertDoc.userId = Meteor.user()._id;
                Meteor.call('addNote', insertDoc, function () {
                    self.done();
                    addDisabled.set(true);
                })
            }
            else{

            }
            return false;
        }

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
Template.notesTabAdd.events({
    'change #sendAsSMS': function(){
        checkSMSDep.changed();
    }
});
Template.notesTab.created = function () {
  addDisabled.set(false);
    hotlist = HotLists.findOne({_id:Session.get('entityId')});
    if (this.data && this.data.responseOnly) {
        responsesOnly = true;
    }
    else {
        responsesOnly = false;
    }
};
Template.notesTabAdd.helpers({
    addDisabled: function(){
      return addDisabled.get() ? 'disabled' : '';
    },
    isHotListNote: function () {
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
    },
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
    },
    ischeckedSMS: function(){
        checkSMSDep.depend();
        var field = $("#sendAsSMS");
        if(field[0] && field[0].checked){
            return true;
        }
        else{
            return false;
        }

    }
});



// List
var query = new Utils.ObjectDefinition({
    reactiveProps: {
        searchString: {}
    }
});

Template.notesTabList.created = function () {
    var self = this;

    Meteor.subscribe('allContactables');
    Meteor.subscribe('allJobs');
    Meteor.subscribe('allPlacements');

    Meteor.autorun(function () {
            searchQuery={};
            if (responsesOnly && hotlist) //means only get responses to a hotlist send
            {
                searchQuery['isReply'] = true;
                searchQuery.links = {
                    $elemMatch: {
                        id: Session.get('entityId')
                    }
                };
                searchQuery.msg = {
                    $regex: query.searchString.value,
                    $options: 'i'
                };

                if (!NotesHandler) {
                    NotesHandler = Meteor.paginatedSubscribe('notes', {filter: searchQuery});
                    NotesHandler.setFilter(searchQuery);


                } else {
                    NotesHandler.setFilter(searchQuery);
                    //NotesHandler.setOptions(hotlist);

                }
            }
            else if(hotlist) {
                searchQuery['isReply'] = {$exists: false};
                searchQuery.links = {
                    $elemMatch: {
                        id: Session.get('entityId')
                    }
                };
                searchQuery.msg = {
                    $regex: query.searchString.value,
                    $options: 'i'
                };
                if (!NotesHandler) {
                    NotesHandler = Meteor.paginatedSubscribe('notes', {filter: searchQuery});
                    NotesHandler.setFilter(searchQuery);

                } else {
                    NotesHandler.setFilter(searchQuery);


                }
            }
            else{
                //contactable
                searchQuery.links = {
                    $elemMatch: {
                        id: Session.get('entityId')
                    }
                };
                searchQuery.msg = {
                    $regex: query.searchString.value,
                    $options: 'i'
                };
                if (!NotesHandler) {
                    NotesHandler = Meteor.paginatedSubscribe('notes', {filter: searchQuery});
                    NotesHandler.setFilter(searchQuery);

                } else {
                    NotesHandler.setFilter(searchQuery);


                }
            }
        }
    )
    ;
}
;
Template.notesTabList.destroyed = function () {
    query.searchString.value = '';
    //NotesHandler.stop();
    //delete NotesHandler;
}
Template.notesTabList.helpers({
    hasItems: function () {
        return (Notes.find(searchQuery,{sort: {dateCreated:-1}}).fetch().length > 0);
    },
    items: function () {
        sortDep.depend();
        return Notes.find(searchQuery,{sort: {dateCreated:-1}});
    },
    isLoading: function () {
        return NotesHandler.isLoading();
    },
    query: function() {
        return query;
    }
});
Template.notesTabList.events({
    'keyup #searchString': _.debounce(function(e){
        query.searchString.value = e.target.value;
    })
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

Template.linksAutoForm.created = function() {
    var self = this;

    var initialLink = {
        id: Session.get('entityId'),
        type: Utils.getEntityTypeFromRouter()
    };

    links = self.data.value || [initialLink];
    linkedDep.changed();
};

AutoForm.addInputType('linkInput',{
    template: 'linksAutoForm',
    valueOut: function () {
        return links
    }
});

Template.linksAutoForm.events({
    'click #toggleAddNoteModal': function(){
        Utils.showModal('noteAdd', function(data) {
            data = data || {};
            if(_.findWhere(links, {id: data.id})) return false;
            links.push(data);
            linkedDep.changed();
            Utils.dismissModal();
        });
    },
    'click .btn-remove': function (e) {
        e.preventDefault();

        //Template.currentData().links = _.without(links, this);
        var link = this;
        var newLinks;
        _.each(links, function(l) {
            if(l.id == link._id) {
                newLinks = links.filter(function(element) {
                    return element.id != l.id
                });
            } else {
                return;
            }
        });
        links = newLinks;
        linkedDep.changed();

        return false;
    }
});

Template.linksAutoForm.helpers({
    links: function () {
        linkedDep.depend();
        return links;
    },
    getEntity: Utils.getEntityFromLinkForAdd
});