Template.addTask.viewModel = function () {
    var self = this;
    self.task = ko.validatedObservable({
        begin: ko.observable(new Date()).extend({
            required: true
        }),
        end: ko.observable(new Date()).extend({
            required: true
        }),
        assign: ko.observableArray().extend({
            required: true
        }),
        note: ko.observable()
        //        state: ['created'],
    });

    self.users = ko.meteor.find(Meteor.users, {});
    self.add = function () {
        if (!self.task.isValid()) {
            self.task.errors.showAllMessages();
            return;
        }

        var task = ko.toJS(self.task);
        task.state = [{
            name: 'created',
            date: new Date()
        }];
        Meteor.call('crateTask', task, function (err, result) {
            if (err) {
                console.dir(err);
            } else {
                $('#addTaskModal').modal('hide');
            }
        })
    };
    return self;
}