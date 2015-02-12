var leaderBoardCollection = LeaderBoards;

LeaderBoardController = RouteController.extend({
    layoutTemplate: 'mainLayout',
    waitOn: function () {
        return [Meteor.subscribe('leaderBoardDetails', this.params._id), GoogleMapsHandler]
    },
    data: function () {
        Session.set('entityId', this.params._id);
        Session.set('leaderBoardId', this.params._id);
    },
    action: function () {
        if (!this.ready()) {
            this.render('loadingContactable');
            return;
        }
        this.render('leaderBoard');
        Session.set('activeTab', this.params.tab || 'details');
    },
    onAfterAction: function () {
        var title = Session.get('displayName'),
            description = 'LeaderBoard information';
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
var leaderBoard, originalLeaderBoard;
var leaderBoardMembersDep = new Deps.Dependency();

Template.leaderBoard.created = function () {
    self.editMode = false;
    originalLeaderBoard = leaderBoardCollection.findOne({_id: Session.get('entityId')});
    Session.set('leaderBoardDisplayName', originalLeaderBoard.displayName);
    var definition = {
        reactiveProps: {
            tags: {
                default: originalLeaderBoard.tags,
                update: 'tags',
                type: Utils.ReactivePropertyTypes.array
            }
        }
    };
    services = Utils.ObjectDefinition(definition);
};


Template.leaderBoard.helpers({
    leaderBoard: function () {
        //var originalLeaderBoard=leaderBoardCollection.findOne({ _id: Session.get('entityId') });
        //Session.set('displayName', originalLeaderBoard.displayName);
        if (originalLeaderBoard.tags == null) {
            originalLeaderBoard.tags = [];
        }
        if (!leaderBoard)
            leaderBoard = new dType.objInstance(originalLeaderBoard, LeaderBoards);
        return leaderBoard;
    },
    originalLeaderBoard: function () {
        return leaderBoardCollection.findOne({_id: Session.get('entityId')});
    },
    editMode: function () {
        return self.editMode;
    },
    colorEdit: function () {
        return self.editMode ? '#008DFC' : '#ddd'
    }
});

Template.leaderBoard.events({
    'click .editLeaderBoard': function () {
        self.editMode = !self.editMode;
    },
    'click .saveButton': function () {
        if (!leaderBoard.validate()) {
            leaderBoard.showErrors();
            return;
        }
        var update = leaderBoard.getUpdate();
        var originalLeaderBoard = leaderBoardCollection.findOne({_id: Session.get('entityId')});
        if (services.tags.value.length > 0)
            update.$set.tags = services.tags.value;

        leaderBoardCollection.update({_id: leaderBoard._id}, update, function (err, result) {
            if (!err) {
                self.editMode = false;
                leaderBoard.reset();
            }
        });
    },
    'click .cancelButton': function () {
        self.editMode = false;
    }
});

// Tabs
Template.leaderBoard_nav.helpers({
    isActive: function (id) {
        return (id == Session.get('activeTab')) ? 'active' : '';
    }
})
var tabs;
Template.leaderBoard_nav.helpers({
    tabs: function () {
        tabs = [
//      {id: 'activities', displayName: 'Activities', template: 'entityActivities'},
            {id: 'details', displayName: 'Details', template: 'leaderBoard_details'},
            {id: 'notes', displayName: 'Notes', template: 'leaderBoard_notes'},

            {id: 'responses', displayName: 'Responses', template: 'leaderBoard_responses'},
        ];

        return tabs;
    },
    getEntityId: function () {
        return Session.get('entityId');
    }
});

Template.leaderBoard_details.helpers({
    originalLeaderBoard: function () {
        return leaderBoardCollection.findOne({_id: Session.get('entityId')});
    }
});

Template.leaderBoard.currentTemplate = function () {
    var selected = _.findWhere(tabs, {id: Session.get('activeTab')});
    return selected && selected.template;
};
Template.leaderBoardMembers.helpers({
    leaderBoardMembers: function () {
        leaderBoardMembersDep.depend();
        return Contactables.find({_id: {$in: originalLeaderBoard.members}}, {sort: {displayName: 1}});
    },
    memberCount: function() {
        return originalLeaderBoard.members.length;
    }
});
Template.leaderBoard.events({
    'click .remove': function (e, ctx) {
        originalLeaderBoard.members.splice(originalLeaderBoard.members.indexOf(this._id), 1);
        leaderBoardMembersDep.changed();
        leaderBoardCollection.update({_id: leaderBoard._id}, {$set: {members: originalLeaderBoard.members}});

    }
});