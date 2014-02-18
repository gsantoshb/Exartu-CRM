Template.conversationMessages.viewModel = function () {
    var self = this,
        conversationSelected = Session.get('conversationSelected');

    self.isConversationSelected = ko.observable(true);

    // List messages
    if (!conversationSelected) {
        self.isConversationSelected(false);
        return self;
    }

    var currenCconversation = Conversations.findOne({
        _id: conversationSelected
    });
    self.userDestination = currenCconversation.user1 == Meteor.userId() ? currenCconversation.user2 : currenCconversation.user1;

    self.messages = ko.meteor.find(Messages, {
        $or: [{
            from: self.userDestination,
            destination: Meteor.userId()
                }, {
            from: Meteor.userId(),
            destination: self.userDestination
                }]
    }, {
        sort: {
            createdAt: 1
        },
    });

    // Create messages

    self.newMessage = ko.observable("");
    self.addMessage = function () {
        Meteor.call('createMessage', {
                content: self.newMessage(),
                destination: self.userDestination
            },
            function (err, result) {
                if (!err) {
                    self.newMessage("");
                }
            });
    };

    return self;
};