MessagesController = RouteController.extend({
	template: 'messages',
	waitOn: function () {
		return [Meteor.subscribe('messages')];
	}
});

Template.messages.rendered = function () {
	var viewmodel = function () {
		var self = this;

		self.users = ko.observableArray(
            _.map(
                _.uniq(Messages.find(
                    {
                        $or: [{
                            destination: Meteor.userId(),
                        }, {
                            from: Meteor.userId()
                        }]
                    }, {
                        sort: {
                            createdAt: -1
                        },
                }
                ).fetch(), false, function (message) {
                    var otherUser = message.from == Meteor.userId()? message.destination : message.from;
                    return otherUser;
                }), function(user) {
                    user.aux = user.from == Meteor.userId()? true : false;
                    return user;
                }
            )
        );

		var getUserMessages = function (userId) {
            if (!self.messages)
                self.messages = ko.meteor.find(Messages, { 
                    $or: [{
                        from: userId, 
                        destination: Meteor.userId()
                    }, { 
                        from: Meteor.userId(), 
                        destination: userId
                    }]
                }, {
                    sort: {
                        createdAt: 1
                    },
                });
            else
                self.messages(ko.mapping.fromJS(Messages.find({ 
                    $or: [{
                        from: userId, 
                        destination: Meteor.userId()
                    }, { 
                        from: Meteor.userId(), 
                        destination: userId
                    }]
                }, {
                    sort: {
                        createdAt: 1
                    },
                }).fetch())());
		}

        self.isSelected = function(user) {
            return ( !user.aux && user.from == self.selectedUser() ) || ( user.aux && user.destination == self.selectedUser() );
        }
		self.selectedUser = ko.observable('');
		self.selectedUser.subscribe(function (newUserSelected) {
			getUserMessages(newUserSelected);
		});

        self.selectUser = function(user) {
            self.selectedUser(user.aux? user.destination : user.from);   
        }
        
		if (self.users()[0])
			self.selectUser(self.users()[0]);

		self.newMessage = ko.observable("");
		self.addMessage = function () {
			Meteor.call('createMessage', {
					content: self.newMessage(),
					destination: self.selectedUser()
				},
				function (err, result) {
					if (!err) {
						self.newMessage("");
					}
				});
		};
        
        // New conversation
        
        self.systemUsers = ko.observableArray(
            _.filter(
                Meteor.users.find({}).fetch(), 
                function(user) {
                    return user._id != Meteor.userId() && 
                        !_.contains(
                            _.map(self.users(), function(userMessage){
                                return userMessage.from;
                        }), user._id);
            }) 
        );
        
        self.newConversationStep = ko.observable(1);
        self.nextNewConversationStep = function() {
           self.newConversationStep(self.newConversationStep() + 1);
        }
        self.newConversationUser = ko.observable();
        self.newConversationUser.subscribe(function(newConversationUser) {
                self.newConversationStep(1);
                self.users.push({ from: newConversationUser[0], content: '', createdAt: Date.now(), readed: true });
                self.selectedUser(newConversationUser[0]);
                self.systemUsers()
        })
        
		return self;
	};

	helper.applyBindings(viewmodel, 'messagesVM', MessagesHandler);
}