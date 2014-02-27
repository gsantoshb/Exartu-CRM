TasksController = RouteController.extend({
    template: 'tasks',
    waitOn: function () {
        return [Meteor.subscribe('tasks')];
    }
});
var states = [
    {
        name: 'Pending',
        query: {
            $or: [{
                completed: null,
               }, {
                completed: {
                    $exists: false
                }
            }],
            begin: {
                $lte: new Date(),
            },
            end: {
                $gte: new Date(),
            }
        }
    }, {
        name: 'Closed',
        query: {
            $or: [{
                completed: null,
               }, {
                completed: {
                    $exists: false
                }
            }],

            begin: {
                $lt: new Date(),
            },
            end: {
                $lt: new Date(),
            }
        }
    }, {
        name: 'Completed',
        query: {
            completed: {
                $ne: null
            }
        }
    }, {
        name: 'Future',
        query: {
            $or: [{
                completed: null,
               }, {
                completed: {
                    $exists: false
                }
            }],
            begin: {
                $gt: new Date()
            }
        }
    },
]
Template.tasks.viewModel = function () {
    var self = {};

    self.selectedState = ko.observable();
    self.states = ko.observableArray(states);
    self.selectState = function (data) {
        if (self.selectedState() == data) {
            self.selectedState(false);
        } else {
            self.selectedState(data);
        }
    }
    self.clearState = function () {
        self.selectedState(false);
    }

    var query = ko.computed(function () {

        var q = {};
        var selectedState = self.selectedState();
        if (selectedState) {
            _.extend(q, selectedState.query);
        }

        q.inactive = {
            $ne: true
        };
        console.dir(q);
        return q;
    });


    self.tasks = ko.meteor.find(Tasks, query);
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