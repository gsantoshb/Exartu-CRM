// Get HEAD's hash commit
var git = Meteor.npmRequire('git-rev');
git.branch(function (branch) {
  __meteor_runtime_config__.git_branch = branch.trim();
});
git.tag(function (currentTag) {
  __meteor_runtime_config__.git_tag = currentTag.trim();
});


var dbSeed = [
//  seedSystemLookUps,
  seedSystemConfigs,
  seedSystemRoles,
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
  Meteor.setTimeout(function () {
    Migrations.migrateTo('latest');
  }, 5000);

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
    console.log('can not configure google login or smtp credentials because no Aïda config info is set up');
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

  var appId = ExartuConfig.APM_ID;
  var secret = ExartuConfig.APM_SECRET;
  if (appId && secret) {
    Kadira.connect(appId, secret);
  }


  // Elasticsearch
  if (ExartuConfig.ES_HOST && ExartuConfig.ES_AUTH)
    ES.connect({
      host: ExartuConfig.ES_HOST,
      protocol: ExartuConfig.ES_PROTOCOL,
      port: ExartuConfig.ES_PORT,
      auth: ExartuConfig.ES_AUTH
    });

  // Connect with AWS S3
  S3Storage = new ExternalStorage.Storage({
    accessKeyId: ExartuConfig.AWS_accessKeyId,
    secretAccessKey: ExartuConfig.AWS_secretAccessKey,
    region: ExartuConfig.AWS_S3_region,
    bucket: ExartuConfig.AWS_S3_bucket
  });

  // Twilio
  twilio = ExartuConfig.TW_accountSID && ExartuConfig.TW_authToken ?
    Twilio(ExartuConfig.TW_accountSID, ExartuConfig.TW_authToken)
    : undefined;

  // Make Applicant Center url available to the client
  __meteor_runtime_config__.applicantCenterUrl = ExartuConfig.ApplicantCenter_URL;

  // Find the latest repository tag if not in a git directory to make it available to the client
  if (!__meteor_runtime_config__.git_tag) {
    var result = HTTP.get('https://api.github.com/repos/Exartu/Exartu-CRM/tags', {headers: {'User-Agent': 'Aida Creative'}});
    if (result) {
      var lastTag = JSON.parse(result.content)[0];
      if (lastTag) {
        __meteor_runtime_config__.git_tag = lastTag.name;
      }
    }
  }

  //Active all hierarchys mail listener
  var hierWithSubscription = Hierarchies.find({mailSubscription: {$exists: true}}).fetch();
  _.forEach(hierWithSubscription, function(h){
    var decryptedPass = CryptoJS.AES.decrypt(h.mailSubscription.password, ExartuConfig.EncryptCode);

    Meteor.call('emailListener', h.mailSubscription.mail, decryptedPass.toString(CryptoJS.enc.Utf8),  h.mailSubscription.host, h.mailSubscription.port, h._id, function (err, result) {
      if(err){
        throw new Error('something wrong happened on hierarchies mail subscriptions');

      }
      else{
        console.log("hierarchy mail listener up", h._id);
      }
    });
  });

});
