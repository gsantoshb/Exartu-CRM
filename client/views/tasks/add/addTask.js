Template.addTask.viewModel = function () {
    var self = this;
    self.task = ko.mapping.fromJS({
        begin: new Date(),
        end: null,
        assign: [],
        note: ''
        //        state: ['created'],
    });

    self.users = ko.meteor.find(Meteor.users, {});
    self.add = function () {
        var task = ko.toJS(self.task);
        task.state = [{
            name: 'created',
            date: new Date()
        }];
        Meteor.call('crateTask', task, function (err, result) {
            if (err) {
                console.dir(err);
            } else {
                self.modal.modal('hide');
            }
        })
    };
    return self;
}