TasksController = RouteController.extend({
    template: 'tasks',
    waitOn: function () {
        return [Meteor.subscribe('tasks')];
    }
});

Template.tasks.viewModel = function () {
    var self = {};

    self.tasks = ko.meteor.find(Tasks, {
        inactive: {
            $ne: true
        }
    });
    self.add = function () {
        Composer.showModal('addEditTask');
    }
    self.edit = function (data) {
        Composer.showModal('addEditTask', ko.toJS(data));
    }
    self.remove = function (data) {
        var task = ko.toJS(data);
        Tasks.update({
            _id: task._id,
        }, {
            $set: {
                inactive: true,
            }
        });
    };
    self.complete = function (data) {
        var task = ko.toJS(data);
        Tasks.update({
            _id: task._id
        }, {
            $set: {
                completed: new Date()
            }
        });
    };

    return self;
};