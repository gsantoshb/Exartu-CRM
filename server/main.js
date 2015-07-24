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

  var keepAliveTime = 60000; //one minute
  SyncedCron.add({
    name: 'Listen resume parser emails',
    schedule: function(parser) {
      // parser is a later.parse object
      return parser.text('every 30 seconds');
    },
    job: function() {
      var state = MailListenerState.findOne();
      if (!state){
        state = {};
        state._id = MailListenerState.insert({timeStamp: Date.now()});
      }else {
        // if the value is ok then do nothing, return
        if ((Date.now() - state.timeStamp) < keepAliveTime) {
          console.log('Its alive!', Date.now() - state.timeStamp);
          return;
        }
      }
      console.log('I\'m Listening!!');

      // else the mailMonitor is down and i should start listening
      EmailManager.emailListenerResumeParser(ExartuConfig.ResumeParserEmail, ExartuConfig.ResumeParserEmailPassword,  "imap.gmail.com", 993, function (e) {
        console.log('I\'m down...', e);
        clearInterval(keepAliveIntervalId);
      });

      // keep alive
      var keepAliveIntervalId = Meteor.setInterval(function () {
        console.log('I\'m still here!');
        MailListenerState.update(state._id, {$set: {timeStamp: new Date().getTime()}});
      }, keepAliveTime/2);
    },
    fixIntendedAt: function (intendedAt) {
      var miliseconds = intendedAt.getTime();
      miliseconds = miliseconds - ( miliseconds % 1000 );
      return new Date(miliseconds);
    }
  });


  SyncedCron.start();



});



// start cron: only one dyno should actually run the cron
// also if the dyno with the cron goes down other dyno should run it

//var keepAliveTime = 5000;
//Croner.start('mailListener', 2000, function () {
//  var state = MailListenerState.findOne();
//  if (!state){
//    state = {};
//    state._id = MailListenerState.insert({timeStamp: new Date().getTime()});
//  }else {
//    // if the value is ok then do nothing, return
//    if ((state.timeStamp - new Date().getTime() ) < keepAliveTime){
//      return;
//    }
//
//    // else the mailMonitor is down and i should start listening
//    console.log('I\'m listening now');
//
//    // keep alive
//    Meteor.setInterval(function () {
//      MailListenerState.update(state._id, {$set: {timeStamp: new Date().getTime()}});
//    }, keepAliveTime/2);
//  }
//});

//
MailListenerState = new Mongo.Collection('mailListenerState');
//CronerCollection = new Mongo.Collection('cronerCollection');
//Croner = {
//  start: function (id, interval, fn) {
//    var cronerData = CronerCollection.findOne(id);
//    if (!cronerData){
//      try{
//        cronerData.insert({_id: id});
//        var intervalId = Meteor.setInterval(fn, interval);
//      }catch (e){
//        consol.log(e);
//      }
//    } else {
//      console.log('croner with id ' + id + ' already started');
//    }
//  }
//}
