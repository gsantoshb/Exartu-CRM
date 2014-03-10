Template.addConversation.viewModel = function () {
    var self = this;

    self.systemUsers = ko.observableArray(
        _.filter(
            Meteor.users.find({}).fetch(),
            function (user) {
                return user._id != Meteor.userId();
            }
        )
    );

    self.newConversation = ko.validatedObservable({
        subject: ko.observable().extend({
            required: true
        }),
        destination: ko.observable().extend({
            required: true
        }),
        message: ko.observable().extend({
            required: true
        })
    })

    self.createConversation = function () {
        if (!self.newConversation.isValid()) {
            self.newConversation.errors.showAllMessages();
        }
        Meteor.call('createConversation', {
            user2: self.newConversation().destination(),
            subject: self.newConversation().subject()
        }, function (err, result) {
            if (!err) {
                Meteor.call('createMessage', {
                    conversationId: result,
                    content: self.newConversation().message(),
                    destination: self.newConversation().destination(),
                });
                $('#addConversationModal').modal('hide');
            }
        })
    };

    return self;
}