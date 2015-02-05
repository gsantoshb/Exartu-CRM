var hotListCollection = HotLists;

HotListController = RouteController.extend({
    layoutTemplate: 'mainLayout',
    waitOn: function () {
        return [Meteor.subscribe('hotListDetails', this.params._id), GoogleMapsHandler]
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
        Session.set('activeTab', this.params.tab || 'details');
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
            {id: 'details', displayName: 'Details', template: 'hotList_details'},
            {id: 'notes', displayName: 'Notes', template: 'hotList_notes'},
            {id: 'tasks', displayName: 'Tasks', template: 'hotList_tasks'}
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

Template.hotList.currentTemplate = function () {
    var selected = _.findWhere(tabs, {id: Session.get('activeTab')});
    return selected && selected.template;
};
Template.hotListMembers.helpers({
    hotListMembers: function () {
        hotListMembersDep.depend();
        console.log('hotlist', originalHotList);
        return Contactables.find({_id: {$in: originalHotList.members}}, {sort: {displayName: 1}});
    }
});
Template.hotList.events({
    'click .remove': function (e, ctx) {
        originalHotList.members.splice(originalHotList.members.indexOf(this._id), 1);
        hotListMembersDep.changed();
        hotListCollection.update({_id: hotList._id}, {$set: {members: originalHotList.members}});

    }
});