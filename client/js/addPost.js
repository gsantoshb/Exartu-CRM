Template.addPost.viewmodel = function (contactableId) {
	var self = this;

	self.newPost = ko.observable("");

	self.adding = ko.observable(false);
	self.addPost = function () {
		self.adding(true);
		Meteor.call('addContactablePost', contactableId, {
			content: self.newPost()
		}, function (err, result) {
			if (!err) {
				self.adding(false);
				self.newPost("");
				$('#addPostModal').modal('hide');
			}
		});
	}

	return self;
}