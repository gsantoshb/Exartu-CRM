ConversationsController = RouteController.extend({
    template: 'conversations',
});

Template.waitOn = ['conversationsHandler'];
Template.conversations.viewModel = function () {
    var self = this;

    self.newest = ko.observable(true);
    var query = ko.computed(function () {
        return {
            $or: [
                {
                    user1: Meteor.userId()
                },
                {
                    user2: Meteor.userId()
                }
            ]
        };
    });

    var options = ko.computed(function () {
        return {
            sort: {
                'createdAt': (self.newest() ? -1 : 1)
            }
        };
    });

    self.conversations = ko.meteor.find(Conversations, query, options);

    self.sortCriteria = ko.computed(function () {
        if (self.newest())
            return "Newest";
        if (!self.newest())
            return "Oldest";
    });

    _.forEach(self.conversations(), function (conversation) {
        _.extend(conversation, {
            selected: ko.observable(false)
        });
    });

    self.conversations.subscribe(function (conversations) {
        _.forEach(conversations, function (conversation) {
            _.extend(conversation, {
                selected: ko.observable(false)
            });
        });
    });

    self.selectionMode = ko.computed(function () {
        return _.some(self.conversations(), function (conversation) {
            return conversation.selected();
        })
    });

    self.selectAll = function () {
        _.forEach(self.conversations(), function (conversation) {
            conversation.selected(true);
        });
    };

    self.clearSelections = function () {
        _.forEach(self.conversations(), function (conversation) {
            conversation.selected(false);
        });
    };

    self.markAsUnread = function () {
        _.forEach(self.conversations(), function (conversation) {
            if (conversation.selected()) {
                var set = {
                    $set: {}
                }
                if (conversation.user1() == Meteor.userId())
                    set.$set = {
                        user1Readed: false
                    };
                else
                    set.$set = {
                        user2Readed: false
                    };
                Conversations.update({
                    _id: conversation._id()
                }, set);
            }
        })
    }

    self.getUserDestination = function (conversation) {
        return conversation.user1() == Meteor.userId() ? conversation.user2() : conversation.user1()
    };

    return self;
};