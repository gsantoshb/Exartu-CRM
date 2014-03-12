ConversationController = RouteController.extend({
    template: 'conversation',
});

Template.conversation.viewModel = function () {
    var self = this,
        conversationId = Router.current().params._id;

    self.conversation = Conversations.findOne({
        _id: conversationId
    });

    // Mark conversion as readed
    var markReadState = function (state) {
        var set = {
            $set: {}
        }
        if (self.conversation.user1 == Meteor.userId())
            set.$set = {
                user1Readed: state
            };
        else
            set.$set = {
                user2Readed: state
            };
        Conversations.update({
            _id: self.conversation._id
        }, set);
    };

    markReadState(true);

    setTimeout(function () {
        Meteor.call('markConversationMessagesAsReaded', self.conversation._id);
    }, 1000);

    self.destinationUser = self.conversation.user1 == Meteor.userId() ? self.conversation.user2 : self.conversation.user1;

    self.messages = ko.meteor.find(Messages, {
        conversationId: conversationId
    });
    self.messages.subscribe(function (values) {
        var newValue = values[values.length - 1];
        if (newValue.destination() == Meteor.userId())
            Messages.update({
                _id: newValue._id()
            }, {
                $set: {
                    readed: true
                }
            });
    });

    self.newMessage = ko.observable("");

    self.createMessage = function () {
        Meteor.call('createMessage', {
            conversationId: conversationId,
            content: self.newMessage(),
            destination: self.destinationUser
        },function(){
            self.newMessage("");
        });
    };

    self.markAsUnread = function () {
        markReadState(false);
    };

    self.getMessageUser = function (message) {
        return message.destination() == Meteor.userId() ? self.destinationUser : Meteor.userId();
    };

    self.unreadMessageFadeIn = function (element, data) {
        if (!data.readed())
            $(element).filter("li")
                .animate({
                    backgroundColor: 'rgba(238, 203, 114, 0.22)'
                }, 100)
                .animate({
                    backgroundColor: 'white'
                }, 800);
    };

    self.deleteConversation = function () {
        Meteor.call('deleteConversation', function (err, result) {
            if (!err)
                Router.current().redirect('/inbox');
        });
    }

    return self;
}