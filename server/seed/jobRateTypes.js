seedSystemJobRateTypes = function (){
  var systemJobRateTypes =
    [
      {
        displayName: 'Regular',
        description: ''
      },
      {
        displayName: 'Over Time',
        description: ''
      },
      {
        displayName: 'Double Time',
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