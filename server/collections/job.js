Meteor.publish('jobs', function () {
	var user = Meteor.users.findOne({
		_id: this.userId
	});

	if (!user)
		return false;

	return Jobs.find({
		hierId: user.hierId
	});
})

Meteor.startup(function () {
	Meteor.methods({
		addJob: function (job) {
			var user = Meteor.user();
			if (user == null)
				throw new Meteor.Error(401, "Please login");

			if (extendAndValidate(job)) {
				Jobs.insert(job);
			} else {
				console.error('Job is not valid')
				console.dir(job);
			}
		}
	});
});

Jobs.allow({
	update: function () {
		return true;
	}
});

Jobs.before.insert(function (userId, doc) {
	var user = Meteor.user();
	doc.hierId = user.hierId;
	doc.userId = user._id;

	doc.createdAt = Date.now();
});

var extendAndValidate = function (job) {
	//job's things
	if (!job.assignments)
		job.assignments = [];
	if (!job.candidates)
		job.assignments = [];

	if (!job.type || !job.type.length) {
		console.log('the job must have a type');
		return false;
	}

	var v = true;
	//add the services defined in the types
	_.forEach(job.type, function (type) {
		var ObjType = _.findWhere(ObjectTypes, {
			_id: type
		});
		_.forEach(ObjType.services, function (service) {
			job[service] = [];
		});
		v = v && validateObjType(job, type);
	});

	return v && validateJob(job);
};

var validateJob = function (job) {
	return true;
};