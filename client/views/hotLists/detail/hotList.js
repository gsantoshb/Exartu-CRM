var hotListCollection = HotLists;
var HotListMembersHandler;

HotListController = RouteController.extend({
    layoutTemplate: 'mainLayout',
    waitOn: function () {
        if (!SubscriptionHandlers.HotListMembersHandler) {
            SubscriptionHandlers.HotListMembersHandler = Meteor.paginatedSubscribe( 'hotListMembers', {pubArguments: this.params._id});
        }
        HotListMembersHandler = SubscriptionHandlers.HotListMembersHandler;

        return [Meteor.subscribe('hotListDetails', this.params._id), GoogleMapsHandler, HotListMembersHandler]
        //return [Meteor.subscribe('hotListDetails', this.params._id), GoogleMapsHandler];
    },
    data: function () {
        Session.set('entityId', this.params._id);
        Session.set('hotListId', this.params._id);
    },
    action: function () {
        if (!this.ready()) {
            this.render('loadingContactable');
            return;
        }
        this.render('hotList');
        Session.set('activeTab', this.params.tab || 'members');
    },
    onAfterAction: function () {
        var title = Session.get('displayName'),
            description = 'HotList information';
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

var self = {};
Utils.reactiveProp(self, 'editMode', false);
var location = {};
Utils.reactiveProp(location, 'value', null);
var services;
var hotList, originalHotList;
var hotListMembersDep = new Deps.Dependency();

Template.hotList.created = function () {
    self.editMode = false;
    originalHotList = hotListCollection.findOne({_id: Session.get('entityId')});
    Session.set('hotListDisplayName', originalHotList.displayName);
    var definition = {
        reactiveProps: {
            tags: {
                default: originalHotList.tags,
                update: 'tags',
                type: Utils.ReactivePropertyTypes.array
            }
        }
    };
    services = Utils.ObjectDefinition(definition);
};


Template.hotList.helpers({
    hotList: function () {
        //var originalHotList=hotListCollection.findOne({ _id: Session.get('entityId') });
        //Session.set('displayName', originalHotList.displayName);
        if (originalHotList.tags == null) {
            originalHotList.tags = [];
        }
        if (!hotList)
            hotList = new dType.objInstance(originalHotList, HotLists);
        return hotList;
    },
    originalHotList: function () {
        return hotListCollection.findOne({_id: Session.get('entityId')});
    },
    editMode: function () {
        return self.editMode;
    },
    colorEdit: function () {
        return self.editMode ? '#008DFC' : '#ddd'
    }
});

Template.hotList.events({
    'click .editHotList': function () {
        self.editMode = !self.editMode;
    },
    'click .saveButton': function () {
        if (!hotList.validate()) {
            hotList.showErrors();
            return;
        }
        var update = hotList.getUpdate();
        var originalHotList = hotListCollection.findOne({_id: Session.get('entityId')});
        if (services.tags.value.length > 0)
            update.$set.tags = services.tags.value;

        hotListCollection.update({_id: hotList._id}, update, function (err, result) {
            if (!err) {
                self.editMode = false;
                hotList.reset();
            }
        });
    },
    'click .cancelButton': function () {
        self.editMode = false;
    }
});
var editingDisplayName= new ReactiveVar(false);
Template.hotListHeader.helpers({
    hotList: function(){
        //var originalHotList = HotLists.findOne({ _id: Session.get('entityId') });
        return new dType.objInstance(originalHotList, HotLists);
    },
    statusClass: function (statusId) {
        var lu = LookUps.findOne(statusId);
        if(lu && lu.displayName == 'Active') return 'success';
        else return 'error';
    },
    editMode: function () {
        return self.editMode;
    },
    editingDisplayName: function () {
        return editingDisplayName.get();
    }
});

Template.hotListHeader.events({
    'click #toggle-status': function(e, ctx){
        var hotList = hotListCollection.findOne({_id: Session.get('entityId')});
        var statuses = LookUps.find({lookUpCode: 13}).fetch();
        var status = undefined;

        if(hotList.activeStatus == statuses[0]['_id'])
            status = statuses[1]['_id'];
        else
            status = statuses[0]['_id'];

        hotListCollection.update({_id: hotList._id}, {$set: {activeStatus: status}}, function(err, result) {});
    },
    'click .toggle-edit-mode': function () {
        self.editMode = !self.editMode;
    },
    'click .saveButton': function () {
        var statusNote = $('#statusNote').val();

        hotListCollection.update({_id: hotList._id}, {$set: {statusNote: statusNote}}, function (err, result) {
            if (!err) {
                self.editMode = false;
            }
            else{
                alert(err);
            }
        });
    },
    'click .cancelButton': function () {
        self.editMode = false;
    },
    'click #editDisplayName': function () {
        editingDisplayName.set(true);
    },
    'click .saveDisplayNameButton': function () {
        var displayName = $('#displayName').val();

        hotListCollection.update({_id: hotList._id}, {$set: {displayName: displayName}}, function (err, result) {
            if (!err) {
                editingDisplayName.set(false);
            }
            else{
                alert(err);
            }
        });
    },
    'click .cancelDisplayNameButton': function () {
        editingDisplayName.set(false);
    }
});

// Tabs
Template.hotList_nav.helpers({
    isActive: function (id) {
        return (id == Session.get('activeTab')) ? 'active' : '';
    }
})
var tabs;
Template.hotList_nav.helpers({
    tabs: function () {
        tabs = [
//      {id: 'activities', displayName: 'Activities', template: 'entityActivities'},
//            {id: 'details', displayName: 'Details', template: 'hotList_details'},
            {id: 'members', displayName: 'Members', template: 'hotList_members'},
            {id: 'notes', displayName: 'Notes', template: 'hotList_notes'},

            {id: 'responses', displayName: 'Responses', template: 'hotList_responses'},
        ];

        return tabs;
    },
    getEntityId: function () {
        return Session.get('entityId');
    }
});

Template.hotList_details.helpers({
    originalHotList: function () {
        return hotListCollection.findOne({_id: Session.get('entityId')});
    }
});

Template.hotList_members.helpers({
    //handler: function () {
    //    return HotListMembersHandler;
    //},
    originalHotList: function () {
        return originalHotList;
    }
});

Template.hotList.currentTemplate = function () {
    var selected = _.findWhere(tabs, {id: Session.get('activeTab')});
    return selected && selected.template;
};
Template.hotListMembers.helpers({
    hotListMembers: function () {
        hotListMembersDep.depend();
        return Contactables.find({_id: {$in: originalHotList.members}}, {sort: {displayName: 1}});
    },
    memberCount: function() {
        return originalHotList.members.length;
    },
    getAcronym: function(str) {
        //var str     = "Java Script Object Notation";
        var matches = str.match(/\b(\w)/g);
        return matches.join('');
    }
});
Template.hotList.events({
    'click .remove': function (e, ctx) {
        originalHotList.members.splice(originalHotList.members.indexOf(this._id), 1);
        hotListMembersDep.changed();
        hotListCollection.update({_id: hotList._id}, {$set: {members: originalHotList.members}});
    },
    'click .goBack': function () {
        history.back();
    }
});