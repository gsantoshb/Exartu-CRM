var dbSeed = [
  seedSystemLookUps,
  seedSystemRoles,
  seedSystemContactMethods,
  seedSystemJobRateTypes,
  seedSubscriptionPlans
];

var handleConfiguration = function () {
  if (!ExartuConfig)
    return;

  _.forEach(_.keys(ExartuConfig), function (option) {
    ExartuConfig[option] = ExartuConfig[option] || process.env[option];
  });
}

Meteor.startup(function () {
  console.log(Meteor.settings);

  // Run migrations
  Migrations.migrateTo('latest');

  // Seed database
  // Execute all function defined in seedSystemObjTypes
  _.forEach(dbSeed, function (seedFn) {
    seedFn.call();
  });

  // Load system configuration
  Accounts.config({
    sendVerificationEmail: true
  });

  handleConfiguration();
  var accountsConfig = Accounts.loginServiceConfiguration._collection;

  var googleConfig = accountsConfig.findOne({
    "service": 'google'
  });
  if (!ExartuConfig) {
    console.log('can not configure google login or smtp credentials because no Exartu config info is set up');
  } else if (!googleConfig){
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

  var appId = process.env['APM_ID'] || '5RiToDN7BQAe8WG9X';
  var secret = process.env['APM_SECRET'] || '0b92beaf-e743-4a4c-a122-69d74e8bc1df';
  Kadira.connect(appId, secret )
});