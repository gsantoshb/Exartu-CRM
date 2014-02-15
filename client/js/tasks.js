TasksController = RouteController.extend({
    template: 'tasks',
    waitOn: function () {
        return [Meteor.subscribe('tasks')];
    }
});

Template.tasks.viewModel = function () {
    var self = {};

    self.tasks = ko.meteor.find(Tasks, {});
    self.add = function () {
        Composer.showModal('addTask');
    }
    //    self.isSelected = function (conversation) {
    //        return self.selectedConversation() && conversation._id() == self.selectedConversation()._id();
    //    }
    //    self.selectedConversation = ko.observable('');
    //    self.selectedConversation.subscribe(function (newConversationSelected) {
    //        Router.go('/messages#' + newConversationSelected._id());
    //        $('#conversationMessagesNode').html(Template.conversationMessages());
    //        Template.conversationMessages.rendered();
    //    });

    return self;
};