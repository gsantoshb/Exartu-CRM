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
            completed: null,
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

            completed: null,

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
            completed: null,

            begin: {
                $gt: new Date()
            }
        }
    }
];

Template.tasks.viewModel = function () {
    var self = {};
    self.searchString = ko.observable();
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

    self.ownedByMe = ko.observable(false);
    self.assigned = ko.observable(true);
    self.assignedTo = ko.observable(Meteor.userId());

    self.users = ko.meteor.find(Meteor.users, {});
    var query = ko.computed(function () {

        var q = {};
        var selectedState = self.selectedState();
        if (selectedState) {
            _.extend(q, selectedState.query);
        }

        q.inactive = {
            $ne: true
        };
        if (self.ownedByMe()) {
            q.userId = Meteor.userId();
        }
        if (self.assigned() && self.assignedTo()) {
            q.assign = self.assignedTo()
        }
        if (self.searchString()) {
            q.note = {
                $regex: self.searchString()
            };
        }
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