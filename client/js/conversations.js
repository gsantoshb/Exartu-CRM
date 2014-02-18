ConversationsController = RouteController.extend({
    template: 'conversations',
    waitOn: function () {
        return [Meteor.subscribe('messages'), Meteor.subscribe('conversations')];
    },
    action: function () {
        Session.set('conversationSelected', this.params.hash);
        this.render();
    }
});

Template.conversations.rendered = function () {
    var viewmodel = function () {
        var self = this;

        self.conversations = ko.meteor.find(Conversations, {
            $or: [
                {
                    user1: Meteor.userId()
                },
                {
                    user2: Meteor.userId()
                }
            ]
        });

        self.isSelected = function (conversation) {
            return self.selectedConversation() && conversation._id() == self.selectedConversation()._id();
        }
        self.selectedConversation = ko.observable('');
        self.selectedConversation.subscribe(function (newConversationSelected) {
            Router.go('/messages#' + newConversationSelected._id());
            $('#conversationMessagesNode').html(Template.conversationMessages());
            Template.conversationMessages.rendered();
        });
        if (self.conversations()[0])
            setTimeout(function () {
                self.selectedConversation(self.conversations()[0]);
            }, 50); // HACK: Wait to render and apply binding cuz it's hidding by Meteor and idk why

        // New conversation

        self.systemUsers = ko.observableArray(
            _.filter(
                Meteor.users.find({}).fetch(),
                function (user) {
                    return user._id != Meteor.userId() && !_.contains(
                        _.map(self.conversations(), function (conversation) {
                            return conversation.user1() == Meteor.userId() ? conversation.user2() : conversation.user1();
                        }), user._id);
                })
        );

        self.newConversationStep = ko.observable(1);
        self.nextNewConversationStep = function () {
            self.newConversationStep(self.newConversationStep() + 1);
        }
        self.newConversationUser = ko.observable();
        self.newConversationUser.subscribe(function (newConversationUser) {
            if (!newConversationUser)
                return;

            self.newConversationStep(1);
            Meteor.call('createConversation', Meteor.userId(), newConversationUser[0], function (err, result) {
                if (!err) {
                    var newConversation = Conversations.findOne({
                        _id: result
                    });
                    self.selectedConversation(ko.mapping.fromJS(newConversation));
                    self.newConversationUser('');
                    self.systemUsers.remove(function (user) {
                        return user._id == newConversationUser[0]
                    });
                    ko.utils.arrayRemoveItem(self.systemUsers, newConversationUser[0]);
                } else
                    console.log(err);
            });
        });

        self.getUserDestination = function (conversation) {
            return conversation.user1() == Meteor.userId() ? conversation.user2() : conversation.user1()
        };

        return self;
    };

    helper.applyBindings(viewmodel, 'conversationsVM');
}