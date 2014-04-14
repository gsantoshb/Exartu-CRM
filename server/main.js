var dbSeed = {
    seedSystemLookUps: seedSystemLookUps,
    seedSystemObjTypes: seedSystemObjTypes,
    seedSystemRelations: seedSystemRelations,
    seedSystemRoles: seedSystemRoles,
    seedSystemContactMethods: seedSystemContactMethods
}

Meteor.startup(function () {
    /*
     * Seed database
     * Execute all function defined in seedSystemObjTypes
     */
    debugger;
    _.forEach(dbSeed, function (seedFn) {
        seedFn.call();
    });

    var accountsConfig = Accounts.loginServiceConfiguration._collection;
    var googleConfig = accountsConfig.findOne({
        "service": 'google'
    });
    if (!ExartuConfig) {
        console.log('can not configure google login or smtp credentials because no Exartu config info is set up');
    } else {
        //read the config
        if (!ExartuConfig.GoogleConfig_clientId || !ExartuConfig.GoogleConfig_clientSecret) {
            console.log('can not config google login, client\'s credential not found');

        } else {
            ServiceConfiguration.configurations.insert({
                service: "google",
                clientId: ExartuConfig.GoogleConfig_clientId,
                secret: ExartuConfig.GoogleConfig_clientSecret
            });
            console.log('google accounts configured successfully');
        }
    }

  FS.debug = true;
});