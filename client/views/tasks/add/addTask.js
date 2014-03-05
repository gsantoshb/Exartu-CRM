Template.addEditTask.viewModel = function (task) {
	var self = this;
	if (task) {
		if (_.isString(task))
			task = Tasks.findOne({
				_id: task
			});

		self.task = ko.validatedObservable({
			begin: ko.observable(task.begin).extend({
				required: true
			}),
			end: ko.observable(task.end).extend({
				required: true
			}),

			assign: ko.observableArray(task.assign).extend({
				required: true
			}),
			note: ko.observable(task.note).extend({
				required: true
			}),
			isCompleted: ko.observable(task.completed != null),

			completed: ko.observable(task.completed).extend({
				required: false
			}),
		});

	} else {
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
			note: ko.observable().extend({
				required: true
			}),
			isCompleted: ko.observable(false),
			completed: ko.observable(null),
		});
	}
	var oldValuecompleted = new Date();
	self.task().isCompleted.subscribe(function (value) {
		if (value) {
			self.task().completed(oldValuecompleted);
		} else {
			oldValuecompleted = self.task().completed();
			self.task().completed(null);
		}
	})
	self.users = ko.meteor.find(Meteor.users, {});
	self.add = function () {
		if (!self.task.isValid()) {
			self.task.errors.showAllMessages();
			return;
		}

		var newTask = ko.toJS(self.task);

		delete newTask.isCompleted;

		if (task) {
			Tasks.update({
				_id: task._id
			}, {
				$set: {
					begin: newTask.begin,
					end: newTask.end,
					assign: newTask.assign,
					note: newTask.note,
					completed: newTask.completed,
				}
			})
			self.close();
		} else {
			Meteor.call('crateTask', newTask, function (err, result) {
				if (err) {
					console.dir(err);
				} else {
					self.close();
				}
			})
		}
	};
	return self;
}