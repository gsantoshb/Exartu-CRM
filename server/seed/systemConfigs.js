seedSystemConfigs = function (){
  var systemConfig =
    [
      {
        configName: 'stripePublishableKey',
        configValue: ExartuConfig.stripePublishableKey
      },
      {
        configName: 'stripeSecretKey',
        configValue: ExartuConfig.stripeSecretKey
      }
    ];

  _.forEach(systemConfig, function (config) {
    var oldConfig=  SystemConfigs.findOne({ configName: config.configName });
    if ( !oldConfig ) {
      SystemConfigs.insert({ configName: config.configName, configValue: config.configValue });
    } else{
      SystemConfigs.update({ _id: oldConfig._id }, { $set:{ configName: config.configName, configValue: config.configValue }});
    }
  })
}