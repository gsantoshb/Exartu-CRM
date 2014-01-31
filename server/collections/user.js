Accounts.onCreateUser(function (options, user) {
	//console.dir(options);
	//console.dir(user);

	var userEmail = user.email;
	if (user.services) {
		if (user.services.google) {
			//todo: check if the account is already in the database
			userEmail = user.services.google.email;
			user.emails = [{
				"address": userEmail,
				"verified": true
            }];

		}
	}
	if (options.profile.hierId == null) {
		options.profile.hierId = Meteor.call('createHier', {
			name: userEmail.split('@')[0]
		});
	}

	user.hierId = options.profile.hierId;
	user._id = Random.id();
	Hierarchies.update({
		_id: user.hierId
	}, {
		$addToSet: {
			users: user._id
		}
	});

	return user;
});

/*
 * extending the user data that is sended to the client
 */
Meteor.publish("userData", function () {
	var currentHierId = Meteor.users.findOne({
		_id: this.userId
	}).hierId;

	return Meteor.users.find({
		hierId: currentHierId
	}, {
		fields: {
			'username': 1,
			'emails': 1,
			'services.google.picture': 1,
			"hierId": 1,
			"createdAt": 1,
		}
	});
});

Meteor.publish("users", function () {
	return Meteor.users.find();
});

Meteor.methods({
	addHierUser: function (user, hierId) {
		hierId = hierId || Meteor.user().hierId;
		var options = {};
		options.username = user.username;
		options.email = user.email;
		options.password = user.password;
		options.profile = {
			hierId: hierId,
			// more information from user
		}
		return Accounts.createUser(options);
	}
});