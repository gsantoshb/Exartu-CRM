Accounts.onCreateUser(function(options, user) {
	if (options.hierId == null) {
		options.hierId = createHier(options.email.split('@')[0]);
	}
	
	user.hierId = options.hierId;
	user._id = Random.id();
	Hierarchies.update({ _id: user.hierId }, {$addToSet: { users: user._id }});
	
	return user;
});
