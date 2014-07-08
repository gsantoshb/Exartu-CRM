seedSystemJobRateTypes = function (){
  var systemJobRateTypes =
    [
      {
        displayName: 'RegularTime',
        description: ''
      },
      {
        displayName: 'OverTime',
        description: ''
      },
      {
        displayName: 'DoubleTime',
        description: ''
      }, {
        displayName: 'Salary',
        description: ''
      },
    ];

  _.forEach(systemJobRateTypes, function (jrType) {
    var oldRT=  JobRateTypes.findOne({
      hierId: ExartuConfig.SystemHierarchyId,
      displayName: jrType.displayName
    });
    if ( ! oldRT ){
      JobRateTypes.insert({
        hierId: ExartuConfig.SystemHierarchyId,
        displayName: jrType.displayName
      });
    }else{
      JobRateTypes.update({
        hierId: ExartuConfig.SystemHierarchyId,
        displayName: jrType.displayName
      },{
        $set: {description: jrType.description}
      });
    }
  })
}