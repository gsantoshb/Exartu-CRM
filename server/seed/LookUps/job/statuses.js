_.forEach([
  {
    displayName: 'Inactive',lookUpActions:[Enums.lookUpAction.Implies_Inactive]
  },
  {
    displayName: 'Unfilled',lookUpActions:[Enums.lookUpAction.Implies_Active]
  },
  {
    displayName: 'Filled',lookUpActions:[Enums.lookUpAction.Implies_Active]
  }
],
  function (item) {
    item.codeType = Enums.lookUpTypes.job.status.code;
    systemLookUps.push(item);
  }
);