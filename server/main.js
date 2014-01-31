var dbSeed = {
	seedSystemLookUps: seedSystemLookUps,
	seedSystemObjTypes: seedSystemObjTypes,
	seedSystemRelations: seedSystemRelations,
	seedSystemRoles: seedSystemRoles,
}

Meteor.startup(function () {
	/*
	 * Seed database
	 * Execute all function defined in seedSystemObjTypes
	 */
	_.forEach(dbSeed, function (seedFn) {
		seedFn.call();
	});
	var accountsConfig = Accounts.loginServiceConfiguration._collection;
	var googleConfig = accountsConfig.findOne({
		"service": 'google'
	});

	if (!googleConfig) {
		//read the config
		if (!GoogleConfig) {
			console.log('can not config google login, client\'s credential not found');

		} else {
			accountsConfig.insert({
				service: "google",
				clientId: GoogleConfig.clientId,
				secret: GoogleConfig.clientSecret
			});
			console.log('google accounts configured successfully');
		}
	}
});