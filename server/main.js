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
    if(ExartuConfig[option] == undefined)
      console.log('Environment variable not set: ' + option);
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
  //if (ExartuConfig.ES_HOST && ExartuConfig.ES_AUTH)
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
  //if (!__meteor_runtime_config__.git_tag) {
  //  var result = HTTP.get('https://api.github.com/repos/Exartu/Exartu-CRM/tags', {headers: {'User-Agent': 'Aida Creative'}});
  //  if (result) {
  //    var lastTag = JSON.parse(result.content)[0];
  //    if (lastTag) {
  //      __meteor_runtime_config__.git_tag = lastTag.name;
  //    }
  //  }
  //}

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

  var keepAliveTime = 5 * 60 * 1000; //5 minutes

  // Quick explanation:
  // the SyncedCron will keep calling your job method but, if you have 2 or more servers running
  // against the same database only one of them will call the job, the other/s will do nothing (useful for heroku's dynos)
  // Every time the job is called it will check for the status of the mail listener, if the status hasn't been updated recently
  // this server will run the mail listener and it will keep updating the state, otherwise it will do nothing.

  // Note: The SyncedCron package doesn't actually do wat it says, because it has a huge bug with the intendedAt
  // that's why we use a local 'hacked' copy with the fixIntendedAt. in this case taking the milliseconds out of the date
  // fixes it but with others schedules I'm not really sure what will happen

  SyncedCron.add({
    name: 'Listen resume parser emails',
    schedule: function(parser) {
      // parser is a later.parse object
      return parser.text('every 1 minute');
    },
    job: function() {
      var state = MailListenerState.findOne();
      if (!state){
        state = {};
        state._id = MailListenerState.insert({timeStamp: Date.now()});
      }else {
        // if the value is ok then do nothing, return
        if ((Date.now() - state.timeStamp) < keepAliveTime) {
          return;
        }
      }
      // keep alive
      var keepAlive = function () {
        MailListenerState.update(state._id, {$set: {timeStamp: new Date().getTime()}});
      };
      keepAlive();
      var keepAliveIntervalId = Meteor.setInterval(keepAlive, keepAliveTime/2);

      try {
        // start listening
        EmailManager.emailListenerResumeParser(ExartuConfig.ResumeParserEmail, ExartuConfig.ResumeParserEmailPassword,  "imap.gmail.com", 993, function (e) {
          console.log('emailListener Failed', e);
          clearInterval(keepAliveIntervalId);
        });
      } catch (e){
        console.log('exception cached', e);
        clearInterval(keepAliveIntervalId);
      }
    },
    fixIntendedAt: function (intendedAt) {
      var milliseconds = intendedAt.getTime();
      milliseconds = milliseconds - ( milliseconds % 1000 );
      return new Date(milliseconds);
    }
  });
  SyncedCron.start();
});
SyncedCron.config({
  // Log job run details to console
  log: false
});
MailListenerState = new Mongo.Collection('mailListenerState');